import {
  forwardRef,
  ReactNode,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import * as THREE from "three";
import { ThreeEvent } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import gsap from "gsap";

export type GBAButton =
  | "up"
  | "down"
  | "left"
  | "right"
  | "a"
  | "b"
  | "l"
  | "r"
  | "start"
  | "select";

export type GBAModelHandle = {
  press: (btn: GBAButton) => void;
  setPower: (on: boolean) => void;
};

type Props = {
  shellColor: string;
  translucent: boolean;
  onButton: (btn: GBAButton) => void;
  children?: ReactNode; // la pantalla (Html) se monta dentro del modelo
};

// ---------------------------------------------------------------------------
// Proporciones tomadas de una GBA real (144.5 × 82 mm ≈ 1.76 : 1).
// Silueta: rectángulo ancho con esquinas superiores cerradas (donde van L/R)
// y esquinas inferiores amplias (los “grips”). 1 u ≈ 31 mm.
// ---------------------------------------------------------------------------
const HALF_W = 2.35;
const TOP = 1.12;
const BOTTOM = -1.22;
const R_TOP = 0.78; // radio esquinas superiores
const R_BOTTOM = 1.05; // radio esquinas inferiores
const DEPTH = 0.42;
const BEVEL = 0.08;
export const FRONT_Z = DEPTH / 2 + BEVEL;

// Lente (cristal oscuro) y pantalla: la lente llega casi al borde superior.
const LENS_W = 2.62;
const LENS_TOP = 0.98;
const LENS_BOTTOM = -0.96;
export const SCREEN_SIZE = { w: 1.92, h: 1.28 };
export const SCREEN_CENTER = new THREE.Vector3(
  0,
  LENS_TOP - 0.15 - SCREEN_SIZE.h / 2,
  FRONT_Z + 0.032,
);

// Paleta de la GBA original: botones y gatillos gris claro, lente gris oscuro.
const LIGHT_GRAY = "#d2d2d8";
const BUMPER_GRAY = "#c4c5cc";
const LENS = "#34343b";

/** Rectángulo con radios distintos arriba/abajo (sentido antihorario). */
function roundedShape(
  halfW: number,
  top: number,
  bottom: number,
  rTop: number,
  rBottom: number,
  bottomBulge = 0,
) {
  // Los arcos se conectan solos con una recta desde el punto actual.
  const p = new THREE.Path();
  p.moveTo(-halfW + rBottom, bottom);
  p.quadraticCurveTo(0, bottom - 2 * bottomBulge, halfW - rBottom, bottom); // borde inferior abombado
  p.absarc(halfW - rBottom, bottom + rBottom, rBottom, -Math.PI / 2, 0, false);
  p.absarc(halfW - rTop, top - rTop, rTop, 0, Math.PI / 2, false);
  p.absarc(-halfW + rTop, top - rTop, rTop, Math.PI / 2, Math.PI, false);
  p.absarc(-halfW + rBottom, bottom + rBottom, rBottom, Math.PI, (3 * Math.PI) / 2, false);

  // Quitamos puntos casi duplicados (cos/sin no dan 0 exacto en π/2, π…):
  // generan aristas de longitud ~1e-16 que rompen el bisel (la “muesca”).
  const pts = p.getPoints(24);
  const clean: THREE.Vector2[] = [];
  for (const pt of pts) {
    const last = clean[clean.length - 1];
    if (!last || last.distanceTo(pt) > 1e-4) clean.push(pt);
  }
  if (clean.length > 1 && clean[0].distanceTo(clean[clean.length - 1]) < 1e-4) clean.pop();
  return new THREE.Shape(clean);
}

function useShellGeometry() {
  return useMemo(() => {
    const s = roundedShape(HALF_W, TOP, BOTTOM, R_TOP, R_BOTTOM, 0.04);
    const g = new THREE.ExtrudeGeometry(s, {
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: BEVEL,
      bevelSize: BEVEL,
      bevelSegments: 10,
      curveSegments: 64,
    });
    g.translate(0, 0, -DEPTH / 2);
    g.computeVertexNormals();
    return g;
  }, []);
}

function useLensGeometry() {
  return useMemo(() => {
    // Lente con el borde inferior algo más ancho/abombado, como la real.
    const s = roundedShape(LENS_W / 2, LENS_TOP, LENS_BOTTOM, 0.14, 0.3, 0.05);
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.012,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 3,
      curveSegments: 32,
    });
    g.computeVertexNormals();
    return g;
  }, []);
}

const setCursor = (c: string) => () => {
  document.body.style.cursor = c;
};

const tint = (hex: string, amount: number) => {
  const c = new THREE.Color(hex);
  return amount >= 0
    ? c.lerp(new THREE.Color("#ffffff"), amount).getStyle()
    : c.multiplyScalar(1 + amount).getStyle();
};

// Posiciones de los controles (frente)
const DPAD = { x: -1.72, y: 0.36 };
const START = { x: -1.44, y: -0.3 };
const SELECT = { x: -1.56, y: -0.52 };
const BTN_A = { x: 1.94, y: 0.1 };
const BTN_B = { x: 1.56, y: -0.04 };

