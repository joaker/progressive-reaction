
progressive-reaction is a boilerplate for creating react apps that have progressive web app features

## What works:

* **Bundling:** Webpack generates bundles for both the AppShell and the ServiceWorker
* **Registration:** If your browser supports Service Workers, the "service worker registered" should show up at the bottom of the screen after the first request
* **Caching+Fallback:** GET are loaded from the cache when possible.  Cache misses result in a network call that is then cached for future use

## What might work later:

- Messaging between clients pages and the services
- placeholders for dynamic content when it is unavailable
- Routing to network-only bundles

## Usage

```
$ git clone https://github.com/joaker/progressive-reaction
$ npm i
$ npm start
```

### Exercising the Service Worker
- Make a request for http://localhost:4242
- You can click the button to cause the image to load and cache.  Or not.
- Shut down the server process
- Make a second request for http://localhost:4242 (while the server is no longer running)
- If all is well, your page loaded anyhow.  If the click the button the image will only show up if you previously requested it when you had network connectivity

## Purging Service Workers
Getting rid of Service Workers can be tricky if they got into an unexpected state.  There's an "applications" tab in the debugger console that has a "service workers" sub-tab.  That gives you some control.  But you can [nuke it from orbit](chrome://serviceworker-internals).  It's the only way to be sure

### License

progressive-reaction is [BSD licensed](./LICENSE).

## Troubleshooting
[gl;hf](https://serviceworke.rs/)
