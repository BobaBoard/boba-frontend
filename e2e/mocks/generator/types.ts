export interface OpenApi {
  paths: Path;
  components: {
    examples: { [name: string]: { value: unknown } };
  };
}

export enum HttpMethods {
  get = "get",
  post = "post",
  patch = "patch",
  delete = "delete",
}

export interface Path {
  [url: string]: Methods;
}

export interface ParamExampleEntry {
  [exampleName: string]: { value: string };
}

export interface ParamsObject {
  name: string;
  examples?: ParamExampleEntry;
}

export interface ResponseObject {
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

export interface EndpointDetails {
  parameters?: ParamsObject[];
  responses?: ResponseObject;
}

export type Methods = {
  [key in HttpMethods]: EndpointDetails;
};

export interface GeneratedExample {
  name: string;
  params: {
    [paramName: string]: string;
  };
  response:
    | {
        status: number;
        value: unknown;
      }
    | Record<string, never>;
}

export interface GeneratedPaths {
  path: string;
  methods: {
    method: string;
    examples: GeneratedExample[];
  }[];
}
