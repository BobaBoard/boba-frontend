import { readFile, writeFile } from "fs/promises";

import util from "util";

enum HttpMethods {
  get = "get",
  post = "post",
  patch = "patch",
  delete = "delete",
}

interface Path {
  [url: string]: Methods;
}

// interface ExampleEntry {
//   [exampleName: string]: { value: unknown };
// }

interface ParamExampleEntry {
  [exampleName: string]: { value: string };
}

interface ParamsObject {
  name: string;
  examples?: ParamExampleEntry;
}

interface ResponseObject {
  [code: string]: {
    content?: {
      "application/json": {
        examples?: {
          [exampleName: string]: { value: Record<string, unknown> };
        };
      };
    };
  };
}

interface EndpointDetails {
  parameters?: ParamsObject[];
  responses?: ResponseObject;
}

type Methods = {
  [key in HttpMethods]: EndpointDetails;
};

interface OpenApi {
  paths: Path;
  components: {
    examples: { [name: string]: { value: unknown } };
  };
}

const generatePath = (
  [method, spec]: [string, EndpointDetails],
  definition: OpenApi
) => {
  const paramsExamples = getExamplesFromParams(spec.parameters);
  const responsesExamples = getExamplesFromResponses(
    spec.responses,
    definition
  );

  // Extract all the keys for examples
  const allExamples = new Set([
    ...Object.values(paramsExamples).flatMap((example) => Object.keys(example)),
    ...Object.keys(responsesExamples),
  ]);
  return {
    method,
    examples: Array.from(allExamples).map((exampleName) => ({
      name: exampleName,
      // getExamplesFromParams returns a list of params and their value for each example.
      // Here we turn it into a list of each example, and the value for each param in that example.
      params: Object.entries(paramsExamples).reduce(
        (previous, [paramName, value]) => {
          previous[paramName] = value[exampleName];
          return previous;
        },
        {} as { [paramName: string]: string }
      ),
      response: responsesExamples[exampleName] || {},
    })),
  };
};

const getExamplesFromParams = (params?: ParamsObject[]) => {
  return (
    params
      ?.filter((param) => !!param.examples)
      .reduce((previous, param) => {
        previous[param.name] = {};
        for (const [exampleName, exampleValue] of Object.entries(
          param.examples!
        )) {
          previous[param.name][exampleName] = exampleValue.value;
        }
        return previous;
      }, {} as { [paramName: string]: { [exampleName: string]: string } }) || {}
  );
};

const getExamplesFromResponses = (
  responses: ResponseObject | undefined,
  definition: OpenApi
) => {
  if (!responses) {
    return {};
  }
  return (
    Object.entries(responses)
      ?.filter(([, value]) => !!value?.content?.["application/json"]?.examples)
      .reduce((previous, [status, value]) => {
        for (const [exampleName, exampleValue] of Object.entries(
          value.content!["application/json"].examples!
        )) {
          previous[exampleName] = {
            status: parseInt(status),
            value: maybeResolveRef(exampleValue as any, definition),
          };
        }
        return previous;
      }, {} as { [exampleName: string]: { status: number; value: unknown } }) ||
    {}
  );
};

const maybeResolveRef = (entryValue: Record<string, string>, spec: OpenApi) => {
  if (entryValue["$ref"]) {
    const exampleName = entryValue["$ref"].substring(
      "#/components/examples/".length
    );
    return spec.components.examples[exampleName]?.value;
  }
  return entryValue;
};

const generatePaths = (spec: OpenApi): GeneratedPaths[] => {
  return Object.entries(spec.paths).map(([key, value]) => {
    return {
      path: key,
      methods: Object.entries(value).map((method) =>
        generatePath(method, spec)
      ),
    };
  });
};

const logDetails = (toLog: unknown) => {
  console.log(util.inspect(toLog, { depth: null }));
};

const getExamplePath = (path: string, example: GeneratedExample) => {
  let url = `http://localhost:4200${path}`;
  Object.entries(example.params).forEach(([paramName, paramValue]) => {
    url = url.replace(`{${paramName}}`, paramValue);
  });
  return url;
};

interface GeneratedExample {
  name: string;
  params: {
    [paramName: string]: string;
  };
  response: {
    status: number;
    value: unknown;
  };
}

interface GeneratedPaths {
  path: string;
  methods: {
    method: string;
    examples: GeneratedExample[];
  }[];
}

const toMswHandlers = (results: ReturnType<typeof generatePaths>) => {
  return results
    .flatMap((result) => {
      return result.methods.flatMap((method) => {
        return method.examples.flatMap((example) => {
          if (!example.response.status) {
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
  const result = generatePaths(spec);
  writeHandlers(toMswHandlers(result));
  logDetails("done");
});
