const withTM = require("next-transpile-modules")(["@bobaboard/ui-components"], {
  resolveSymlinks: false,
  debug: true,
});
const path = require("path");

module.exports = withTM({
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
        "process.env": {
          BUILD_ID: JSON.stringify(buildId),
        },
      })
    );

    return config;
  },
});
