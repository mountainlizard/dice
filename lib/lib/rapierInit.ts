import RAPIER from "@dimforge/rapier3d-compat";

/**
 * Flag to check if RAPIER has already been initialized
 * or is currently being initialized.
 */
let initialized = false;

/**
 * If init has already been called before but initialization
 * is not done yet, the unresolved promise is returned.
 */
let initPromise: Promise<void> | undefined = undefined;

async function rapierInit() {
  // return if RAPIER has been initialized
  if (initialized) return;

  // return the unresolve promise if RAPIER is currently initializing
  if (initPromise) return initPromise;

  // init and assign promise
  initPromise = RAPIER.init();

  // await initialization
  await initPromise;

  // set initialized flag
  initialized = true;
}

export default rapierInit;
