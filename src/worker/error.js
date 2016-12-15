import log from "./log";

export const defaultErrorMessage = "The service worker encountered an error";
export const baseErrorResponse = {
  status: 500,
  type: "error",
  isResponse: true,
  isError:true,
  message: defaultErrorMessage,
  inner: null,
};

export const getServerErrorResponse = (error={}) => {
  const {status=501, message="unknown server error", inner="no inner exception"} = error;
  log(`ERROR encountered by server (status: ${status}): ${message} ;`, inner);
  return Object.assign({},
    baseErrorResponse, // load the defaults
    error, // overload the defaults with known values
  );
}

export const getEventError = (event, status=500, innerError = new Error("An unknown event error")) => {
    const url = getURL(event) || "Unknown request URL";
    const message = `cache miss for failed network request status<${status}>: ${url}\n ERROR: ${innerError}`;
    log("ERROR: " + message + " ", innerError);
    getServerErrorResponse({message,});
  };

export const hasError = (response) =>{
  const error = !response || response.status !== 200;
  return error;
};

const getURL = (e) => e && e.request && e.request.url;

export const getErrorResponse = (error = new Error('an anonymous error occurred'), event, inner="no inner error") => {
  const status = error.status || 501;
  const message = error.message || "Anonymous Event Error";
  const url = getURL(event) || "Unknown request URL";
  const message = `cache miss for failed network request status<${status}>: ${url}\n ERROR: ${innerError}`;
  log("ERROR: " + message + " ", innerError);
  getServerErrorResponse({status, message, inner});

}

export const rethrowErrorAsResponse = (errorOrResponse={}, event) => {

  const {isResponse=false} = errorOrResponse;
  const errorResponse = isResponse ? errorOrResponse : getErrorResponse(errorOrResponse, event);

  if(isResponse && errorResponse.type === 'error'){
    throw(errorResponse);
  }

  // echo back the data
  return errorOrResponse;
}

export const asErrorResponse = (response = {}) => {
  log("processing an error response");
  const message = response.message || defaultErrorMessage;
  const errorResponse = { // convert non-http errors to the http error format
    status: 500,
    type: 'error',
    message,
    inner: response,
  };

  log(`error response message is: ${message}`);
  return errorResponse;
};
