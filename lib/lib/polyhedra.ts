import RAPIER from "@dimforge/rapier3d-compat";
import range from "./range";
import { Quaternion, Vector3 } from "three";

// The data in this file is taken from blender meshes for the relevant
// polyhedra.
//
// Data is exported as glb, then we use the `glTF Tools` vs code
// extension.
//
//  1. Right click on the file (e.g. D20Physics.glb), and select
//     `glTF: Import from GLB`
//  2. Save the gltf file in the same directory. It should open
//     in vs code automatically, if not open it manually.
//  3. Go to the `OUTLINE` section of vs code's Explorer tab (top left
//     icon like a pair of pages).
//  4. In the `accessors` section, find the object that has `min` and
//    `max` fields.
//  5. Right click on the line reading `"type": "VEC3"`, and select
//    `glTF: Inspect Data`. You should see an array of vertices pop
//    up.
//  6. Right-click the vertices, and select `glTF Inspect Data: Copy all values`
//  7. Paste the values in here, and edit as necessary. Note that vertices may
//     be repeated per face, duplicates were deleted for the "collisionMeshVertices"
//     data, where we only need each vertex as a single vector.
//
// The icosahedron is as created in blender using default settings, then
// scaled by a factor of 1.6. This makes it line up well with a cube
// of half-size 1 (i.e. 2x2x2 units). We then multiply by the requested
// size to yield the mesh.

// Raw GLB vertex indices
export const rawIcosahedronVertexIndices = [
  3, 5, 13, 7, 4, 27, 1, 11, 19, 0, 18, 21, 2, 23, 25, 9, 29, 54, 14, 6, 32, 17,
  10, 36, 20, 16, 41, 26, 24, 47, 8, 53, 34, 12, 30, 38, 15, 35, 40, 22, 43, 45,
  28, 49, 52, 33, 51, 59, 39, 31, 57, 42, 37, 55, 46, 44, 56, 50, 48, 58,
];

// Raw GLB vertex positions
// prettier-ignore
export const rawIcosahedronVertices = new Float32Array([
  0.00000, -1.60000, 0.00000,
  0.00000, -1.60000, 0.00000,
  0.00000, -1.60000, 0.00000,
  0.00000, -1.60000, 0.00000,
  0.00000, -1.60000, 0.00000,
  1.15776, -0.71554, 0.84115,
  1.15776, -0.71554, 0.84115,
  1.15776, -0.71554, 0.84115,
  1.15776, -0.71554, 0.84115,
  1.15776, -0.71554, 0.84115,
  -0.44222, -0.71554, 1.36102,
  -0.44222, -0.71554, 1.36102,
  -0.44222, -0.71554, 1.36102,
  -0.44222, -0.71554, 1.36102,
  -0.44222, -0.71554, 1.36102,
  -1.43108, -0.71554, 0.00000,
  -1.43108, -0.71554, 0.00000,
  -1.43108, -0.71554, 0.00000,
  -1.43108, -0.71554, 0.00000,
  -1.43108, -0.71554, 0.00000,
  -0.44222, -0.71554, -1.36102,
  -0.44222, -0.71554, -1.36102,
  -0.44222, -0.71554, -1.36102,
  -0.44222, -0.71554, -1.36102,
  -0.44222, -0.71554, -1.36102,
  1.15776, -0.71554, -0.84115,
  1.15776, -0.71554, -0.84115,
  1.15776, -0.71554, -0.84115,
  1.15776, -0.71554, -0.84115,
  1.15776, -0.71554, -0.84115,
  0.44222, 0.71554, 1.36102,
  0.44222, 0.71554, 1.36102,
  0.44222, 0.71554, 1.36102,
  0.44222, 0.71554, 1.36102,
  0.44222, 0.71554, 1.36102,
  -1.15776, 0.71554, 0.84115,
  -1.15776, 0.71554, 0.84115,
  -1.15776, 0.71554, 0.84115,
  -1.15776, 0.71554, 0.84115,
  -1.15776, 0.71554, 0.84115,
  -1.15776, 0.71554, -0.84115,
  -1.15776, 0.71554, -0.84115,
  -1.15776, 0.71554, -0.84115,
  -1.15776, 0.71554, -0.84115,
  -1.15776, 0.71554, -0.84115,
  0.44222, 0.71554, -1.36102,
  0.44222, 0.71554, -1.36102,
  0.44222, 0.71554, -1.36102,
  0.44222, 0.71554, -1.36102,
  0.44222, 0.71554, -1.36102,
  1.43108, 0.71554, 0.00000,
  1.43108, 0.71554, 0.00000,
  1.43108, 0.71554, 0.00000,
  1.43108, 0.71554, 0.00000,
  1.43108, 0.71554, 0.00000,
  0.00000, 1.60000, 0.00000,
  0.00000, 1.60000, 0.00000,
  0.00000, 1.60000, 0.00000,
  0.00000, 1.60000, 0.00000,
  0.00000, 1.60000, 0.00000
]);

