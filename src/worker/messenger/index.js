
export const send = (message = "message for clients") => {
  self.clients.matchAll().then(function(clients) {
    clients.forEach(function(client) {
      console.log(client);
      client.postMessage(message);
    });
  });
};

export const respond = (event) => (message) => {
  event.ports[0].postMessage(message);
};

export const onMessage = handler => {
  self.addEventListener('message', handler);
};

export const messenger = {
  send,
  onMessage,
  respond,
};

export default messenger;
