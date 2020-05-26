const withTM = require("next-transpile-modules")(["@bobaboard/ui-components"]);
const path = require("path");

module.exports = withTM({
  webpack: (config, options) => {
    config.resolve.alias["react"] = path.resolve(
      __dirname,
      ".",
      "node_modules",
      "react"
    );
    config.resolve.alias["react-dom"] = path.resolve(
      __dirname,
      ".",
      "node_modules",
      "react-dom"
    );
    if (options.isServer) {
      config.externals = ["react", "react-dom", ...config.externals];
    }

    return config;
  },
});
