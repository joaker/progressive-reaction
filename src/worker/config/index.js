export const config = {
  name: 'progressive-scheduler-cache-name',
  options: {
    headers: {
      'Content-Type': 'text/html'
    },
  },
  staticFiles: [
    "/",
    "/bundles/AppShell.js",
    "/bundles/service-worker.js",
  ],
};

export default config;
