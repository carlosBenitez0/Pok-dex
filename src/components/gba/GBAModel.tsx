import {
  forwardRef,
  ReactNode,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import * as THREE from "three";
import { ThreeEvent } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
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

// Medidas en unidades de mundo (≈ 1 u = 31 mm de una GBA real).
const HALF_STRAIGHT = 1.15; // mitad del tramo recto entre los dos “grips”
const RADIUS_X = 1.15;
const RADIUS_Y = 1.3;
const DEPTH = 0.42;
const BEVEL = 0.08;
export const FRONT_Z = DEPTH / 2 + BEVEL;
export const SCREEN_CENTER = new THREE.Vector3(0, 0.16, FRONT_Z + 0.032);
export const SCREEN_SIZE = { w: 1.92, h: 1.28 };

// Paleta inspirada en la GBA original: botones y topes gris claro.
const LIGHT_GRAY = "#cfcfd6";
const BUMPER_GRAY = "#c4c5cc";
const LENS = "#2c2c33";

function useShellGeometry() {
  return useMemo(() => {
    // Empezamos en mitad del borde inferior para que la costura del
    // contorno no caiga en la unión recta/curva (evita el “escalón”).
    const s = new THREE.Shape();
    s.moveTo(0, -RADIUS_Y);
    s.lineTo(HALF_STRAIGHT, -RADIUS_Y);
    s.absellipse(HALF_STRAIGHT, 0, RADIUS_X, RADIUS_Y, -Math.PI / 2, Math.PI / 2, false, 0);
    s.lineTo(-HALF_STRAIGHT, RADIUS_Y);
    s.absellipse(-HALF_STRAIGHT, 0, RADIUS_X, RADIUS_Y, Math.PI / 2, (3 * Math.PI) / 2, false, 0);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: BEVEL,
      bevelSize: BEVEL,
      bevelSegments: 10,
      curveSegments: 96,
    });
    g.translate(0, 0, -DEPTH / 2);
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

const GBAModel = forwardRef<GBAModelHandle, Props>(function GBAModel(
  { shellColor, translucent, onButton, children },
  ref,
) {
  const shell = useShellGeometry();
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
      const sink = (obj: THREE.Object3D | null, axis: "z" | "y" = "z", amount = -0.035) => {
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

  // Tonos derivados de la carcasa: hundidos más oscuros, serigrafía más clara.
  const recess = useMemo(() => tint(shellColor, -0.25), [shellColor]);
  const slot = useMemo(() => tint(shellColor, -0.6), [shellColor]);
  const engraving = useMemo(() => tint(shellColor, 0.45), [shellColor]);

  // Gatillos L/R: piezas grises pequeñas en las esquinas superiores, montadas
  // hacia la parte trasera (como en la GBA real). Son un arco corto de toro
  // que sigue la elipse del contorno; el grupo escala y el toro rota dentro,
  // así la escala no se deforma con la rotación.
  const bumper = (side: 1 | -1, refObj: typeof l, name: GBAButton) => {
    const startAngle = 0.5; // ≈ 29° desde la horizontal
    const arc = 0.78; // ≈ 45° de recorrido: solo la esquina
    const rotationZ = side === 1 ? startAngle : Math.PI - startAngle - arc;
    return (
      <group
        ref={refObj}
        position={[side * HALF_STRAIGHT, 0, -0.07]}
        scale={[RADIUS_X + BEVEL * 0.9, RADIUS_Y + BEVEL * 0.9, 1.6]}
      >
        <mesh rotation={[0, 0, rotationZ]} onPointerDown={click(name)} {...hover} castShadow>
          <torusGeometry args={[1, 0.13, 24, 48, arc]} />
          <meshStandardMaterial color={BUMPER_GRAY} roughness={0.55} />
        </mesh>
      </group>
    );
  };

  return (
    <group>
      {/* Carcasa */}
      <mesh geometry={shell} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={shellColor}
          roughness={0.48}
          metalness={0}
          clearcoat={0.35}
          clearcoatRoughness={0.4}
          transmission={translucent ? 0.22 : 0}
          thickness={0.6}
          ior={1.45}
        />
      </mesh>

      {bumper(-1, l, "l")}
      {bumper(1, r, "r")}

      {/* Lente de la pantalla */}
      <RoundedBox args={[2.46, 1.78, 0.05]} radius={0.12} smoothness={6} position={[0, 0.12, FRONT_Z + 0.005]}>
        <meshPhysicalMaterial color={LENS} roughness={0.25} clearcoat={1} clearcoatRoughness={0.1} />
      </RoundedBox>
      <mesh position={[0, SCREEN_CENTER.y, FRONT_Z + 0.032]}>
        <planeGeometry args={[SCREEN_SIZE.w + 0.04, SCREEN_SIZE.h + 0.04]} />
        <meshBasicMaterial color="#0b0f0d" />
      </mesh>
      <Text
        position={[-0.05, -0.62, FRONT_Z + 0.034]}
        fontSize={0.085}
        letterSpacing={0.06}
        color="#d9d9e2"
        anchorX="right"
        anchorY="middle"
        fontWeight={700}
      >
        POKéDEX
      </Text>
      <Text
        position={[0.0, -0.62, FRONT_Z + 0.034]}
        fontSize={0.07}
        letterSpacing={0.2}
        color="#d9d9e2"
        anchorX="left"
        anchorY="middle"
      >
        ADVANCE
      </Text>
      {children}

      {/* Marca en relieve arriba a la derecha (como el logo de la consola) */}
      <Text position={[1.62, 0.98, FRONT_Z + 0.002]} fontSize={0.065} color={engraving} anchorX="center" letterSpacing={0.05}>
        POKéDEX
      </Text>

      {/* LED de encendido (arriba a la derecha, como en la GBA) */}
      <mesh position={[1.42, 0.74, FRONT_Z + 0.006]}>
        <sphereGeometry args={[0.028, 16, 16]} />
        <meshStandardMaterial ref={led} color="#3df57a" emissive="#3df57a" emissiveIntensity={0} />
      </mesh>
      <Text position={[1.5, 0.74, FRONT_Z + 0.002]} fontSize={0.04} color={engraving} anchorX="left" anchorY="middle">
        POWER
      </Text>

      {/* Cruceta */}
      <mesh position={[-1.68, 0.18, FRONT_Z - 0.004]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.02, 64]} />
        <meshStandardMaterial color={recess} roughness={0.6} />
      </mesh>
      <group ref={dpad} position={[-1.68, 0.18, FRONT_Z + 0.04]}>
        <RoundedBox args={[0.56, 0.18, 0.09]} radius={0.035} smoothness={4} castShadow>
          <meshStandardMaterial color={LIGHT_GRAY} roughness={0.45} />
        </RoundedBox>
        <RoundedBox args={[0.18, 0.56, 0.09]} radius={0.035} smoothness={4} castShadow>
          <meshStandardMaterial color={LIGHT_GRAY} roughness={0.45} />
        </RoundedBox>
        {/* Hendidura central */}
        <mesh position={[0, 0, 0.046]}>
          <circleGeometry args={[0.05, 32]} />
          <meshStandardMaterial color="#b4b4bd" roughness={0.6} />
        </mesh>
        {/* Zonas de clic invisibles por dirección */}
        {(
          [
            ["up", 0, 0.18],
            ["down", 0, -0.18],
            ["left", -0.18, 0],
            ["right", 0.18, 0],
          ] as const
        ).map(([dir, x, y]) => (
          <mesh key={dir} position={[x, y, 0.06]} onPointerDown={click(dir)} {...hover}>
            <planeGeometry args={[0.2, 0.2]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        ))}
      </group>

      {/* START / SELECT: botones pequeños grises con serigrafía a la izquierda */}
      {(
        [
          ["start", start, -1.42, -0.42] as const,
          ["select", select, -1.36, -0.66] as const,
        ]
      ).map(([name, refObj, x, y]) => (
        <group key={name}>
          <mesh position={[x, y, FRONT_Z - 0.004]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.085, 0.085, 0.02, 32]} />
            <meshStandardMaterial color={recess} roughness={0.6} />
          </mesh>
          <mesh ref={refObj} position={[x, y, FRONT_Z + 0.02]} rotation={[Math.PI / 2, 0, 0]} onPointerDown={click(name)} {...hover}>
            <cylinderGeometry args={[0.06, 0.06, 0.05, 32]} />
            <meshStandardMaterial color={LIGHT_GRAY} roughness={0.45} />
          </mesh>
          <Text position={[x - 0.13, y, FRONT_Z + 0.002]} fontSize={0.045} color={engraving} anchorX="right" anchorY="middle" letterSpacing={0.08}>
            {name.toUpperCase()}
          </Text>
        </group>
      ))}

      {/* A / B: gris claro, B abajo-izquierda y A arriba-derecha */}
      {(
        [
          ["a", a, 1.86, 0.2] as const,
          ["b", b, 1.46, 0.02] as const,
        ]
      ).map(([name, refObj, x, y]) => (
        <group key={name}>
          <mesh position={[x, y, FRONT_Z - 0.004]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.185, 0.185, 0.02, 48]} />
            <meshStandardMaterial color={recess} roughness={0.6} />
          </mesh>
          <mesh ref={refObj} position={[x, y, FRONT_Z + 0.045]} rotation={[Math.PI / 2, 0, 0]} onPointerDown={click(name)} {...hover} castShadow>
            <cylinderGeometry args={[0.155, 0.16, 0.1, 48]} />
            <meshStandardMaterial color={LIGHT_GRAY} roughness={0.4} />
          </mesh>
          <Text position={[x, y - 0.25, FRONT_Z + 0.002]} fontSize={0.075} color={engraving} anchorX="center" anchorY="middle">
            {name.toUpperCase()}
          </Text>
        </group>
      ))}

      {/* Altavoz: ranuras diagonales abajo a la derecha */}
      {Array.from({ length: 6 }, (_, i) => (
        <RoundedBox
          key={i}
          args={[0.46 - i * 0.02, 0.035, 0.02]}
          radius={0.012}
          smoothness={2}
          position={[1.62 + i * 0.012, -0.5 - i * 0.075, FRONT_Z - 0.002]}
          rotation={[0, 0, 0.16]}
        >
          <meshStandardMaterial color={slot} roughness={0.8} />
        </RoundedBox>
      ))}
    </group>
  );
});

export default GBAModel;
