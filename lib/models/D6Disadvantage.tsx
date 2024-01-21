import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { forwardRef } from "react";

type GLTFResult = GLTF & {
  nodes: {
    D6Disadvantage: THREE.Mesh;
  };
  materials: {
    D6Disadvantage: THREE.MeshStandardMaterial;
  };
};

export type D6DisadvantageProps = {
  scale: number;
  meshQuaternion: THREE.Quaternion;
};

export const D6Disadvantage = forwardRef<
  THREE.Group<THREE.Object3DEventMap>,
  D6DisadvantageProps
>(({ scale, meshQuaternion }, ref) => {
  const { nodes, materials } = useGLTF("/D6Disadvantage.glb") as GLTFResult;
  return (
    <group ref={ref} dispose={null}>
      <mesh
        quaternion={meshQuaternion}
        scale={[scale, scale, scale]}
        castShadow
        receiveShadow
        geometry={nodes.D6Disadvantage.geometry}
        material={materials.D6Disadvantage}
      />
    </group>
  );
});

useGLTF.preload("/D6Disadvantage.glb");
