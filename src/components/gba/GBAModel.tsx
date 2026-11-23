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

const DARK = "#24242c";
const BUTTON = "#d8d4e6";

function useShellGeometry() {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-HALF_STRAIGHT, -RADIUS_Y);
    s.lineTo(HALF_STRAIGHT, -RADIUS_Y);
    s.absellipse(HALF_STRAIGHT, 0, RADIUS_X, RADIUS_Y, -Math.PI / 2, Math.PI / 2, false, 0);
    s.lineTo(-HALF_STRAIGHT, RADIUS_Y);
    s.absellipse(-HALF_STRAIGHT, 0, RADIUS_X, RADIUS_Y, Math.PI / 2, (3 * Math.PI) / 2, false, 0);
    const g = new THREE.ExtrudeGeometry(s, {
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: BEVEL,
      bevelSize: BEVEL,
      bevelSegments: 8,
      curveSegments: 64,
    });
    g.translate(0, 0, -DEPTH / 2);
    g.computeVertexNormals();
    return g;
  }, []);
}

const setCursor = (c: string) => () => {
  document.body.style.cursor = c;
};

const GBAModel = forwardRef<GBAModelHandle, Props>(function GBAModel(
  { shellColor, translucent, onButton, children },
  ref,
) {
  const shell = useShellGeometry();
  const dpad = useRef<THREE.Group>(null);
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  const l = useRef<THREE.Mesh>(null);
  const r = useRef<THREE.Mesh>(null);
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
        case "start": return sink(start.current);
        case "select": return sink(select.current);
        case "l": return sink(l.current, "y", -0.05);
        case "r": return sink(r.current, "y", -0.05);
      }
    },
    setPower(on) {
      if (led.current)
        gsap.to(led.current, { emissiveIntensity: on ? 1.2 : 0, duration: 0.4 });
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

  const recess = useMemo(
    () => new THREE.Color(shellColor).multiplyScalar(0.7).getStyle(),
    [shellColor],
  );

  return (
    <group>
      {/* Carcasa */}
      <mesh geometry={shell} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={shellColor}
          roughness={0.32}
          metalness={0}
          clearcoat={0.6}
          clearcoatRoughness={0.25}
          transmission={translucent ? 0.45 : 0}
          thickness={0.6}
          ior={1.45}
        />
      </mesh>

      {/* Bisel y pantalla */}
      <RoundedBox args={[2.42, 1.74, 0.04]} radius={0.08} position={[0, 0.12, FRONT_Z + 0.005]}>
        <meshStandardMaterial color="#1b1b22" roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, SCREEN_CENTER.y, FRONT_Z + 0.028]}>
        <planeGeometry args={[SCREEN_SIZE.w, SCREEN_SIZE.h]} />
        <meshBasicMaterial color="#0b0f0d" />
      </mesh>
      <Text
        position={[0, -0.62, FRONT_Z + 0.03]}
        fontSize={0.075}
        letterSpacing={0.12}
        color="#c9c7d8"
        anchorX="center"
        anchorY="middle"
      >
        POKéDEX ADVANCE
      </Text>
      {children}

      {/* LED de encendido */}
      <mesh position={[-1.55, 0.74, FRONT_Z + 0.01]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial ref={led} color="#3df57a" emissive="#3df57a" emissiveIntensity={0} />
      </mesh>
      <Text position={[-1.55, 0.63, FRONT_Z + 0.01]} fontSize={0.045} color="#e6e3f2" anchorX="center">
        POWER
      </Text>

      {/* Cruceta */}
      <mesh position={[-1.68, 0.05, FRONT_Z - 0.005]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.02, 48]} />
        <meshStandardMaterial color={recess} roughness={0.6} />
      </mesh>
      <group ref={dpad} position={[-1.68, 0.05, FRONT_Z + 0.04]}>
        <RoundedBox args={[0.54, 0.18, 0.1]} radius={0.03} castShadow>
          <meshStandardMaterial color={DARK} roughness={0.45} />
        </RoundedBox>
        <RoundedBox args={[0.18, 0.54, 0.1]} radius={0.03} castShadow>
          <meshStandardMaterial color={DARK} roughness={0.45} />
        </RoundedBox>
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

      {/* A / B */}
      <mesh ref={a} position={[1.86, 0.24, FRONT_Z + 0.04]} rotation={[Math.PI / 2, 0, 0]} onPointerDown={click("a")} {...hover} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.1, 40]} />
        <meshStandardMaterial color={BUTTON} roughness={0.35} />
      </mesh>
      <Text position={[1.86, 0.02, FRONT_Z + 0.01]} fontSize={0.08} color="#e6e3f2">A</Text>
      <mesh ref={b} position={[1.44, -0.02, FRONT_Z + 0.04]} rotation={[Math.PI / 2, 0, 0]} onPointerDown={click("b")} {...hover} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.1, 40]} />
        <meshStandardMaterial color={BUTTON} roughness={0.35} />
      </mesh>
      <Text position={[1.44, -0.24, FRONT_Z + 0.01]} fontSize={0.08} color="#e6e3f2">B</Text>

      {/* START / SELECT */}
      {(
        [
          ["start", start, -0.6] as const,
          ["select", select, -0.82] as const,
        ]
      ).map(([name, refObj, y]) => (
        <group key={name}>
          <mesh ref={refObj} position={[-1.78, y, FRONT_Z + 0.02]} rotation={[Math.PI / 2, 0, 0]} onPointerDown={click(name)} {...hover}>
            <cylinderGeometry args={[0.065, 0.065, 0.05, 24]} />
            <meshStandardMaterial color={DARK} roughness={0.5} />
          </mesh>
          <Text position={[-1.62, y, FRONT_Z + 0.01]} fontSize={0.05} color="#e6e3f2" anchorX="left" anchorY="middle">
            {name.toUpperCase()}
          </Text>
        </group>
      ))}

      {/* Altavoz */}
      {Array.from({ length: 15 }, (_, i) => {
        const row = Math.floor(i / 5);
        const col = i % 5;
        return (
          <mesh
            key={i}
            position={[1.42 + col * 0.11 + (row % 2) * 0.055, -0.62 - row * 0.1, FRONT_Z + 0.001]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.025, 0.025, 0.01, 12]} />
            <meshBasicMaterial color="#0c0c10" />
          </mesh>
        );
      })}

      {/* Gatillos L / R */}
      <RoundedBox ref={l} args={[0.95, 0.16, 0.4]} radius={0.06} position={[-1.78, 1.1, -0.02]} rotation={[0, 0, 0.45]} onPointerDown={click("l")} {...hover} castShadow>
        <meshStandardMaterial color="#3a3a46" roughness={0.4} />
      </RoundedBox>
      <RoundedBox ref={r} args={[0.95, 0.16, 0.4]} radius={0.06} position={[1.78, 1.1, -0.02]} rotation={[0, 0, -0.45]} onPointerDown={click("r")} {...hover} castShadow>
        <meshStandardMaterial color="#3a3a46" roughness={0.4} />
      </RoundedBox>
    </group>
  );
});

export default GBAModel;
