import log from "../log";
import config from "../config";
// import {getEventError, getServerErrorResponse} from "../error";

export const saves = (request, response) => {
  const savesRequest = opensCache().then(function(cache) {
    return cache.put(request, response.clone());
  }).then(() => response , err => {
    const errorMessage = 'problem saving request cache';
    const error = err || new Error(errorMessage);
    log('problem saving request cache', error);
    log(`offending response: <${response}>`);
    // throw error; // don't throw, failing to cache is not a cardinal sin
    return response;
  });

  return savesRequest;
};

export const gets = (event) => {
  const {request} = event;
  const {url} = request;
  return opensCache().then(cache => cache.match(event.request));
}

const opensCache = () => caches.open(config.name);
const getsCacheKeys = () => opensCache().then(cache => {
  return cache.keys().then(keys => {
    return {
      cache,
      keys,
    };
  });
});
const deletesKeys = () => getsCacheKeys().then(({cache, keys}) => {
    const deletesKey = key => cache.delete(key);
    const deletions = keys.map(deletesKey);
    const allKeysDeleted = Promise.all(deletions);
    return allKeysDeleted;
  });

export const clearCacheKeys = () => {
  return deletesCacheKeys();
}

const buildPrecache = (filesToCache=[]) => (cache) => {
  log(`files; ${filesToCache.join(',')}`)
  for (let publicPath of filesToCache) {
    log("public path: " + publicPath);
  }
  return cache.addAll(filesToCache);
};

export const precaches = () => {
  const precacheFiles = config.staticFiles;
  const cacheFiles = buildPrecache(precacheFiles);
  log('openging cache');
  return caches.open(config.name).then(cacheFiles);
};


const defaultMetadata = {};
const createEventMetadata = (event) => {

  log(`event is: ${JSON.stringify(event)}`)

  const {request = {}} = event;
  const {url = ""} = request;
  if(!url) return defaultMetadata;

  // request type definitions
  const isServiceWorker = /service-worker\.bundle\.js$/.test(url);
  if(isServiceWorker) return {};

  if(request.method !== 'GET') {
    return {}; // only cache GET requests
  }

  // request type definitions
  const isScript= /\.js$/.test(url);
  const isStyle= /\.css$/.test(url);
  const isHTML= /\.htm.*/.test(url);
  const isPath = /\/$/.test(url);

  // list of request types that are cacheable
  const cacheableCriteria = [
    isScript,
    isStyle,
    isHTML,
    isPath,
    isPath,
  ];

  const cacheable = cacheableCriteria.some(cc => cc);

  const metadata = {
    isScript,
    isStyle,
    isHTML,
    isPath,
    isCacheable: cacheable,// Does this request match any of the criteria?
  };

  return metadata;
};

// Is this a resource we want to cache?
export const isCacheable = (event) => {
  console.log(`isCacheable Requested for event: ${JSON.stringify(event)}`)
  const metadata = createEventMetadata(event);
  const cacheable = metadata.isCacheable;
  return cacheable;
}



export default {
  gets,
  saves,
  deletesKeys,
  precaches,
  isCacheable,
};
