

export const onMessage = (handler = defaultMessageHandler) => {
  if (!hasWorker()) {
    'There is no service worker, cannot register client message listener'
    return;
  }

  console.log('client message listener registered');
  navigator.serviceWorker.addEventListener('message', getMessage(handler));
}

export const send = (message) => {
  if (!hasWorker()) {
    console.log(`There is no service worker, cannot send client message: "${message}"`);
    return;
  }
  console.log(`sending client message: "${message}"`);
  return new Promise(function(resolve, reject) {
    var messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = function(event) {
      console.log(`Server message received: "${JSON.stringinfy(event)}"`);
      if (event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data);
      }
    };
    navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
  });
};
/* Helpers */
const defaultMessageHandler = function(event) {
  const message = event.data;
  console.log('message: ' + message);
  return message;
};

const getMessage = (handler = defaultMessageHandler) => event => handler(event.data);

const hasWorker = (source = "messenger") => {
  const hasWorker = navigator && ('serviceWorker' in navigator);
  if(!hasWorker){
    console.log('This browser does not support service workers. - ' + source);
  }
  return hasWorker;
};
/* /Helpers */

export const messenger = {
  send,
  onMessage,
}

export default messenger;
