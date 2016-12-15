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

export const fetchMiddleware = (event = {}) => {
  const request = event.request || {};
  const url = request.url;
  log(`request issue for: ${url}`)
  const fetcher = config.cacheFirst ? fetchCachedOrLocalResponse : fetchLocalOrCachedResponse;
  const fetches = fetcher(event);
  return fetches;
};



const fetchLocalOrCachedResponse = (event = {}) => {
  const request = event.request || {};
  const url = request.url;
  return fetchDirect(event, 300)
    .catch(asErrorResponse)
    .then(response => {
      if(!hasError(response)){
        log(`fetch request succeeded for ${url}`);
        return handleCacheableResponse(event, request, response);
      }
      log(`request failed for ${url} (checking for cached response)`);
      return fetchCached(event, response);
    })
    .catch(asErrorResponse);
};

const fetchCachedOrLocalResponse = (event = {}) => {
  const request = event.request || {};
  const url = request.url;
  log(`fetching cached response for ${url}`);
  return fetchCached(event)
    .catch(asErrorResponse)
    .then(response => {
      if(!hasError(response)){
        log(`cache fetch request succeeded for ${url}`);
        return response;
      }
      log(`cache fetch request failed for ${url} (requesting directly)`);
      return fetchDirect(event, 300);
    })
    .catch(asErrorResponse);
}

// Fetch from the server using the provided timeout
function fetchDirect(event, timeout = 400) {
  return new Promise((resolve, reject)=>{
    const timerID = setTimeout(reject, timeout);
    const networkResponse = fetch(event.request)
      .then(response => {
        clearTimeout(timerID); // We made it.  Relax
        resolve(response); // Send back the response
      }, reject); // if the fetch fails, so does the wrapping promise
    return networkResponse;
  });
}

// Caches good responses
const handleCacheableResponse = (event, request, response) => {
  if (Cache.isCacheable(event)){
    log(`caching a request: ${request.url}`)
    const saves = Cache.saves(request, response)
    event.waitUntil(saves);
    return saves;
  }
  return response;
}

const defaultErrorResponse = {status: 501, message: "service worker error"};
const fetchCached = (event, baseError) => {
  const errorResponse = baseError || defaultErrorResponse;
  log('fetching from cache')
  const { status, inner, message } = errorResponse;
  log(`<status,inner,message>:<${status},${inner},${message}>`);
  const innerError = message || JSON.stringify(inner || "<none>");

  const onceOrFuturePagePromise = Cache.gets(event);
  return onceOrFuturePagePromise;
}


export default fetchMiddleware;
