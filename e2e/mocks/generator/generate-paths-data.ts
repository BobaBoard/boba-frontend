import {
  EndpointDetails,
  GeneratedPaths,
  OpenApi,
  ParamsObject,
  ResponseObject,
} from "./types";

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

export default generatePaths;
