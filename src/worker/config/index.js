export const config = {
  name: 'progressive-scheduler-cache-name',
  cacheFirst: true,
  options: {
    headers: {
      'Content-Type': 'text/html'
    },
  },
  staticFiles: [ // we don't want to cache assets that will be inclduded by default
    // "/",
    // "/AppShell.bundle.js",
  ],
};

export default config;
