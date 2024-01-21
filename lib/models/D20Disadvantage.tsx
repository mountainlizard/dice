import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { forwardRef } from "react";

type GLTFResult = GLTF & {
  nodes: {
    D20Disadvantage: THREE.Mesh;
  };
  materials: {
    D20Disadvantage: THREE.MeshStandardMaterial;
  };
};

export type D20DisadvantageProps = {
  scale: number;
  meshQuaternion: THREE.Quaternion;
};

export const D20Disadvantage = forwardRef<
  THREE.Group<THREE.Object3DEventMap>,
  D20DisadvantageProps
>(({ scale, meshQuaternion }, ref) => {
  const { nodes, materials } = useGLTF("/D20Disadvantage.glb") as GLTFResult;
  return (
    <group ref={ref} dispose={null}>
      <mesh
        quaternion={meshQuaternion}
        scale={[scale, scale, scale]}
        castShadow
        receiveShadow
        geometry={nodes.D20Disadvantage.geometry}
        material={materials.D20Disadvantage}
      />
    </group>
  );
});

useGLTF.preload("/D20Disadvantage.glb");
