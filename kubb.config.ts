import createSwagger from "@kubb/swagger";
// import createSwaggerTanstackQuery from "@kubb/swagger-tanstack-query";
import createSwaggerClient from "@kubb/swagger-client";
import createSwaggerTS from "@kubb/swagger-ts";
// import createSwaggerZod from "@kubb/swagger-zod";
import { defineConfig } from "@kubb/core";
import openApiSpec from "@bobaboard/boba-backend-open-api";

console.log(openApiSpec);

export default defineConfig(async () => {
  return {
    root: ".",
    input: {
      path: "./open-api.yaml",
    },
    output: {
      path: "./src/lib/api/generated",
      clean: true,
    },
    plugins: [
      createSwagger({}),
      createSwaggerTS({}),
      // createSwaggerZod({}),
      createSwaggerClient({
        // copy paste of @kubb/swagger-client/client
        client: "src/lib/api/client.ts",
        dataReturnType: "full",
      }),
      // createSwaggerTanstackQuery({}),
    ],
  };
});
