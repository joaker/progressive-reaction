
export const send = (worker) => (message = "message for clients") => {
  console.log("worker is:");
  console.log(worker);
  worker.clients.matchAll().then(function(clients) {
    clients.forEach(function(client) {
      console.log(client);
      client.postMessage(message);
    });
  });
};

export const respond = (event) => (message) => {
  event.ports[0].postMessage(message);
};

export const onMessage = worker => handler => {
  worker.addEventListener('message', handler);
};

export const createMesssenger = worker => ({
  send: send(worker),
  onMessage: onMessage(worker),
  respond,
});

export default createMesssenger;
