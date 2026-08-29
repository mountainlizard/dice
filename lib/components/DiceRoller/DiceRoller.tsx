import { Suspense, useCallback, useEffect, useRef, useState } from "react";

import { Environment } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { suspend } from "suspend-react";
import { Group, Quaternion } from "three";

import { lerp } from "three/src/math/MathUtils.js";
import { DiceType } from "../..";
import { diceSetInfo, rotateFaceToFace } from "../../lib/polyhedra";
import range from "../../lib/range";
import { DiceSimulation, runDiceSimulation } from "../../lib/runDiceSimulation";
import { Dice, DiceVariant } from "../Dice/Dice";

// forest, sunset, city and apartment are candidates here
const env = import("@pmndrs/assets/hdri/forest.exr").then(
  (module) => module.default as string,
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
  shadowOpacity?: number;
};

const Plane = ({ shadowColor, shadowOpacity }: PlaneProps) => {
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
      <shadowMaterial
        color={shadowColor ?? defaultShadowColor}
        opacity={shadowOpacity}
      />
    </mesh>
  );
};

const diceUpdateNextQuaternion = new Quaternion();

const updateDice = (
  group: Group,
  sim: DiceSimulation,
  diceIndex: number,
  frame: number,
  frameRemainder: number,
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
    rotationNext.w,
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
  updateStartTime: (elapsedTime: number) => number;
};

const DicePlayback = ({
  sim,
  diceTypes,
  dieVariants,
  desiredRolls,
  updateStartTime,
}: DicePlaybackProps) => {
  // We need a reference to the Group for each die - therefore we use an array
  const diceGroups = useRef<(Group | null)[]>([]);

  // Use the sim to update the position and rotation of each die
  useFrame(({ clock }) => {
    const elapsedTime = clock.elapsedTime;
    const startTime = updateStartTime(elapsedTime);
    const simTime = elapsedTime - startTime;

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
            (faceValue) => faceValue == desiredRoll,
          );
          if (desiredFaceIndex > -1) {
            const faceUpIndex = sim.diceHistories[diceIndex].faceUpIndex;
            rotateFaceToFace(
              diceType,
              desiredFaceIndex,
              faceUpIndex,
              meshQuaternion,
            );
          }
        }

        return (
          <Dice
            key={diceIndex}
            type={diceType}
            variant={dieVariant}
            ref={(el) => {
              diceGroups.current[diceIndex] = el;
            }}
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
  halfWidth?: number;
  halfHeight?: number;
  diceTypes: DiceType[];
  dieVariants: DiceVariant[];
  seed: number;
  desiredRolls?: number[];
  shadowColor?: string;
  shadowOpacity?: number;
};

const DiceRoller = ({
  size,
  halfWidth,
  halfHeight,
  diceTypes,
  dieVariants,
  seed,
  desiredRolls,
  shadowColor,
  shadowOpacity,
}: DiceRollerProps) => {
  const maxTicks = 600;
  const [sim, setSim] = useState<DiceSimulation | null>(null);

  useEffect(() => {
    runDiceSimulation(
      size,
      halfWidth ?? 1,
      halfHeight ?? 1,
      diceTypes,
      seed,
      maxTicks,
    )
      .then((s) => setSim(s))
      .catch((reason) => {
        console.error(reason);
      });
  }, [size, diceTypes, seed, halfWidth, halfHeight]);

  // The (react-three-fiber) time the current simulation started playing, or null
  // if it has not yet started
  const startTime = useRef<number | null>(null);

  // When sim updates, reset the startTime so we will play from the first sim frame
  useEffect(() => {
    startTime.current = null;
    return undefined;
  }, [sim]);

  // This allows updating the start time to a given elapsedTime (if it's
  // not already set), and then returning the resulting start time.
  // We need this since the startTime state needs to be in this
  // component, but we can only access the elapsedTime for the
  // rendered frames inside the `Canvas`, using a `Clock`.
  const updateStartTime = useCallback((elapsedTime: number) => {
    if (!startTime.current) {
      startTime.current = elapsedTime;
    }
    return startTime.current;
  }, [startTime]);

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
          shadow-mapSize={2048}
          shadow-radius={4}
          shadow-bias={-0.0001}
          intensity={0.0}
          shadow-camera-left={-2.5}
          shadow-camera-right={2.5}
          shadow-camera-top={2.5}
          shadow-camera-bottom={-2.5}
        />
        <Environment files={suspend(env) as string} />

        <Plane shadowColor={shadowColor} shadowOpacity={shadowOpacity} />
        {sim && (
          <DicePlayback
            diceTypes={diceTypes}
            dieVariants={dieVariants}
            sim={sim}
            desiredRolls={desiredRolls}
            updateStartTime={updateStartTime}
          />
        )}
      </Suspense>
    </Canvas>
  );
};

DiceRoller.displayName = "DiceRoller";

export { DiceRoller };
