import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { forwardRef } from "react";

type GLTFResult = GLTF & {
  nodes: {
    D20Gilded: THREE.Mesh;
  };
  materials: {
    D20Gilded: THREE.MeshStandardMaterial;
  };
};

export type D20GildedProps = {
  scale: number;
  meshQuaternion: THREE.Quaternion;
};

export const D20Gilded = forwardRef<
  THREE.Group<THREE.Object3DEventMap>,
  D20GildedProps
>(({ scale, meshQuaternion }, ref) => {
  const { nodes, materials } = useGLTF("/D20Gilded.glb") as GLTFResult;
  return (
    <group ref={ref} dispose={null}>
      <mesh
        quaternion={meshQuaternion}
        scale={[scale, scale, scale]}
        castShadow
        receiveShadow
        geometry={nodes.D20Gilded.geometry}
        material={materials.D20Gilded}
      />
    </group>
  );
});

useGLTF.preload("/D20Gilded.glb");
