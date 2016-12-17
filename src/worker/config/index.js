export const config = {
  name: 'progressive-reaction-cache-name',
  cacheFirst: true,
  options: {
    headers: {
      'Content-Type': 'text/html'
    },
  },
  staticFiles: [ // we don't want to cache assets that will be inclduded by default
  ],
};

export default config;
