import { Suspense, useRef, useState, useEffect } from "react";

import { Environment } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { suspend } from "suspend-react";
import { Group, Quaternion } from "three";

import range from "../../lib/range";
import { runDiceSimulation, DiceSimulation } from "../../lib/runDiceSimulation";
import { lerp } from "three/src/math/MathUtils.js";
import { diceSetInfo, rotateFaceToFace } from "../../lib/polyhedra";
import { Dice, DiceVariant } from "../Dice/Dice";
import { DiceType } from "../..";

// forest, sunset, city and apartment are candidates here
const env = import("@pmndrs/assets/hdri/forest.exr").then(
  (module) => module.default as string
);
// const env = import("@pmndrs/assets/hdri/sunset.exr").then(
//   (module) => module.default
// );
// const env = import("@pmndrs/assets/hdri/city.exr").then(
//   (module) => module.default
// );
// const env = import("@pmndrs/assets/hdri/apartment.exr").then(
//   (module) => module.default
// );

const defaultShadowColor = "#2e262e";

type PlaneProps = {
  shadowColor?: string;
};

const Plane = ({ shadowColor }: PlaneProps) => {
  return (
    <mesh
      // eslint-disable-next-line react/no-unknown-property
      receiveShadow
      // eslint-disable-next-line react/no-unknown-property
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry
        // eslint-disable-next-line react/no-unknown-property
        args={[5, 5]}
      />
      <shadowMaterial color={shadowColor ?? defaultShadowColor} />
    </mesh>
  );
};

const diceUpdateNextQuaternion = new Quaternion();

const updateDice = (
  group: Group,
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
  diceUpdateNextQuaternion.set(
    rotationNext.x,
    rotationNext.y,
    rotationNext.z,
    rotationNext.w
  );
  group.quaternion
    .set(rotation.x, rotation.y, rotation.z, rotation.w)
    .slerp(diceUpdateNextQuaternion, frameRemainder);
};

const physicsFrameRate = 60;

type DicePlaybackProps = {
  sim: DiceSimulation;
  diceTypes: DiceType[];
  dieVariants: DiceVariant[];
  desiredRolls?: number[];
  startTime: React.MutableRefObject<number | null>;
};

const DicePlayback = ({
  sim,
  diceTypes,
  dieVariants,
  desiredRolls,
  startTime,
}: DicePlaybackProps) => {
  // We need a reference to the Group for each die - therefore we use an array
  const diceGroups = useRef<(Group | null)[]>([]);

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

    for (let diceIndex = 0; diceIndex < sim.count; diceIndex++) {
      const group = diceGroups.current[diceIndex];

      if (group) {
        updateDice(group, sim, diceIndex, frame, frameRemainder);
      }
    }
  });

  return (
    <>
      {/* Render each die */}
      {range(sim.count).map((diceIndex) => {
        // Each die must have its own quaternion - it's mutable,
        // but we make sure not to mutate it after passing it to
        // the Die
        const meshQuaternion = new Quaternion();

        const diceType = diceTypes[diceIndex];
        const dieVariant = dieVariants[diceIndex];
        const diceInfo = diceSetInfo[diceType];

        // If we have a valid desired roll for this die,
        // rotate the mesh inside the group so that the desired face
        // will point upwards at the end of the simulation
        const desiredRoll = desiredRolls ? desiredRolls[diceIndex] : undefined;
        if (desiredRoll !== undefined) {
          const desiredFaceIndex = diceInfo.faceValues.findIndex(
            (faceValue) => faceValue == desiredRoll
          );
          if (desiredFaceIndex > -1) {
            const faceUpIndex = sim.diceHistories[diceIndex].faceUpIndex;
            rotateFaceToFace(
              diceType,
              desiredFaceIndex,
              faceUpIndex,
              meshQuaternion
            );
          }
        }

        return (
          <Dice
            key={diceIndex}
            type={diceType}
            variant={dieVariant}
            ref={(el) => (diceGroups.current[diceIndex] = el)}
            size={sim.size}
            meshQuaternion={meshQuaternion}
          />
        );
      })}
    </>
  );
};

export type DiceRollerProps = {
  size: number;
  diceTypes: DiceType[];
  dieVariants: DiceVariant[];
  seed: number;
  desiredRolls?: number[];
  shadowColor?: string;
};

const DiceRoller = ({
  size,
  diceTypes,
  dieVariants,
  seed,
  desiredRolls,
  shadowColor,
}: DiceRollerProps) => {
  const maxTicks = 600;
  const [sim, setSim] = useState<DiceSimulation | null>(null);

  useEffect(() => {
    runDiceSimulation(size, diceTypes, seed, maxTicks)
      .then((s) => setSim(s))
      .catch((reason) => {
        console.error(reason);
      });
  }, [size, diceTypes, seed]);

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
          intensity={0.0}
        />

        <Environment files={suspend(env) as string} />

        <Plane shadowColor={shadowColor} />
        {sim && (
          <DicePlayback
            diceTypes={diceTypes}
            dieVariants={dieVariants}
            sim={sim}
            desiredRolls={desiredRolls}
            startTime={startTime}
          />
        )}
      </Suspense>
    </Canvas>
  );
};

DiceRoller.displayName = "DiceRoller";

export { DiceRoller };
