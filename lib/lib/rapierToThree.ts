import { Euler, Quaternion, Vector3 } from "three";

/**
 * Convert anything with x, y, z to a three Vector3
 */
export const toVector3 = ({ x, y, z } = { x: 0, y: 0, z: 0 }) => {
  return new Vector3(x, y, z);
};

/**
 * Convert anything with x, y, z, w to a three Quaternion
 */
export const toQuaternion = ({ x, y, z, w } = { x: 0, y: 0, z: 0, w: 1 }) => {
  return new Quaternion(x, y, z, w);
};

/**
 * Convert anything with x, y, z, w to a three Euler
 */
export const toEuler = ({ x, y, z } = { x: 0, y: 0, z: 0 }) => {
  return new Euler(x, y, z);
};
