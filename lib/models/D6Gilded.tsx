import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { forwardRef } from "react";

type GLTFResult = GLTF & {
  nodes: {
    D6Gilded: THREE.Mesh;
  };
  materials: {
    D6Gilded: THREE.MeshStandardMaterial;
  };
};

export type D6GildedProps = {
  scale: number;
  meshQuaternion: THREE.Quaternion;
};

export const D6Gilded = forwardRef<
  THREE.Group<THREE.Object3DEventMap>,
  D6GildedProps
>(({ scale, meshQuaternion }, ref) => {
  const { nodes, materials } = useGLTF("/D6Gilded.glb") as GLTFResult;
  return (
    <group ref={ref} dispose={null}>
      <mesh
        quaternion={meshQuaternion}
        scale={[scale, scale, scale]}
        castShadow
        receiveShadow
        geometry={nodes.D6Gilded.geometry}
        material={materials.D6Gilded}
      />
    </group>
  );
});

useGLTF.preload("/D6Gilded.glb");
