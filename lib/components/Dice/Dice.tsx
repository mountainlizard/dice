import { Suspense, useRef, useState, useEffect, forwardRef } from "react";

// import { Environment, useGLTF } from "@react-three/drei";
import { useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
// import { suspend } from "suspend-react";
import {
  BufferGeometry,
  Group,
  NormalBufferAttributes,
  Object3DEventMap,
  Quaternion,
  Vector3,
} from "three";

import range from "../../lib/range";
import {
  runDiceSimulation,
  DiceSimulation,
  setFaceVector,
} from "../../lib/runDiceSimulation";
import { lerp } from "three/src/math/MathUtils.js";

// forest, sunset, city and apartment are candidates here
// const env = import("@pmndrs/assets/hdri/forest.exr").then(
//   (module) => module.default
// );

const shadowColor = "#2e262e"; //#2e262e

function Plane() {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[5, 5]} />
      <shadowMaterial color={shadowColor} />
    </mesh>
  );
}

interface DieProps {
  size: number;
  gilded?: boolean | undefined;
  disadvantage?: boolean;
  meshQuaternion: Quaternion;
}

useGLTF.preload("/models/D6PlainEmbossed.glb");
useGLTF.preload("/models/D6GildedEmbossedFine2.glb");
useGLTF.preload("/models/D6DisadvantageEmbossedRipple.glb");

const Die = forwardRef<Group<Object3DEventMap>, DieProps>(
  ({ size, gilded, disadvantage, meshQuaternion }, ref) => {
    const d6Plain = useGLTF("/models/D6PlainEmbossed.glb");
    const d6Gilded = useGLTF("/models/D6GildedEmbossedFine2.glb");
    const d6Disadvantage = useGLTF("/models/D6DisadvantageEmbossedRipple.glb");

    const model = disadvantage
      ? d6Disadvantage.nodes.D6DisadvantageEmbossedRipple
      : gilded
      ? d6Gilded.nodes.D6GildedRough
      : d6Plain.nodes.D6PlainEmbossed;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const geometry = (model as any)[
      "geometry"
    ] as BufferGeometry<NormalBufferAttributes>;

    const material = disadvantage
      ? d6Disadvantage.materials.DisadvantageEmbossedRippleMaterial
      : gilded
      ? d6Gilded.materials.GildedRoughMaterial
      : d6Plain.materials.PlainEmbossedMaterial;

    return (
      <group ref={ref}>
        <mesh
          quaternion={meshQuaternion}
          scale={[0.45 * size, 0.45 * size, 0.45 * size]}
          castShadow
          receiveShadow
          geometry={geometry}
          material={material}
        />
      </group>
    );
  }
);

const dieUpdateNextQuaternion = new Quaternion();

const updateDie = (
  group: Group<Object3DEventMap>,
  sim: DiceSimulation,
  diceIndex: number,
  frame: number,
  frameRemainder: number
) => {
  const position = sim.diceHistories[diceIndex].positions[frame];
  const positionNext = sim.diceHistories[diceIndex].positions[frame + 1];
  group.position.x = lerp(position.x, positionNext.x, frameRemainder);
  group.position.y = lerp(position.y, positionNext.y, frameRemainder);
  group.position.z = lerp(position.z, positionNext.z, frameRemainder);

  const rotation = sim.diceHistories[diceIndex].rotations[frame];
  const rotationNext = sim.diceHistories[diceIndex].rotations[frame + 1];
  dieUpdateNextQuaternion.set(
    rotationNext.x,
    rotationNext.y,
    rotationNext.z,
    rotationNext.w
  );
  group.quaternion
    .set(rotation.x, rotation.y, rotation.z, rotation.w)
    .slerp(dieUpdateNextQuaternion, frameRemainder);
};

const physicsFrameRate = 60;

interface DicePlaybackProps {
  sim: DiceSimulation;
  gildedCount: number;
  disadvantage?: boolean;
  desiredRolls?: number[];
  startTime: React.MutableRefObject<number | null>;
}

