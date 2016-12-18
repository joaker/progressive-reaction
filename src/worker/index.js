// References:
// https://github.com/MicheleBertoli/react-worker
// https://github.com/mdn/sw-test/blob/gh-pages/sw.js

/* Synchronously import scripts into a worker */
//self.importScripts('serviceworker-cache-polyfill.js');
//self.importScripts('build.js');
import config from './config';
import createMessenger from './messenger';
import {fetchMiddleware} from "./middleware/fetch";
import {activateMiddleware} from "./middleware/activate";
import {installMiddleware} from "./middleware/install";

const workerRegistration = self;
const messenger = createMessenger(workerRegistration);

const log = (msg) => console.log(msg);

/* START Messenging */
// messenger.onMessage = (message) => {
//   log("hey there, got a message for you:");
//   log(message);
// }
messenger.onMessage((message) => {
  log("hey there, got a message for you:");
  log(message);
});
messenger.send("hello, worker");
/* END Messenging */

/* START Event Handler Registration*/
self.addEventListener('fetch', fetchMiddleware);
self.addEventListener('activate', activateMiddleware);
self.addEventListener('install', installMiddleware);
