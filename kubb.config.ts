import createSwagger from "@kubb/swagger";
// import createSwaggerTanstackQuery from "@kubb/swagger-tanstack-query";
import createSwaggerClient from "@kubb/swagger-client";
import createSwaggerTS from "@kubb/swagger-ts";
import { defineConfig } from "@kubb/core";
// import openApiSpec from "@bobaboard/boba-backend-open-api";

export default defineConfig(async () => {
  return {
    root: ".",
    input: {
      path: "./open-api.yaml",
    },
    output: {
      path: "./kubb/gen",
      clean: true,
    },
    plugins: [
      createSwagger({}),
      createSwaggerTS({}),
      createSwaggerClient({
        // copy paste of @kubb/swagger-client/client
        client: "src/lib/api/client.ts",
        // dataReturnType: "full",
      }),
      // createSwaggerTanstackQuery({}),
    ],
  };
});
