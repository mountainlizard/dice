import { Suspense } from "react";

import { Environment, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { suspend } from "suspend-react";
import {
  BufferGeometry,
  NormalBufferAttributes,
  Quaternion,
  Vector3,
} from "three";

import { icosahedronFaceInfo, rotateFaceToFace } from "../../lib/polyhedra";

// forest, sunset, city and apartment are candidates here
const env = import("@pmndrs/assets/hdri/forest.exr").then(
  (module) => module.default
);

const Plane = () => {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[5, 5]} />
      <shadowMaterial color="#2e262e" />
    </mesh>
  );
};

interface DieProps {
  size: number;
  meshQuaternion: Quaternion;
}

useGLTF.preload("/D20Gilded.glb");

const Die = ({ size, meshQuaternion }: DieProps) => {
  const d20Gilded = useGLTF("/D20Gilded.glb");

  const model = d20Gilded.nodes.D20Gilded;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const geometry = (model as any)[
    "geometry"
  ] as BufferGeometry<NormalBufferAttributes>;

  const material = d20Gilded.materials.D20Gilded;

  return (
    <group>
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
};

const FaceVectors = () => {
  // return (
  // 	icosahedronFaceInfo.map(({center}) => {
  // 		return (
  // 		);
  // 	};
  // );
  return (
    <>
      {icosahedronFaceInfo.map(({ center }, i) => {
        const p = new Vector3();
        p.copy(center);
        p.multiplyScalar(0.3);
        return (
          <mesh key={i} position={p} onClick={() => console.log(i)}>
            <boxGeometry args={[0.05, 0.05, 0.05]} />
            <meshStandardMaterial color="hotpink" />
          </mesh>
        );
      })}
    </>
  );
};

interface DicePlaybackProps {
  size: number;
  faceFrom: number;
  faceTo: number;
}

const DicePlayback = ({ size, faceFrom, faceTo }: DicePlaybackProps) => {
  // Each die must have its own quaternion - it's mutable,
  // but we make sure not to mutate it after passing it to
  // the Die
  const meshQuaternion = new Quaternion();
  rotateFaceToFace("D20", faceFrom, faceTo, meshQuaternion);
  return <Die size={size} meshQuaternion={meshQuaternion} />;
};

export const DiceAlignment = () => {
  return (
    <Canvas
      shadows
      camera={{
        fov: 20,
        position: [0, 5, 0],
        rotation: [-Math.PI / 2, 0, 0],
      }}
    >
      <Suspense fallback={null}>
        <directionalLight
          position={[3, 10, 3]}
          castShadow
          shadow-mapSize-height={1024}
          shadow-mapSize-width={1024}
          shadow-radius={0.1}
          shadow-bias={-0.0001}
          intensity={0.0}
        />

        <Environment files={suspend(env) as string} />
        {/* <Environment preset="city" /> */}
        {/* <Environment preset="apartment" /> */}

        <Plane />
        <DicePlayback size={0.3} faceFrom={15} faceTo={15} />
        <FaceVectors />
      </Suspense>
    </Canvas>
  );
};

/*
// Face order, from index in icosahedron FaceInfo array, to the number textured on that face
17, 3, 7, 1, 19, 16, 10, 15, 13, 9, 8, 12, 5, 11, 6, 20, 2, 18, 4, 14
 */
