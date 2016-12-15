import log from "../log";
import config from "../config";
import {getEventError, getServerErrorResponse} from "../error";


export const saves = (request, response) => {
  // const request = baseRequest.clone();
  // const response = baseResponse.clone();
  const savesRequest = openCache().then(function(cache) {
    return cache.put(request, response.clone());
  }).then(() => response , err => {
    const errorMessage = 'problem saving request cache';
    const error = err || new Error(errorMessage);
    log('problem saving request cache', error);
    throw error;
  });

  return savesRequest;
};

export const gets = (event) => {
  return opensCache().then(cache => cache.match(event.request).then((cachedPageFound) => {
    if (cachedPageFound) {
      log(cachedPageFound)
      return cachedPageFound;
    }
    getEventError(event);

  }, err => getEventError(event)));
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
  const url = event && event.request && event.request.url;
  if(!url) return defaultMetadata;

  // request type definitions
  const isServiceWorker = /service-worker\.bundle\.js$/.test(url);
  if(isServiceWorker) return {};

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

  // Does this request match any of the criteria?
  const isCacheable= cacheableCriteria.some(cc => cc);

  const metadata = {
    isScript,
    isStyle,
    isHTML,
    isPath,
    isCacheable,
  };

  return metadata;
};

// Is this a resource we want to cache?
export const isCacheable = (event) => {
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
