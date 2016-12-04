// References:
// https://github.com/MicheleBertoli/react-worker
// https://github.com/mdn/sw-test/blob/gh-pages/sw.js

/* Synchronously import scripts into a worker */
//self.importScripts('serviceworker-cache-polyfill.js');
//self.importScripts('build.js');
import config from './config';
import createMessenger from './messenger';

const workerRegistration = self;
const messenger = createMessenger(workerRegistration);

/* START Messenging */
messenger.onMessage = (message) => {
  console.log("hey there, got a message for you:");
  console.log(message);
}
messenger.send("hello, worker");
/* END Messenging */

/* START Event Handler Registration*/
self.addEventListener('fetch', fetchMiddleware);
self.addEventListener('activate', activateMiddleware);
self.addEventListener('install', precache);
/* END Event Handler Registration */

/* START Event Handlers */
function precache(event) {
  event.waitUntil(
    caches.open(config.name).then(buildPrecache)
  );
}

const handleCacheableResponse = (event, request, response) => {
  if(isCacheable(event)){
    event.waitUntil(saveToCache(request, response));
  }
  return response;
}

const defaultErrorMessage = "The service worker encountered an error";
const baseServerError = {
  status: 500,
  type: "error",
  message: defaultErrorMessage,
  inner: null,
};

const throwServerError = (message = defaultErrorMessage, inner = null) => Object.assign({},
  baseServerError,
  {
    message,
    inner,
  });

const asErrorResponse = (response = {}) => ({ // convert non-http errors to the http error format
  status: 500,
  type: 'error',
  message: response.message || defaultErrorMessage,
  inner: response,
});

function fetchMiddleware(event) {
  const req = event.request;

  const localOrCachedResponse = fetchWithoutCache(event, 300)
    .catch(asErrorResponse)
    .then(response => {
      if(!hasError(response)){
        return handleCacheableResponse(event, request, response);
      }
      return getCachedResponse(event, response);
    })
    .catch(asErrorResponse);
}

function activateMiddleware() {
  // apparently we're clearing invalidating the cache on activation?
  caches.open(config.name).then(function(cache) {
    cache.keys().then(function(requests) {
      requests.forEach(function(request) {
        cache.delete(request);
      });
    });
  });
}
/* END Event Handlers */

/* START Helpers */

const buildPrecache = (cache) => {
  const filesToCache = config.staticFiles;
  for (let publicPath of filesToCache) {
    console.log("public path: " + publicPath);
  }
  return cache.addAll(filesToCache);
};

const defaultMetadata = {};
const createEventMetadata = (event) => {
  const url = event && event.request && event.request.url;
  if(!url) return defaultMetadata;

  // request type definitions
  const isServiceWorker = /service-worker\.bundle\.js$/.test(url);
  if(isServiceWorker) return {};

  // request type definitions
  const isScript= /\.js$/.test(url);
  const isStyle= /\.css$/.test(url);
  const isHTML= /\.htm.*/.test(url);
  const isPrecache= config.staticFiles.includes(url);

  // list of request types that are cacheable
  const cacheableCriteria = [
    isScript,
    isStyle,
    isHTML,
    isPrecache,
  ];

  // Does this request match any of the criteria?
  const isCacheable= cacheableCriteria.some(cc => cc);

  const metadata = {
    isScript,
    isStyle,
    isHTML,
    isPrecache,
    isCacheable,
  };

  return metadata;
};

function isCacheable(event) {
  const metadata = createEventMetadata(event);
  const cacheable = metadata.isCacheable;
  return cacheable;
}



function fetchWithoutCache(event, timeout = 200) {
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

function getCachedResponse(event, errorResponse={status: 501, message: "service worker error"}) {

  const { status, inner } = errorResponse;
  const innerError = message || JSON.stringify(inner || "<none");

  const onceOrFuturePage = caches.match(event.request).then(function(cachedPageFound) {
    if (cachedPageFound) {
      return cachedPageFound;
    }

    const url = event && event.request && event.request.url;
    const message = `cache miss for failed network request status<${status}>: ${url}\n ERROR: ${innerError}`;
    throwServerError(message);
  });
}

function hasError(response) {
  const error = !response || response.status !== 200;
  return error;
}

// NOTE: the response must be cloned so the stream can be consumed by both the cache and the browser
function saveToCache(baseRequest, baseResponse) {
  const request = baseRequest.clone();
  const response = baseResponse.clone();
  return caches.open(config.name).then(function(cache) {
    return cache.put(request, response);
  });
}

/* END Event Handler Registration */


/* Unused content... */

// function getPath(url) {
//   return Url.parse(url).path;
// }

// function render(routeHandler) {
//   var handler = React.createFactory(routeHandler);
//   return React.renderToString(handler());
// }
