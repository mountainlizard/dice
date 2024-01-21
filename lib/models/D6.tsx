import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { forwardRef } from "react";

type GLTFResult = GLTF & {
  nodes: {
    D6: THREE.Mesh;
  };
  materials: {
    D6: THREE.MeshStandardMaterial;
  };
};

export type D6Props = {
  scale: number;
  meshQuaternion: THREE.Quaternion;
};

export const D6 = forwardRef<THREE.Group<THREE.Object3DEventMap>, D6Props>(
  ({ scale, meshQuaternion }, ref) => {
    const { nodes, materials } = useGLTF("/D6.glb") as GLTFResult;
    return (
      <group ref={ref} dispose={null}>
        <mesh
          quaternion={meshQuaternion}
          scale={[scale, scale, scale]}
          castShadow
          receiveShadow
          geometry={nodes.D6.geometry}
          material={materials.D6}
        />
      </group>
    );
  }
);

useGLTF.preload("/D6.glb");
