const withTM = require("next-transpile-modules")(["@bobaboard/ui-components"], {
  resolveSymlinks: false,
});
const path = require("path");
const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require("next/constants");

const config = {
  webpack: (config, { webpack, buildId, isServer }) => {
    const nodeModulesPath = path.resolve(
      process.env.NODE_MODULES_PARENT_PATH ?? __dirname,
      ".",
      "node_modules"
    );

    config.resolve.alias["react"] = path.resolve(nodeModulesPath, "react");
    config.resolve.alias["react-dom"] = path.resolve(
      nodeModulesPath,
      "react-dom"
    );
    if (isServer) {
      config.externals = ["react", "react-dom", ...config.externals];
    }

    config.plugins.push(
      new webpack.DefinePlugin({
        "process.env.BUILD_ID": JSON.stringify(buildId),
      })
    );

    return config;
  },
  publicRuntimeConfig: {
    defaultBackendUrl: process.env.DEFAULT_BACKEND || "http://localhost:4200",
    onlyHereToStopBug: "I hate bugs",
  },
};
// Only transpile boba-component modules during development or as building for production
// (so don't transpile when starting the production server)
module.exports = (phase) =>
  phase == PHASE_DEVELOPMENT_SERVER || phase == PHASE_PRODUCTION_BUILD
    ? withTM(config)
    : config;
