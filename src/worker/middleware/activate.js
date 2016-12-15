import log from "../log";
import config from "../config";

import {
  defaultErrorMessage,
  baseServerError,
  hasError,
  getEventError,
  getServerErrorResponse,
  asErrorResponse
} from "../error";

import Cache from "../cache";

// When we activate a new service worker, deprecate all the content associated with the previouis one
export const activateMiddleware = (event) => {
  log("activation - deleting old entries");
  const deletesAllKeys = Cache.deletesKeys();
  event.waitUntil(deletesAllKeys);
};

export default activateMiddleware;
