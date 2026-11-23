import { forwardRef, ReactNode, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Html, Lightformer } from "@react-three/drei";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import GBAModel, {
  GBAButton,
  GBAModelHandle,
  SCREEN_CENTER,
  SCREEN_SIZE,
} from "./GBAModel";

export type ViewMode = "full" | "screen";

export type GBASceneHandle = {
  press: (btn: GBAButton) => void;
};

type Props = {
  shellColor: string;
  translucent: boolean;
  view: ViewMode;
  onButton: (btn: GBAButton) => void;
  screen: ReactNode;
};

// Píxeles CSS de la pantalla → unidades de mundo (drei: 1px = distanceFactor/400).
const SCREEN_PX = 480;
const DISTANCE_FACTOR = (400 * SCREEN_SIZE.w) / SCREEN_PX;
const FOV = 35;

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Distancia de cámara para que un rectángulo w×h quepa en el viewport. */
function fitDistance(w: number, h: number, aspect: number) {
  const t = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  return Math.max(h / (2 * t), w / (2 * t * aspect));
}

function CameraRig({ view }: { view: ViewMode }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const first = useRef(true);

  useEffect(() => {
    const aspect = size.width / size.height;
    const toScreen = view === "screen";
    const d = toScreen
      ? fitDistance(SCREEN_SIZE.w * 1.08, SCREEN_SIZE.h * 1.1, aspect)
      : fitDistance(6.0, 3.9, aspect);
    const look = toScreen ? SCREEN_CENTER.clone() : new THREE.Vector3(0, 0.05, 0);
    const pos = new THREE.Vector3(look.x, look.y, look.z + d);

    const apply = () => camera.lookAt(target.current);
    if (first.current || prefersReducedMotion()) {
      first.current = false;
      camera.position.copy(pos);
      target.current.copy(look);
      apply();
      return;
    }
    const tl = gsap.timeline({ defaults: { duration: 0.9, ease: "power3.inOut" }, onUpdate: apply });
    tl.to(camera.position, { x: pos.x, y: pos.y, z: pos.z }, 0).to(
      target.current,
      { x: look.x, y: look.y, z: look.z },
      0,
    );
    return () => {
      tl.kill();
    };
  }, [view, size.width, size.height, camera]);

  return null;
}

type RigProps = Omit<Props, "screen"> & { screen: ReactNode };

const ConsoleRig = forwardRef<GBASceneHandle, RigProps>(function ConsoleRig(
  { shellColor, translucent, view, onButton, screen },
  ref,
) {
  const intro = useRef<THREE.Group>(null); // animación de entrada
  const float = useRef<THREE.Group>(null); // flotación idle
  const tilt = useRef<THREE.Group>(null); // sigue al puntero
  const model = useRef<GBAModelHandle>(null);
  const floatTween = useRef<gsap.core.Tween | null>(null);
  const viewRef = useRef(view);

  useImperativeHandle(ref, () => ({
    press: (btn) => model.current?.press(btn),
  }));

  // Entrada: la consola sube girando, aterriza y se enciende el LED.
  useGSAP(() => {
    const g = intro.current!;
    const mm = gsap.matchMedia();
    mm.add(
      { reduce: "(prefers-reduced-motion: reduce)", ok: "(prefers-reduced-motion: no-preference)" },
      (ctx) => {
        if (ctx.conditions?.reduce) {
          model.current?.setPower(true);
          return;
        }
        const tl = gsap.timeline();
        tl.from(g.position, { y: -5, duration: 1.2, ease: "back.out(1.1)" }, 0)
          .from(g.rotation, { x: -1.4, y: 1.1, z: 0.25, duration: 1.4, ease: "power3.out" }, 0)
          .add(() => model.current?.setPower(true), 0.9);
        // Flotación suave tras aterrizar.
        tl.add(() => {
          if (float.current)
            floatTween.current = gsap.to(float.current.position, {
              y: 0.05,
              duration: 2.2,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              paused: viewRef.current === "screen",
            });
        });
      },
    );
  }, []);

  // Inclinación según el puntero (desactivada en vista de pantalla para leer bien).
  useEffect(() => {
    viewRef.current = view;
    const g = tilt.current;
    if (!g || prefersReducedMotion()) return;
    if (view === "screen") {
      // En la vista de pantalla la consola se queda quieta para poder leer.
      floatTween.current?.pause();
      if (float.current) gsap.to(float.current.position, { y: 0, duration: 0.5 });
      gsap.to(g.rotation, { x: 0, y: 0, duration: 0.6 });
      return;
    }
    floatTween.current?.resume();
    const rx = gsap.quickTo(g.rotation, "x", { duration: 0.8, ease: "power3.out" });
    const ry = gsap.quickTo(g.rotation, "y", { duration: 0.8, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      ry(nx * 0.18);
      rx(ny * 0.12);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [view]);

  return (
    <group ref={intro}>
      <group ref={float}>
        <group ref={tilt}>
          <GBAModel ref={model} shellColor={shellColor} translucent={translucent} onButton={onButton}>
            <Html
              transform
              distanceFactor={DISTANCE_FACTOR}
              position={SCREEN_CENTER.toArray()}
              zIndexRange={[20, 0]}
              style={{ width: SCREEN_PX, height: (SCREEN_PX * SCREEN_SIZE.h) / SCREEN_SIZE.w }}
            >
              {screen}
            </Html>
          </GBAModel>
        </group>
      </group>
    </group>
  );
});

const GBAScene = forwardRef<GBASceneHandle, Props>(function GBAScene(props, ref) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ fov: FOV, position: [0, 0, 9], near: 0.1, far: 50 }}
      gl={{ antialias: true }}
      onPointerMissed={() => (document.body.style.cursor = "auto")}
    >
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[3, 5, 6]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-4, -2, 3]} intensity={0.4} color="#b9c7ff" />
      {/* Entorno generado en local (sin descargar HDRIs) */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 4]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="ring" intensity={2} color="#9fb4ff" position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={2} />
      </Environment>

      <CameraRig view={props.view} />
      <ConsoleRig ref={ref} {...props} />

      <ContactShadows position={[0, -1.75, 0]} opacity={0.45} scale={10} blur={2.6} far={4} />
    </Canvas>
  );
});

export default GBAScene;
