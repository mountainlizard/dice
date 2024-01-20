import { Suspense, forwardRef } from "react";

import { Environment, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { suspend } from "suspend-react";
import {
  BufferGeometry,
  Group,
  NormalBufferAttributes,
  Object3DEventMap,
  Quaternion,
  Vector3,
} from "three";

import { icosahedronFaceInfo } from "../../lib/polyhedra";

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

useGLTF.preload("/models/D20Gilded.glb");

const Die = ({ size, meshQuaternion }) => {
  const d20Gilded = useGLTF("/models/D20Gilded.glb");

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

/**
 * Set a quaternion to the rotation needed to rotate vFrom over vTo
 * Note this is nearly the same as the three.js method, but we use
 * a limit of `Number.EPSILON * 5` to detect opposite vectors, the
 * three.js code can end up with exactly Number.EPSILON from two
 * opposite vectors, and as a result incorrectly give the identity
 * rotation.
 * @param q 		The quaternion to set
 * @param vFrom From vector
 * @param vTo 	To Vector
 * @returns 		The quaternion
 */
const setFromUnitVectors = (q: Quaternion, vFrom: Vector3, vTo: Vector3) => {
  // assumes direction vectors vFrom and vTo are normalized

  let r = vFrom.dot(vTo) + 1;
  let qx = 0;
  let qy = 0;
  let qz = 0;
  let qw = 0;

  if (r < Number.EPSILON * 5) {
    // vFrom and vTo point in opposite directions

    r = 0;

    if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
      qx = -vFrom.y;
      qy = vFrom.x;
      qz = 0;
      qw = r;
    } else {
      qx = 0;
      qy = -vFrom.z;
      qz = vFrom.y;
      qw = r;
    }
  } else {
    // crossVectors( vFrom, vTo ); // inlined to avoid cyclic dependency on Vector3

    qx = vFrom.y * vTo.z - vFrom.z * vTo.y;
    qy = vFrom.z * vTo.x - vFrom.x * vTo.z;
    qz = vFrom.x * vTo.y - vFrom.y * vTo.x;
    qw = r;
  }

  q.set(qx, qy, qz, qw);

  return q.normalize();
};

const DicePlayback = ({ size, faceFrom, faceTo }: DicePlaybackProps) => {
  // Each die must have its own quaternion - it's mutable,
  // but we make sure not to mutate it after passing it to
  // the Die
  const meshQuaternion = new Quaternion();

  // If we have a valid desired roll for this die,
  // rotate the mesh inside the group so that the desired face
  // will point upwards at the end of the simulation

  // Work out the rotation to place the center of the "from" face
  // at the center of the "to" face.
  const fromFaceCenterNorm = new Vector3();
  const toFaceCenterNorm = new Vector3();
  fromFaceCenterNorm.copy(icosahedronFaceInfo[faceFrom].center);
  toFaceCenterNorm.copy(icosahedronFaceInfo[faceTo].center);
  fromFaceCenterNorm.normalize();
  toFaceCenterNorm.normalize();
  setFromUnitVectors(meshQuaternion, fromFaceCenterNorm, toFaceCenterNorm);
  console.log(
    `from ${JSON.stringify(fromFaceCenterNorm)}, to ${JSON.stringify(
      toFaceCenterNorm
    )}, by ${JSON.stringify(meshQuaternion)}`
  );

  // We're now out only by a rotation around the axis between the
  // origin and the center of the "to" face, since the centers are
  // aligned. So we want to work out the rotation angle.

  // To do this, we use the vector from the center of each face to
  // a corner (any corner is fine for equilateral faces, for other
  // shapes like D10 we need to use the "same" corner, e.g. the one
  // with the smallest angle) - call this the face "u" vector.

  // First we get u vector for the "to" face. Then we transform the
  // corner position of the "from" face by the initial meshQuaternion,
  // and this lets use find the u vector for the from face. We can then
  // find the angle between the two u vectors, and rotate by minus this
  // around the center vector to get where we need to be.

  const fromFaceCenter = new Vector3();
  const toFaceCenter = new Vector3();
  fromFaceCenter.copy(icosahedronFaceInfo[faceFrom].center);
  toFaceCenter.copy(icosahedronFaceInfo[faceTo].center);

  // First step of u for "from" face - rotate corner vector of from
  // face by initial meshQuaternion to get where corner ends up.
  const fromFaceU = new Vector3();
  fromFaceU.copy(icosahedronFaceInfo[faceFrom].corner);
  fromFaceU.applyQuaternion(meshQuaternion);

  // The "from" face center ends up at the "to" face center after
  // rotation, so subtract this to get the "u" vector for the
  // rotated "from" face
  fromFaceU.sub(toFaceCenter);

  const toFaceU = new Vector3();
  toFaceU.copy(icosahedronFaceInfo[faceTo].corner);
  toFaceU.sub(toFaceCenter);

  // Find required rotation angle about "to" face center
  const angle = fromFaceU.angleTo(toFaceU);

  // Last wrinkle - we need the signed rotation, we can
  // use the cross product of the face center and the "to"
  // u vector to work out which "side" the angle is on, and
  // dot product it with the "from" u vector to find the sign of
  // the angle.
  const direction = toFaceCenter.cross(toFaceU).dot(fromFaceU);

  const centerRotation = new Quaternion();
  centerRotation.setFromAxisAngle(
    toFaceCenterNorm,
    angle * Math.sign(direction) * -1
  );

  console.log(`Angle ${angle} = ${(angle / (2 * Math.PI)) * 360} deg`);

  // Add the rotation about face center to the initial rotation,
  // to give the whole rotation
  meshQuaternion.premultiply(centerRotation);

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
        <DicePlayback size={0.3} faceFrom={5} faceTo={15} />
        <FaceVectors />
      </Suspense>
    </Canvas>
  );
};

/*
// Face order, from index in icosahedron FaceInfo array, to the number textured on that face
17, 3, 7, 1, 19, 16, 10, 15, 13, 9, 8, 12, 5, 11, 6, 20, 2, 18, 4, 14
 */