export type FaceGeometryInfo = {
  center: Vector3;
  corner: Vector3;
};

export const faceInfoFromRawGeometry = (
  vertices: Float32Array,
  vertexIndices: number[]
): FaceGeometryInfo[] => {
  return range(vertexIndices.length / 3).map((faceIndex) => {
    // The indices of the vertices of this face
    const vi0 = vertexIndices[faceIndex * 3 + 0];
    const vi1 = vertexIndices[faceIndex * 3 + 1];
    const vi2 = vertexIndices[faceIndex * 3 + 2];

    // Get the slices of vertex data for each vertex (i.e. [x, y, z])
    const v0 = vertices.slice(vi0 * 3, vi0 * 3 + 3);
    const v1 = vertices.slice(vi1 * 3, vi1 * 3 + 3);
    const v2 = vertices.slice(vi2 * 3, vi2 * 3 + 3);

    // Center is the centroid of the vertices of the face
    const center = new Vector3();
    center.setX((v0[0] + v1[0] + v2[0]) / 3);
    center.setY((v0[1] + v1[1] + v2[1]) / 3);
    center.setZ((v0[2] + v1[2] + v2[2]) / 3);

    // Pick the first vertex of the face for the "corner"
    const corner = new Vector3();
    corner.setX(v0[0]);
    corner.setY(v0[1]);
    corner.setZ(v0[2]);

    return { center, corner };
  });
};

export const icosahedronFaceInfo = faceInfoFromRawGeometry(
  rawIcosahedronVertices,
  rawIcosahedronVertexIndices
);

/**
 * Produce a Float32Array with the vertex positions of
 * an icosahedral mesh with specified size (relative to the
 * size of the D20 meshes). This can be used to produce
 * a collision mesh for a D20.
 * @param size The size (scale factor) of the D20
 * @returns A Float32Array of vertex positions for the D20
 */
export const icosahedronCollisionMeshVertices = (
  size: number
): Float32Array => {
  // prettier-ignore
  return new Float32Array([
    0.00000, -1.60000, 0.00000,
    1.15776, -0.71554, 0.84115,
    -0.44222, -0.71554, 1.36102,
    -1.43108, -0.71554, 0.00000,
    -0.44222, -0.71554, -1.36102,
    1.15776, -0.71554, -0.84115,
    0.44222, 0.71554, 1.36102,
    -1.15776, 0.71554, 0.84115,
    -1.15776, 0.71554, -0.84115,
    0.44222, 0.71554, -1.36102,
    1.43108, 0.71554, 0.00000,
    0.00000, 1.60000, 0.00000,
  ]).map((a) => a * size);
};

export type DiceInfo = {
  type: DiceType;
  faceValues: number[];
  faceInfo: FaceGeometryInfo[];
  colliderDescFromSize: (size: number) => RAPIER.ColliderDesc;
};

// export type DiceType = "D4" | "D6" | "D8" | "D10" | "D10x10" | "D12" | "D20";
export type DiceType = "D6" | "D20";

export const d20DiceInfo: DiceInfo = {
  type: "D20",
  faceValues: [
    17, 3, 7, 1, 19, 16, 10, 15, 13, 9, 8, 12, 5, 11, 6, 20, 2, 18, 4, 14,
  ],
  faceInfo: icosahedronFaceInfo,
  colliderDescFromSize: (size: number) =>
    RAPIER.ColliderDesc.convexMesh(icosahedronCollisionMeshVertices(size))!,
};

