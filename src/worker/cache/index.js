import log from "../log";
import config from "../config";

// save the request with the discovered response in the cache
export const saves = (request, response) => {
  const savesRequest = opensCache().then(function(cache) {
    return cache.put(request, response.clone());
  }).then(() => response , handleCacheSaveError(request, response));
  return savesRequest;
};

// fetch a cached item
export const gets = (event) => {
  const {request} = event;
  const {url} = request;
  return opensCache().then(cache => cache.match(request));
}

// Is this a resource we want to cache?
export const isCacheable = (event) => {
  console.log(`isCacheable Requested for event: ${JSON.stringify(event)}`)
  const metadata = createEventMetadata(event);
  const cacheable = metadata.isCacheable;
  return cacheable;
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

const createPrecacher = (filesToCache=[]) => (cache) => cache.addAll(filesToCache);

export const precaches = () => {
  const precacheFiles = config.staticFiles;
  const precaches = createPrecacher(precacheFiles);
  return caches.open(config.name).then(precaches);
};


const defaultMetadata = {};
const cacheableFileTypes = [
  'js',
  'jpg',
  'jpeg',
  'css',
  'jpg',
  'htm.*',
];

const cacheableFilePattern = `\\.(${cacheableFileTypes.join('|')})$`;

const createEventMetadata = (event) => {
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
  const isCacheableFile = url.match(cacheableFilePattern);
  const isPath = /\/$/.test(url);

  // list of request types that are cacheable
  const cacheableCriteria = [
    isCacheableFile,
    isPath,
  ];

  const cacheable = cacheableCriteria.some(cc => cc);

  const metadata = {
    isCacheableFile,
    isPath,
    isCacheable: cacheable,// Does this request match any of the criteria?
  };

  return metadata;
};


const handleCacheSaveError = (request, response) => err => {
  const error = err || new Error('Unknown cache save error');
  log('problem saving request cache:', error);
  log(`offending response: <${response}>`);
  // don't throw an exception - failing to cache is not a cardinal sin
  return response;
};


export default {
  gets,
  saves,
  deletesKeys,
  precaches,
  isCacheable,
};
