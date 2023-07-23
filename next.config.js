const path = require("path");

// This is here because Nix needs to be given the node_module path explicitly to resolve it at serve time
const nodeModulesPath = path.resolve(
  process.env.NODE_MODULES_PARENT_PATH ?? __dirname,
  ".",
  "node_modules"
);
const withTM = require("next-transpile-modules")(
  [path.resolve(nodeModulesPath, "@bobaboard/ui-components")],
  {
    resolveSymlinks: false,
  }
);

const config = {
  webpack: (config, { webpack, buildId, isServer }) => {
    config.resolve.alias["react"] = path.resolve(nodeModulesPath, "react");
    config.resolve.alias["react-dom"] = path.resolve(
      nodeModulesPath,
      "react-dom"
    );
    config.resolve.alias["styled-jsx"] = path.resolve(
      nodeModulesPath,
      "styled-jsx"
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
    // This cannot be given directly as process.env variable because Next will embed it in at compile time
    defaultBackendUrl: process.env.DEFAULT_BACKEND || "http://localhost:4200",
  },
};

module.exports = withTM(config);