export const cubeFaceInfo: FaceGeometryInfo[] = [
  { center: new Vector3(0, 0, 1), corner: new Vector3(1, 1, 1) },
  { center: new Vector3(0, -1, 0), corner: new Vector3(1, -1, 1) },
  { center: new Vector3(1, 0, 0), corner: new Vector3(1, 1, 1) },
  { center: new Vector3(-1, 0, 0), corner: new Vector3(-1, 1, 1) },
  { center: new Vector3(0, 1, 0), corner: new Vector3(1, 1, 1) },
  { center: new Vector3(0, 0, -1), corner: new Vector3(1, 1, -1) },
];

export const d6DiceInfo: DiceInfo = {
  type: "D6",
  faceValues: range(6).map((value) => value + 1),
  faceInfo: cubeFaceInfo,
  colliderDescFromSize: (size: number) =>
    RAPIER.ColliderDesc.cuboid(size, size, size),
};

export type DiceSetInfo = Record<DiceType, DiceInfo>;

export const diceSetInfo: DiceSetInfo = {
  D6: d6DiceInfo,
  D20: d20DiceInfo,
};

export const rotationToFaceUpIndex = (
  diceType: DiceType,
  quaternion: Quaternion
) => {
  const diceInfo = diceSetInfo[diceType];

  let maxY = -10;
  let faceUpIndex = 0;

  const faceVector = new Vector3();
  for (let faceIndex = 0; faceIndex < diceInfo.faceInfo.length; faceIndex++) {
    const faceCenterVector = diceInfo.faceInfo[faceIndex].center;
    faceVector.copy(faceCenterVector);
    faceVector.applyQuaternion(quaternion);
    if (faceVector.y > maxY) {
      maxY = faceVector.y;
      faceUpIndex = faceIndex;
    }
  }

  return faceUpIndex;
};

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
export const setFromUnitVectors = (
  q: Quaternion,
  vFrom: Vector3,
  vTo: Vector3
) => {
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

/**
 * Find the rotation (as a quaternion) to apply so that the specified
 * "from" face will be aligned where the "to" face was before rotation.
 * So e.g. if faceFrom is 3 and faceTo is 5, we will return a rotation
 * that will move face 3 to where face 5 started.
 * This is used to "pre-determine" a die roll - if we know that a simulation
 * led to face 5 being on top when the die settled, but we want to roll a
 * 3, we pre-apply quaternionForFaceUpIndex(diceType, 3, 5) to the mesh displayed,
 * and 3 will then appear to end up on top (since 3 has been moved to where 5 was,
 * and 5 was pre-determined to end up on top).
 * @param diceType 		The type of dice, to look up FaceInfo
 * @param faceFrom		The index of the face that will end up where faceTo was
 * 										before rotation
 * @param faceTo			The index of the face that acts as a target for faceFrom
 */
export const rotateFaceToFace = (
  diceType: DiceType,
  faceFrom: number,
  faceTo: number,
  quaternion: Quaternion
) => {
  const faceInfo = diceSetInfo[diceType].faceInfo;

  // Work out the rotation to place the center of the "from" face
  // at the center of the "to" face.
  const fromFaceCenterNorm = new Vector3();
  const toFaceCenterNorm = new Vector3();
  fromFaceCenterNorm.copy(faceInfo[faceFrom].center);
  toFaceCenterNorm.copy(faceInfo[faceTo].center);
  fromFaceCenterNorm.normalize();
  toFaceCenterNorm.normalize();
  setFromUnitVectors(quaternion, fromFaceCenterNorm, toFaceCenterNorm);

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
  fromFaceCenter.copy(faceInfo[faceFrom].center);
  toFaceCenter.copy(faceInfo[faceTo].center);

  // First step of u for "from" face - rotate corner vector of from
  // face by initial meshQuaternion to get where corner ends up.
  const fromFaceU = new Vector3();
  fromFaceU.copy(faceInfo[faceFrom].corner);
  fromFaceU.applyQuaternion(quaternion);

  // The "from" face center ends up at the "to" face center after
  // rotation, so subtract this to get the "u" vector for the
  // rotated "from" face
  fromFaceU.sub(toFaceCenter);

  const toFaceU = new Vector3();
  toFaceU.copy(faceInfo[faceTo].corner);
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

  // Add the rotation about face center to the initial rotation,
  // to give the whole rotation
  quaternion.premultiply(centerRotation);

  return quaternion;
};
