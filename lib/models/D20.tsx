import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { forwardRef } from "react";

type GLTFResult = GLTF & {
  nodes: {
    D20: THREE.Mesh;
  };
  materials: {
    D20: THREE.MeshStandardMaterial;
  };
};

export type D20Props = {
  scale: number;
  meshQuaternion: THREE.Quaternion;
};

export const D20 = forwardRef<THREE.Group<THREE.Object3DEventMap>, D20Props>(
  ({ scale, meshQuaternion }, ref) => {
    const { nodes, materials } = useGLTF("/D20.glb") as GLTFResult;
    return (
      <group ref={ref} dispose={null}>
        <mesh
          quaternion={meshQuaternion}
          scale={[scale, scale, scale]}
          castShadow
          receiveShadow
          geometry={nodes.D20.geometry}
          material={materials.D20}
        />
      </group>
    );
  }
);

useGLTF.preload("/D20.glb");
