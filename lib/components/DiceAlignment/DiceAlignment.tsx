import { Suspense } from "react";

import { Canvas } from "@react-three/fiber";
import { Quaternion, Vector3 } from "three";

import { diceSetInfo, rotateFaceToFace } from "../../lib/polyhedra";
import { Dice } from "../Dice/Dice";
import { DiceType } from "../..";

type FaceVectorsProps = {
  type: DiceType;
  size: number;
};

const FaceVectors = ({ type, size }: FaceVectorsProps) => {
  const diceInfo = diceSetInfo[type];
  return (
    <>
      {diceInfo.faceInfo.map(({ center }, i) => {
        const p = new Vector3();
        p.copy(center);
        p.multiplyScalar(size);
        return (
          // eslint-disable-next-line react/no-unknown-property
          <mesh key={i} position={p} onClick={() => console.log(i)}>
            <boxGeometry
              // eslint-disable-next-line react/no-unknown-property
              args={[0.05, 0.05, 0.05]}
            />
            <meshStandardMaterial color="hotpink" />
          </mesh>
        );
      })}
    </>
  );
};

type RotatedDieProps = {
  type: DiceType;
  size: number;
  faceFrom: number;
  faceTo: number;
};

const RotatedDie = ({ type, size, faceFrom, faceTo }: RotatedDieProps) => {
  // Each die must have its own quaternion - it's mutable,
  // but we make sure not to mutate it after passing it to
  // the Die
  const meshQuaternion = new Quaternion();
  rotateFaceToFace(type, faceFrom, faceTo, meshQuaternion);
  return (
    <Dice
      type={type}
      variant="Normal"
      size={size}
      meshQuaternion={meshQuaternion}
    />
  );
};

export const DiceAlignment = () => {
  const size = 0.3;

  const type: DiceType = "D20";
  const faceFrom = 0;
  const faceTo = 19;

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
          // eslint-disable-next-line react/no-unknown-property
          position={[3, 10, 3]}
          // eslint-disable-next-line react/no-unknown-property
          castShadow
          // eslint-disable-next-line react/no-unknown-property
          shadow-mapSize-height={1024}
          // eslint-disable-next-line react/no-unknown-property
          shadow-mapSize-width={1024}
          // eslint-disable-next-line react/no-unknown-property
          shadow-radius={0.1}
          // eslint-disable-next-line react/no-unknown-property
          shadow-bias={-0.0001}
          // eslint-disable-next-line react/no-unknown-property
          intensity={3.0}
        />

        <RotatedDie
          type={type}
          size={size}
          faceFrom={faceFrom}
          faceTo={faceTo}
        />
        <FaceVectors type={type} size={size} />
      </Suspense>
    </Canvas>
  );
};
