import { forwardRef } from "react";

import { useGLTF } from "@react-three/drei";
import {
  BufferGeometry,
  Group,
  NormalBufferAttributes,
  Object3DEventMap,
  Quaternion,
} from "three";

import { DiceType } from "../../lib/polyhedra";

export type DiceVariant = "Normal" | "Advantage" | "Disadvantage";

export interface DiceProps {
  type: DiceType;
  variant: DiceVariant;
  size: number;
  meshQuaternion: Quaternion;
}

useGLTF.preload("/D4.glb");
useGLTF.preload("/D4Gilded.glb");
useGLTF.preload("/D4Disadvantage.glb");
useGLTF.preload("/D6.glb");
useGLTF.preload("/D6Gilded.glb");
useGLTF.preload("/D6Disadvantage.glb");
useGLTF.preload("/D8.glb");
useGLTF.preload("/D8Gilded.glb");
useGLTF.preload("/D8Disadvantage.glb");
useGLTF.preload("/D10.glb");
useGLTF.preload("/D10Gilded.glb");
useGLTF.preload("/D10Disadvantage.glb");
useGLTF.preload("/D10x10.glb");
useGLTF.preload("/D10x10Gilded.glb");
useGLTF.preload("/D10x10Disadvantage.glb");
useGLTF.preload("/D12.glb");
useGLTF.preload("/D12Gilded.glb");
useGLTF.preload("/D12Disadvantage.glb");
useGLTF.preload("/D20.glb");
useGLTF.preload("/D20Gilded.glb");
useGLTF.preload("/D20Disadvantage.glb");

export const Dice = forwardRef<Group<Object3DEventMap>, DiceProps>(
  ({ type, variant, size, meshQuaternion }, ref) => {
    const d4Plain = useGLTF("/D4.glb");
    const d4Gilded = useGLTF("/D4Gilded.glb");
    const d4Disadvantage = useGLTF("/D4Disadvantage.glb");
    const d6Plain = useGLTF("/D6.glb");
    const d6Gilded = useGLTF("/D6Gilded.glb");
    const d6Disadvantage = useGLTF("/D6Disadvantage.glb");
    const d8Plain = useGLTF("/D8.glb");
    const d8Gilded = useGLTF("/D8Gilded.glb");
    const d8Disadvantage = useGLTF("/D8Disadvantage.glb");
    const d10 = useGLTF("/D10.glb");
    const d10Gilded = useGLTF("/D10Gilded.glb");
    const d10Disadvantage = useGLTF("/D10Disadvantage.glb");
    const d10x10 = useGLTF("/D10x10.glb");
    const d10x10Gilded = useGLTF("/D10x10Gilded.glb");
    const d10x10Disadvantage = useGLTF("/D10x10Disadvantage.glb");
    const d12 = useGLTF("/D12.glb");
    const d12Gilded = useGLTF("/D12Gilded.glb");
    const d12Disadvantage = useGLTF("/D12Disadvantage.glb");
    const d20Plain = useGLTF("/D20.glb");
    const d20Gilded = useGLTF("/D20Gilded.glb");
    const d20Disadvantage = useGLTF("/D20Disadvantage.glb");

    let model = d6Plain.nodes.D6;
    if (type == "D4") {
      if (variant == "Disadvantage") {
        model = d4Disadvantage.nodes.D4Disadvantage;
      } else if (variant == "Advantage") {
        model = d4Gilded.nodes.D4Gilded;
      } else {
        model = d4Plain.nodes.D4;
      }
    } else if (type == "D6") {
      if (variant == "Disadvantage") {
        model = d6Disadvantage.nodes.D6Disadvantage;
      } else if (variant == "Advantage") {
        model = d6Gilded.nodes.D6Gilded;
      } else {
        model = d6Plain.nodes.D6;
      }
    } else if (type == "D8") {
      if (variant == "Disadvantage") {
        model = d8Disadvantage.nodes.D8Disadvantage;
      } else if (variant == "Advantage") {
        model = d8Gilded.nodes.D8Gilded;
      } else {
        model = d8Plain.nodes.D8;
      }
    } else if (type == "D10") {
      if (variant == "Disadvantage") {
        model = d10Disadvantage.nodes.D10Disadvantage;
      } else if (variant == "Advantage") {
        model = d10Gilded.nodes.D10Gilded;
      } else {
        model = d10.nodes.D10;
      }
    } else if (type == "D10x10") {
      if (variant == "Disadvantage") {
        model = d10x10Disadvantage.nodes.D10x10Disadvantage;
      } else if (variant == "Advantage") {
        model = d10x10Gilded.nodes.D10x10Gilded;
      } else {
        model = d10x10.nodes.D10x10;
      }
    } else if (type == "D12") {
      if (variant == "Disadvantage") {
        model = d12Disadvantage.nodes.D12Disadvantage;
      } else if (variant == "Advantage") {
        model = d12Gilded.nodes.D12Gilded;
      } else {
        model = d12.nodes.D12;
      }
    } else if (type == "D20") {
      if (variant == "Disadvantage") {
        model = d20Disadvantage.nodes.D20Disadvantage;
      } else if (variant == "Advantage") {
        model = d20Gilded.nodes.D20Gilded;
      } else {
        model = d20Plain.nodes.D20;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const geometry = (model as any)[
      "geometry"
    ] as BufferGeometry<NormalBufferAttributes>;

    let material = d6Plain.materials.D6;
    if (type == "D4") {
      if (variant == "Disadvantage") {
        material = d4Disadvantage.materials.D4Disadvantage;
      } else if (variant == "Advantage") {
        material = d4Gilded.materials.D4Gilded;
      } else {
        material = d4Plain.materials.D4;
      }
    } else if (type == "D6") {
      if (variant == "Disadvantage") {
        material = d6Disadvantage.materials.D6Disadvantage;
      } else if (variant == "Advantage") {
        material = d6Gilded.materials.D6Gilded;
      } else {
        material = d6Plain.materials.D6;
      }
    } else if (type == "D8") {
      if (variant == "Disadvantage") {
        material = d8Disadvantage.materials.D8Disadvantage;
      } else if (variant == "Advantage") {
        material = d8Gilded.materials.D8Gilded;
      } else {
        material = d8Plain.materials.D8;
      }
    } else if (type == "D10") {
      if (variant == "Disadvantage") {
        material = d10Disadvantage.materials.D10Disadvantage;
      } else if (variant == "Advantage") {
        material = d10Gilded.materials.D10Gilded;
      } else {
        material = d10.materials.D10;
      }
    } else if (type == "D10x10") {
      if (variant == "Disadvantage") {
        material = d10x10Disadvantage.materials.D10x10Disadvantage;
      } else if (variant == "Advantage") {
        material = d10x10Gilded.materials.D10x10Gilded;
      } else {
        material = d10x10.materials.D10x10;
      }
    } else if (type == "D12") {
      if (variant == "Disadvantage") {
        material = d12Disadvantage.materials.D12Disadvantage;
      } else if (variant == "Advantage") {
        material = d12Gilded.materials.D12Gilded;
      } else {
        material = d12.materials.D12;
      }
    } else if (type == "D20") {
      if (variant == "Disadvantage") {
        material = d20Disadvantage.materials.D20Disadvantage;
      } else if (variant == "Advantage") {
        material = d20Gilded.materials.D20Gilded;
      } else {
        material = d20Plain.materials.D20;
      }
    }

    return (
      <group ref={ref} dispose={null}>
        <mesh
          quaternion={meshQuaternion}
          scale={[size, size, size]}
          castShadow
          receiveShadow
          geometry={geometry}
          material={material}
        />
      </group>
    );
  }
);
