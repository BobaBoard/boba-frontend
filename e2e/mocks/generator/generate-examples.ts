import { readFile, writeFile } from "fs/promises";

import { OpenApi } from "./types";
import generatePathsData from "./generate-paths-data.js";
import mswTransformer from "./msw-transformer.js";

const writeHandlers = (handlers: string[]) => {
  writeFile(
    process.cwd() + "/e2e/mocks/generated.ts",
    `
  import { rest } from "msw";
  
  export default [
  ${handlers.join(",")}
  ] 
  `
  );
};

const parseSpec = async () => {
  const spec = await readFile(
    process.cwd() + "/e2e/mocks/open-api-spec.json",
    "utf8"
  );
  return JSON.parse(spec);
};

parseSpec().then((spec: OpenApi) => {
  const result = generatePathsData(spec);
  writeHandlers(mswTransformer(result));
  console.log("done");
});
