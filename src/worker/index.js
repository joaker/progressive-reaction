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

function fetchMiddleware(event) {
  if (isCacheable(event)) {
    fetchWithCache(event);
  } else {
    fetchWithoutCache(event);
  }
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



function fetchWithoutCache(event) {
  const forwardedFetch = fetch(event.request.url);
  event.respondWith(forwardedFetch);
}

function fetchWithCache(event) {
  const onceOrFuturePage = caches.match(event.request).then(function(cachedPageFound) {
    if (cachedPageFound) {
      return cachedPageFound;
    }
    return fetchThenCacheRequest(event);
  });

  event.respondWith(onceOrFuturePage);
}

function fetchThenCacheRequest(event) {
  const request = event.request;
  const url = request.url;

  // IMPORTANT: Clone the request
  // A request is a stream and can only be consumed once
  // Both the browser and the cache need the fetch response
  // Clone the fetch response so there will be two copies
  // TODO: determine if this is actually necessary, or just the response clone
  var clonedRequest = request.clone();

  return fetch(clonedRequest).then(
    function(response) {
      if (hasError(response)) {
        return response;
      }
      saveResponse(request, response)
      return response;
    });
}

function hasError(response) {
  const error = !response || response.status !== 200 || response.type !== 'basic';
  return error;
}

// NOTE: the response must be cloned so the stream can be consumed by both the cache and the browser
function saveResponse(request, response) {
  return caches.open(config.name).then(function(cache) {
    return cache.put(request, response.clone());
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
