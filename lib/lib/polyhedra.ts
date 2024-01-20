import RAPIER from "@dimforge/rapier3d-compat";
import range from "./range";
import { Vector3 } from "three";

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
  faceValues: range(20).map((value) => value + 1),
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