const DicePlayback = ({
  sim,
  gildedCount,
  disadvantage,
  desiredRolls,
  startTime,
}: DicePlaybackProps) => {
  // We need a reference to the Group for each die - therefore we use an array
  const diceGroups = useRef<(Group<Object3DEventMap> | null)[]>([]);

  // Use the sim to update the position and rotation of each die
  useFrame(({ clock }) => {
    const elapsedTime = clock.elapsedTime;
    if (!startTime.current) {
      startTime.current = elapsedTime;
    }
    const simTime = elapsedTime - startTime.current;

    const frameFractional = simTime * physicsFrameRate;
    let frame = Math.floor(frameFractional);
    let frameRemainder = frameFractional - frame;

    // We limit frame so that sim has a position for both frame and frame + 1,
    // allowing us to interpolate to the next frame
    if (frame >= sim.ticks - 1) {
      frame = sim.ticks - 2;
      // Don't interpolate past last frame
      frameRemainder = 0.0;
    }

    if (diceGroups.current) {
      for (let diceIndex = 0; diceIndex < sim.count; diceIndex++) {
        const group = diceGroups.current[diceIndex];

        if (group) {
          updateDie(group, sim, diceIndex, frame, frameRemainder);
        }
      }
    }
  });

  // Reuse mutable vectors for each die
  const desiredFaceVector = new Vector3();
  const actualFaceVector = new Vector3();

  return (
    <>
      {/* Render each die */}
      {range(sim.count).map((diceIndex) => {
        // Each die must have its own quaternion - it's mutable,
        // but we make sure not to mutate it after passing it to
        // the Die
        const meshQuaternion = new Quaternion();

        // If we have a valid desired roll for this die,
        // rotate the mesh inside the group so that the desired face
        // will point upwards at the end of the simulation
        const desiredRoll = desiredRolls ? desiredRolls[diceIndex] : null;
        if (desiredRoll && desiredRoll >= 1 && desiredRoll <= 6) {
          setFaceVector(desiredFaceVector, desiredRoll - 1);
          setFaceVector(
            actualFaceVector,
            sim.diceHistories[diceIndex].faceUpIndex
          );
          meshQuaternion.setFromUnitVectors(
            desiredFaceVector,
            actualFaceVector
          );
        }

        return (
          <Die
            key={diceIndex}
            ref={(el) => (diceGroups.current[diceIndex] = el)}
            gilded={gildedCount > diceIndex}
            disadvantage={disadvantage}
            size={sim.size}
            meshQuaternion={meshQuaternion}
          />
        );
      })}
    </>
  );
};

export interface DiceProps {
  size: number;
  count: number;
  gildedCount: number;
  disadvantage?: boolean;
  seed: number;
  desiredRolls?: number[];
}

export const Dice = ({
  size,
  count,
  gildedCount,
  disadvantage,
  seed,
  desiredRolls,
}: DiceProps) => {
  const maxTicks = 600;
  const [sim, setSim] = useState<DiceSimulation | null>(null);

  useEffect(() => {
    runDiceSimulation(size, count, seed, maxTicks).then((s) => setSim(s));
  }, [size, count, seed]);

  // The (react-three-fiber) time the current simulation started playing, or null
  // if it has not yet started
  const startTime = useRef<number | null>(null);

  // When sim updates, reset the startTime so we will play from the first sim frame
  useEffect(() => {
    startTime.current = null;
    return undefined;
  }, [sim]);

  return (
    <Canvas
      shadows
      camera={{
        fov: 20,
        position: [0, 5, 0],
        rotation: [-Math.PI / 2, 0, 0],
      }}
      onClick={() => (startTime.current = null)}
    >
      <Suspense fallback={null}>
        <directionalLight
          position={[3, 10, 3]}
          castShadow
          shadow-mapSize-height={1024}
          shadow-mapSize-width={1024}
          shadow-radius={0.1}
          shadow-bias={-0.0001}
          intensity={3.0}
        />

        {/* <Environment files={suspend(env) as string} /> */}
        {/* <Environment preset="city" /> */}
        {/* <Environment preset="apartment" /> */}

        <Plane />
        {sim && (
          <DicePlayback
            gildedCount={gildedCount}
            disadvantage={disadvantage}
            sim={sim}
            desiredRolls={desiredRolls}
            startTime={startTime}
          />
        )}
      </Suspense>
    </Canvas>
  );
};
