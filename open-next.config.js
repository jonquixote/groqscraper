// default open-next.config.js file created by @opennextjs/cloudflare

const cache = require("@opennextjs/cloudflare/kvCache");

const config = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      incrementalCache: async () => cache,
      tagCache: "dummy",
      queue: "dummy",
    },
  },

  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
    },
  },

  dangerous: {
    enableCacheInterception: false,
  },
};

module.exports = config;
