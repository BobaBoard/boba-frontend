import { GeneratedExample, GeneratedPaths } from "./types";

const getExamplePath = (path: string, example: GeneratedExample) => {
  let url = `http://localhost:4200${path}`;
  Object.entries(example.params).forEach(([paramName, paramValue]) => {
    url = url.replace(`{${paramName}}`, paramValue);
  });
  return url;
};

const toMswHandlers = (results: GeneratedPaths[]) => {
  return results
    .flatMap((result) => {
      return result.methods.flatMap((method) => {
        return method.examples.flatMap((example) => {
          if (!("status" in example.response)) {
            return null;
          }
          const path = getExamplePath(result.path, example);
          return `rest.${method.method}("${path}", (_, res, ctx) => {
            return res(
              ctx.status(${example.response.status}),
              ctx.json(${JSON.stringify(example.response.value)})
            );
          })`;
        });
      });
    })
    .filter((result): result is string => !!result);
};

export default toMswHandlers;
