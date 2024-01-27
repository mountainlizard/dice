import { Suspense, useRef, useState, useEffect, forwardRef } from "react";

import { Environment, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { suspend } from "suspend-react";
import {
  BufferGeometry,
  Group,
  NormalBufferAttributes,
  Object3DEventMap,
  Quaternion,
} from "three";

import range from "../../lib/range";
import { runDiceSimulation, DiceSimulation } from "../../lib/runDiceSimulation";
import { lerp } from "three/src/math/MathUtils.js";
import { DiceType, diceSetInfo, rotateFaceToFace } from "../../lib/polyhedra";

// forest, sunset, city and apartment are candidates here
const env = import("@pmndrs/assets/hdri/forest.exr").then(
  (module) => module.default
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

interface PlaneProps {
  shadowColor?: string;
}

const Plane = ({ shadowColor }: PlaneProps) => {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[5, 5]} />
      <shadowMaterial color={shadowColor ?? defaultShadowColor} />
    </mesh>
  );
};

interface DieProps {
  type: DiceType;
  size: number;
  gilded?: boolean | undefined;
  disadvantage?: boolean;
  meshQuaternion: Quaternion;
}

useGLTF.preload("/D6.glb");
useGLTF.preload("/D6Gilded.glb");
useGLTF.preload("/D6Disadvantage.glb");
useGLTF.preload("/D20.glb");
useGLTF.preload("/D20Gilded.glb");
useGLTF.preload("/D20Disadvantage.glb");
useGLTF.preload("/D10.glb");
useGLTF.preload("/D10Gilded.glb");
useGLTF.preload("/D10Disadvantage.glb");
useGLTF.preload("/D10x10.glb");
useGLTF.preload("/D10x10Gilded.glb");
useGLTF.preload("/D10x10Disadvantage.glb");
useGLTF.preload("/D12.glb");
useGLTF.preload("/D12Gilded.glb");
useGLTF.preload("/D12Disadvantage.glb");

const Die = forwardRef<Group<Object3DEventMap>, DieProps>(
  ({ type, size, gilded, disadvantage, meshQuaternion }, ref) => {
    const d20Plain = useGLTF("/D20.glb");
    const d20Gilded = useGLTF("/D20Gilded.glb");
    const d20Disadvantage = useGLTF("/D20Disadvantage.glb");
    const d6Plain = useGLTF("/D6.glb");
    const d6Gilded = useGLTF("/D6Gilded.glb");
    const d6Disadvantage = useGLTF("/D6Disadvantage.glb");
    const d10 = useGLTF("/D10.glb");
    const d10Gilded = useGLTF("/D10Gilded.glb");
    const d10Disadvantage = useGLTF("/D10Disadvantage.glb");
    const d10x10 = useGLTF("/D10x10.glb");
    const d10x10Gilded = useGLTF("/D10x10Gilded.glb");
    const d10x10Disadvantage = useGLTF("/D10x10Disadvantage.glb");
    const d12 = useGLTF("/D12.glb");
    const d12Gilded = useGLTF("/D12Gilded.glb");
    const d12Disadvantage = useGLTF("/D12Disadvantage.glb");

    let model = d6Plain.nodes.D6;
    if (type == "D6") {
      if (disadvantage) {
        model = d6Disadvantage.nodes.D6Disadvantage;
      } else if (gilded) {
        model = d6Gilded.nodes.D6Gilded;
      } else {
        model = d6Plain.nodes.D6;
      }
    } else if (type == "D10") {
      if (disadvantage) {
        model = d10Disadvantage.nodes.D10Disadvantage;
      } else if (gilded) {
        model = d10Gilded.nodes.D10Gilded;
      } else {
        model = d10.nodes.D10;
      }
    } else if (type == "D10x10") {
      if (disadvantage) {
        model = d10x10Disadvantage.nodes.D10x10Disadvantage;
      } else if (gilded) {
        model = d10x10Gilded.nodes.D10x10Gilded;
      } else {
        model = d10x10.nodes.D10x10;
      }
    } else if (type == "D12") {
      if (disadvantage) {
        model = d12Disadvantage.nodes.D12Disadvantage;
      } else if (gilded) {
        model = d12Gilded.nodes.D12Gilded;
      } else {
        model = d12.nodes.D12;
      }
    } else if (type == "D20") {
      if (disadvantage) {
        model = d20Disadvantage.nodes.D20Disadvantage;
      } else if (gilded) {
        model = d20Gilded.nodes.D20Gilded;
      } else {
        model = d20Plain.nodes.D20;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const geometry = (model as any)[
      "geometry"
    ] as BufferGeometry<NormalBufferAttributes>;

    let material = d6Plain.materials.D6;
    if (type == "D6") {
      if (disadvantage) {
        material = d6Disadvantage.materials.D6Disadvantage;
      } else if (gilded) {
        material = d6Gilded.materials.D6Gilded;
      } else {
        material = d6Plain.materials.D6;
      }
    } else if (type == "D10") {
      if (disadvantage) {
        material = d10Disadvantage.materials.D10Disadvantage;
      } else if (gilded) {
        material = d10Gilded.materials.D10Gilded;
      } else {
        material = d10.materials.D10;
      }
    } else if (type == "D10x10") {
      if (disadvantage) {
        material = d10x10Disadvantage.materials.D10x10Disadvantage;
      } else if (gilded) {
        material = d10x10Gilded.materials.D10x10Gilded;
      } else {
        material = d10x10.materials.D10x10;
      }
    } else if (type == "D12") {
      if (disadvantage) {
        material = d12Disadvantage.materials.D12Disadvantage;
      } else if (gilded) {
        material = d12Gilded.materials.D12Gilded;
      } else {
        material = d12.materials.D12;
      }
    } else if (type == "D20") {
      if (disadvantage) {
        material = d20Disadvantage.materials.D20Disadvantage;
      } else if (gilded) {
        material = d20Gilded.materials.D20Gilded;
      } else {
        material = d20Plain.materials.D20;
      }
    }

    return (
      <group ref={ref} dispose={null}>
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
  diceTypes: DiceType[];
  gildedCount: number;
  disadvantage?: boolean;
  desiredRolls?: number[];
  startTime: React.MutableRefObject<number | null>;
}

const DicePlayback = ({
  sim,
  diceTypes,
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

  return (
    <>
      {/* Render each die */}
      {range(sim.count).map((diceIndex) => {
        // Each die must have its own quaternion - it's mutable,
        // but we make sure not to mutate it after passing it to
        // the Die
        const meshQuaternion = new Quaternion();

        const diceType = diceTypes[diceIndex];
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
          <Die
            key={diceIndex}
            type={diceType}
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
  diceTypes: DiceType[];
  gildedCount: number;
  disadvantage?: boolean;
  seed: number;
  desiredRolls?: number[];
  shadowColor?: string;
}

export const Dice = ({
  size,
  diceTypes,
  gildedCount,
  disadvantage,
  seed,
  desiredRolls,
  shadowColor,
}: DiceProps) => {
  const maxTicks = 600;
  const [sim, setSim] = useState<DiceSimulation | null>(null);

  useEffect(() => {
    runDiceSimulation(size, diceTypes, seed, maxTicks).then((s) => setSim(s));
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

        <Plane shadowColor={shadowColor} />
        {sim && (
          <DicePlayback
            diceTypes={diceTypes}
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
