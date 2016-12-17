import log from "../log";
import config from "../config";

// import {
//   defaultErrorMessage,
//   baseServerError,
//   hasError,
//   getEventError,
//   getServerErrorResponse,
//   asErrorResponse
// } from "../error";

import Cache from "../cache";

const mayCache = (event) => {
  const isScript= /\.js$/.test(url);
  const isStyle= /\.css$/.test(url);
  const isHTML= /\.htm.*/.test(url);
  const isPath = /\/$/.test(url);

  const whitelist = [
    isScript,
    isStyle,
    isHTML,
    isPath
  ];

  const cacheable = whitelist.some(c => c);
  return cacheable;
};



export const fetchMiddleware = (event = {}) => {
  const {request = {}} = event;
  const {url="https://github.com/joaker", method = "GET"} = request;
  log(`Request issued for: ${url}, for event: ${JSON.stringify(event)}`);
  log(`still, the method is: ${request.method}`)

  const cacheable = Cache.isCacheable(event);

  if(!cacheable) return;  // this thing doiesn't have caching.  Use the normal workflow

  const fetcher = createFetcher(event);
  const {fromCache, fromNetwork, reportError, savesCache} = fetcher;
  log('getting response');
  const getsResponse = fromCache().catch( cacheError =>
    reportError("WARNING")(cacheError)  // this will squash the error, unless it's "fatal"
      .then(fromNetwork)  // ask the network for the missing cache entry
      .then(networkResponse => {

        log(`typeof networkResponse: %%{typeof networkResponse}%%`)

        return savesCache(request, networkResponse); // save the good network response for future use
      })
    ).then(resp => {
      log(`a 'valid' response was found: ${resp} -- ${JSON.stringify(resp)}`);
      if(!resp){
        throw Error("no bad response");
      }
      return resp;
    }).catch(e => {
      const error = e || {};
      const status = 500;
      const statusText = e.message || 'a server error has occurred';
      const stack = e.stack || "<no stack trace available>";
      log(statusText, e);

      return new Response(stack, {
        status,
        statusText,
      });
    });

  event.respondWith(getsResponse.then(r => {
    log(`get a response (type: ${typeof r}) (stringified: ${JSON.stringify(r)}) (val:${r})`);
    return r;
  }));

};

const createErrorReporterFactory = (event={}, level="ERROR") => (error=null, url="URL not known") => {
  if (!error) {
    throw new Error("!WARNING! an unknown error was reported");
  }

  const {message="A general error", status=501} = error;

  log(`An error (${level}) has occurred: message`, error);

  if(level === "FATAL") throw error; //rethrow fatal errors

  return Promise.resolve(error); // make it 'thenable' for convenience
};

const createEventReporters = (event = {}) => {
  const reporters = {
    FATAL: createErrorReporterFactory(event, "FATAL"),
    ERROR: createErrorReporterFactory(event, "ERROR"),
    WARNING: createErrorReporterFactory(event, "WARNING"),
    INFO: createErrorReporterFactory(event, "INFO"),
  };

  const defaultReporter = reporters.INFO;

  const getReporterForLevel = (level = "ERROR") => (reporters[level] || defaultReporter);
  return getReporterForLevel;
};

const throwCacheMiss = (response) => {
  if(typeof response == 'undefined'){
    throw Error("The cache fetch did not find a response");
  }
  return response;
}
const createFetcher = (event) => {
  const {request={}} = event;
  const {url="UNKNOWN url"} = request;
  const reporters = createEventReporters(event);
  return {
      fromCache: (upstreamError = "no upstream error") => Cache.gets(event).then(throwCacheMiss),
      fromNetwork: (upstreamError = "no upstream error") => getRemoteEvent(event, url),
      savesCache: (request, response) => Cache.saves(request, response),
      reportError: (level = "ERROR") => error => reporters(level)(error, url),
  };
};


const getRemoteEvent = (event, url) => {
  const {request={}} = event;
  return fetch(event.request);
  // return fetchDirect(request);
};



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


const defaultErrorResponse = {status: 501, message: "service worker error"};
export default fetchMiddleware;
