const withTM = require("next-transpile-modules")(["@bobaboard/ui-components"], {
  resolveSymlinks: false,
});
const path = require("path");

module.exports = withTM({
  webpack: (config, { webpack, buildId, isServer }) => {
    // config.resolve.alias["react"] = path.resolve(
    //   __dirname,
    //   ".",
    //   "node_modules",
    //   "react"
    // );
    // config.resolve.alias["react-dom"] = path.resolve(
    //   __dirname,
    //   ".",
    //   "node_modules",
    //   "react-dom"
    // );
    // if (isServer) {
    //   config.externals = ["react", "react-dom", ...config.externals];
    // }

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