const GBAModel = forwardRef<GBAModelHandle, Props>(function GBAModel(
  { shellColor, translucent, onButton, children },
  ref,
) {
  const shell = useShellGeometry();
  const lens = useLensGeometry();
  const dpad = useRef<THREE.Group>(null);
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  const l = useRef<THREE.Group>(null);
  const r = useRef<THREE.Group>(null);
  const start = useRef<THREE.Mesh>(null);
  const select = useRef<THREE.Mesh>(null);
  const led = useRef<THREE.MeshStandardMaterial>(null);

  useImperativeHandle(ref, () => ({
    press(btn) {
      const sink = (obj: THREE.Object3D | null, axis: "z" | "y" = "z", amount = -0.03) => {
        if (!obj) return;
        gsap.killTweensOf(obj.position);
        const base = obj.userData.base ?? (obj.userData.base = obj.position[axis]);
        gsap.fromTo(
          obj.position,
          { [axis]: base + amount },
          { [axis]: base, duration: 0.18, ease: "power2.out" },
        );
      };
      const tilt = (x: number, y: number) => {
        if (!dpad.current) return;
        gsap.killTweensOf(dpad.current.rotation);
        gsap.fromTo(dpad.current.rotation, { x, y }, { x: 0, y: 0, duration: 0.2, ease: "power2.out" });
      };
      switch (btn) {
        case "up": return tilt(-0.22, 0);
        case "down": return tilt(0.22, 0);
        case "left": return tilt(0, -0.22);
        case "right": return tilt(0, 0.22);
        case "a": return sink(a.current);
        case "b": return sink(b.current);
        case "start": return sink(start.current, "z", -0.02);
        case "select": return sink(select.current, "z", -0.02);
        case "l": return sink(l.current, "y", -0.05);
        case "r": return sink(r.current, "y", -0.05);
      }
    },
    setPower(on) {
      if (led.current)
        gsap.to(led.current, { emissiveIntensity: on ? 1.4 : 0, duration: 0.4 });
    },
  }));

  const click = (btn: GBAButton) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onButton(btn);
  };
  const hover = {
    onPointerOver: setCursor("pointer"),
    onPointerOut: setCursor("auto"),
  };

  // Tonos derivados de la carcasa: hundido muy sutil, ranuras y serigrafía.
  const dimple = useMemo(() => tint(shellColor, -0.1), [shellColor]);
  const slot = useMemo(() => tint(shellColor, -0.45), [shellColor]);
  const engraving = useMemo(() => tint(shellColor, 0.4), [shellColor]);

  // Gatillos L/R: tapas grises cortas en las esquinas superiores, hacia atrás.
  // Siguen el arco de la esquina (radio R_TOP) con un toro parcial.
  const bumper = (side: 1 | -1, refObj: typeof l, name: GBAButton) => {
    const startAngle = 0.28;
    const arc = 1.0;
    const rotationZ = side === 1 ? startAngle : Math.PI - startAngle - arc;
    return (
      <group
        ref={refObj}
        position={[side * (HALF_W - R_TOP), TOP - R_TOP, -0.05]}
        scale={[1, 1, 1.55]}
      >
        <mesh rotation={[0, 0, rotationZ]} onPointerDown={click(name)} {...hover} castShadow>
          <torusGeometry args={[R_TOP + BEVEL * 0.8, 0.12, 24, 48, arc]} />
          <meshStandardMaterial color={BUMPER_GRAY} roughness={0.55} />
        </mesh>
      </group>
    );
  };

  // Botón redondo gris con un hundimiento apenas más oscuro que la carcasa.
  const roundButton = (
    name: GBAButton,
    refObj: typeof a,
    x: number,
    y: number,
    radius: number,
    height: number,
  ) => (
    <group key={name}>
      <mesh position={[x, y, FRONT_Z - 0.003]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius * 1.18, radius * 1.18, 0.012, 48]} />
        <meshStandardMaterial color={dimple} roughness={0.55} />
      </mesh>
      <mesh
        ref={refObj}
        position={[x, y, FRONT_Z + height / 2 - 0.005]}
        rotation={[Math.PI / 2, 0, 0]}
        onPointerDown={click(name)}
        {...hover}
        castShadow
      >
        <cylinderGeometry args={[radius * 0.96, radius, height, 48]} />
        <meshStandardMaterial color={LIGHT_GRAY} roughness={0.42} />
      </mesh>
    </group>
  );

  return (
    <group>
      {/* Carcasa */}
      <mesh geometry={shell} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={shellColor}
          roughness={0.5}
          metalness={0}
          clearcoat={0.3}
          clearcoatRoughness={0.45}
          transmission={translucent ? 0.2 : 0}
          thickness={0.6}
          ior={1.45}
        />
      </mesh>

      {bumper(-1, l, "l")}
      {bumper(1, r, "r")}

      {/* Lente: una sola pieza plana pegada a la carcasa (sin doble borde) */}
      <mesh geometry={lens} position={[0, 0, FRONT_Z - 0.006]}>
        <meshStandardMaterial color={LENS} roughness={0.22} metalness={0.1} />
      </mesh>
      <mesh position={[0, SCREEN_CENTER.y, FRONT_Z + 0.022]}>
        <planeGeometry args={[SCREEN_SIZE.w + 0.03, SCREEN_SIZE.h + 0.03]} />
        <meshBasicMaterial color="#0b0f0d" />
      </mesh>
      <Text
        position={[-0.04, LENS_BOTTOM + 0.2, FRONT_Z + 0.024]}
        fontSize={0.085}
        letterSpacing={0.04}
        color="#e4e4ea"
        anchorX="right"
        anchorY="middle"
        fontWeight={700}
      >
        POKéDEX
      </Text>
      <Text
        position={[0.01, LENS_BOTTOM + 0.2, FRONT_Z + 0.024]}
        fontSize={0.07}
        letterSpacing={0.18}
        color="#e4e4ea"
        anchorX="left"
        anchorY="middle"
      >
        ADVANCE
      </Text>
      {children}

      {/* Marca en relieve sobre la esquina superior derecha de la lente */}
      <Text position={[1.62, 0.9, FRONT_Z + 0.002]} fontSize={0.065} color={engraving} anchorX="center" letterSpacing={0.05}>
        POKéDEX
      </Text>

      {/* LED de encendido */}
      <mesh position={[1.52, 0.6, FRONT_Z + 0.006]}>
        <sphereGeometry args={[0.026, 16, 16]} />
        <meshStandardMaterial ref={led} color="#3df57a" emissive="#3df57a" emissiveIntensity={0} />
      </mesh>
      <Text position={[1.59, 0.6, FRONT_Z + 0.002]} fontSize={0.04} color={engraving} anchorX="left" anchorY="middle">
        POWER
      </Text>

      {/* Cruceta: directamente sobre la carcasa, sin disco oscuro */}
      <mesh position={[DPAD.x, DPAD.y, FRONT_Z - 0.003]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.33, 0.33, 0.012, 64]} />
        <meshStandardMaterial color={dimple} roughness={0.55} />
      </mesh>
      <group ref={dpad} position={[DPAD.x, DPAD.y, FRONT_Z + 0.035]}>
        {[
          [0.5, 0.165],
          [0.165, 0.5],
        ].map(([w, h], i) => (
          <mesh key={i} castShadow>
            <boxGeometry args={[w, h, 0.07]} />
            <meshStandardMaterial color={LIGHT_GRAY} roughness={0.45} />
          </mesh>
        ))}
        {/* Hendidura central */}
        <mesh position={[0, 0, 0.036]}>
          <circleGeometry args={[0.045, 32]} />
          <meshStandardMaterial color="#b9b9c1" roughness={0.6} />
        </mesh>
        {/* Zonas de clic invisibles por dirección */}
        {(
          [
            ["up", 0, 0.17],
            ["down", 0, -0.17],
            ["left", -0.17, 0],
            ["right", 0.17, 0],
          ] as const
        ).map(([dir, x, y]) => (
          <mesh key={dir} position={[x, y, 0.05]} onPointerDown={click(dir)} {...hover}>
            <planeGeometry args={[0.2, 0.2]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        ))}
      </group>

      {/* START / SELECT: pequeños, en diagonal bajo la cruceta */}
      {roundButton("start", start, START.x, START.y, 0.055, 0.04)}
      {roundButton("select", select, SELECT.x, SELECT.y, 0.055, 0.04)}
      <Text position={[START.x - 0.11, START.y, FRONT_Z + 0.002]} fontSize={0.042} color={engraving} anchorX="right" anchorY="middle" letterSpacing={0.08}>
        START
      </Text>
      <Text position={[SELECT.x - 0.11, SELECT.y, FRONT_Z + 0.002]} fontSize={0.042} color={engraving} anchorX="right" anchorY="middle" letterSpacing={0.08}>
        SELECT
      </Text>

      {/* A / B: más pequeños y juntos; B abajo-izquierda, A arriba-derecha */}
      {roundButton("a", a, BTN_A.x, BTN_A.y, 0.13, 0.07)}
      {roundButton("b", b, BTN_B.x, BTN_B.y, 0.13, 0.07)}
      <Text position={[BTN_A.x, BTN_A.y - 0.21, FRONT_Z + 0.002]} fontSize={0.06} color={engraving} anchorX="center" anchorY="middle">
        A
      </Text>
      <Text position={[BTN_B.x, BTN_B.y - 0.21, FRONT_Z + 0.002]} fontSize={0.06} color={engraving} anchorX="center" anchorY="middle">
        B
      </Text>

      {/* Altavoz: ranuras diagonales abajo a la derecha */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh
          key={i}
          position={[1.66 + i * 0.012, -0.5 - i * 0.07, FRONT_Z - 0.001]}
          rotation={[0, 0, 0.16]}
        >
          <boxGeometry args={[0.4 - i * 0.02, 0.022, 0.012]} />
          <meshStandardMaterial color={slot} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
});

export default GBAModel;
