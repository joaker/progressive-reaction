import log from "../log";
import config from "../config";

// import {
//   defaultErrorMessage,
//   baseServerError,
//   hasError,
//   getEventError,
//   asErrorResponse
// } from "../error";

import Cache from "../cache";

// When we activate a new service worker, deprecate all the content associated with the previouis one
export const installMiddleware = (event) => {
  log("installing - loading precache");
  // Build the precache, waiting until it is complete
  const precaches = Cache.precaches();
  event.waitUntil(precaches);
};

export default installMiddleware;
