import { NextPageContext } from "next/dist/next-server/lib/utils";

export const getCurrentHost = (
  serverHost: string | undefined,
  withPort?: boolean
) => {
  return typeof window !== "undefined"
    ? window.location.hostname
    : serverHost?.substr(
        0,
        withPort || serverHost?.indexOf(":") == -1
          ? undefined
          : serverHost?.indexOf(":")
      );
};

export const getCurrentSearchParams = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.search;
};

const REALM_SLUG_SEPARATOR_LOCAL = "_";
const SUBDOMAIN_REGEX = /(?:http[s]*:\/\/)*(?<sub>.*?)\.(?=[^/]*\..{2,5})/i;
const getRealmFromHostname = (hostname: string) => {
  if (isLocalhost(hostname)) {
    return hostname.substring(0, hostname.indexOf(REALM_SLUG_SEPARATOR_LOCAL));
  }
  // TODO: this will need work for staging
  return hostname.match(SUBDOMAIN_REGEX)?.groups?.["sub"] || "v0";
};
const getClientSideRealm = () => {
  if (typeof window === "undefined") {
    throw new Error("getClientSideRealm should only be called on the client");
  }
  return getRealmFromHostname(window.location.hostname);
};

export const getCurrentRealmSlug = ({
  serverHostname,
}: {
  serverHostname: string | undefined;
}) => {
  if (
    isStaging(serverHostname) &&
    isLocalhost(getCurrentHost(serverHostname))
  ) {
    return "v0";
  }
  if (typeof window === "undefined") {
    if (serverHostname) {
      return getRealmFromHostname(serverHostname);
    }
    throw new Error(
      "Server hostname required to get current realm slug on server."
    );
  }
  return getClientSideRealm();
};

const SANDBOX_LOCATIONS = ["tys-sandbox.boba.social"];
export const isSandbox = (context: NextPageContext | undefined) => {
  if (process.env.NEXT_PUBLIC_TEST_SANDBOX === "true") {
    return true;
  }
  const currentHost = getCurrentHost(context?.req?.headers?.host);
  return currentHost && SANDBOX_LOCATIONS.includes(currentHost);
};

const ALLOWED_SANDBOX_LOCATIONS = {
  ["localhost"]: [
    "/!gore/thread/8b2646af-2778-487e-8e44-7ae530c2549c",
    "/!anime/thread/b27710a8-0a9f-4c09-b3a5-54668bab7051",
  ],
  "tys-sandbox.boba.social": [
    "/!challenge/thread/659dc185-b10d-4dbb-84c5-641fc1a65e58",
    "/!steamy/thread/9719a1dd-96da-497e-bd71-21634c20416c",
  ],
};
export const isAllowedSandboxLocation = (
  context: NextPageContext | undefined
) => {
  const currentHost = getCurrentHost(context?.req?.headers?.host);
  if (!context || !context.asPath || !isSandbox(context) || !currentHost) {
    return true;
  }
  return ALLOWED_SANDBOX_LOCATIONS[currentHost].includes(context.asPath);
};

export const getRedirectToSandboxLocation = (
  context?: NextPageContext | undefined
) => {
  const currentHost = getCurrentHost(context?.req?.headers?.host);
  if (!currentHost || !isSandbox(context)) {
    throw new Error(
      "No valid current host in sandbox location, or tried sandbox redirect in non-sandbox environment."
    );
  }
  return ALLOWED_SANDBOX_LOCATIONS[currentHost][0];
};

export const isLocalhost = (hostName?: string | undefined) => {
  return !!(
    hostName?.startsWith("localhost") ||
    hostName?.startsWith("192.") ||
    hostName?.endsWith(".local")
  );
};

export const isStaging = (serverHostname?: string | undefined) => {
  if (process.env.NEXT_PUBLIC_ENV == "staging") {
    return true;
  }
  return !!serverHostname?.startsWith("staging");
};

export const getServerBaseUrl = (context?: NextPageContext) => {
  const currentHost = getCurrentHost(context?.req?.headers?.host);
  const staging = isStaging(currentHost);
  if (process.env.NODE_ENV == "production") {
    return staging
      ? "https://staging-dot-backend-dot-bobaboard.uc.r.appspot.com/"
      : "https://backend-dot-bobaboard.uc.r.appspot.com/";
  }

  if (process.env.NEXT_PUBLIC_DEFAULT_BACKEND) {
    return process.env.NEXT_PUBLIC_DEFAULT_BACKEND;
  }

  if (!context) {
    return `http://localhost:4200/`;
  }

  let backendLocation = "";
  const localhost = isLocalhost(currentHost);
  if (localhost) {
    backendLocation = currentHost || "localhost";
  } else if (staging) {
    backendLocation = `staging-dot-backend-dot-bobaboard.uc.r.appspot.com`;
  } else {
    backendLocation = "backend-dot-bobaboard.uc.r.appspot.com";
  }

  // Remove the port if there is currently one
  if (backendLocation.indexOf(":") != -1) {
    backendLocation = backendLocation.substring(
      0,
      backendLocation.indexOf(":")
    );
  }

  return localhost
    ? `http://${backendLocation}:4200/`
    : `https://${backendLocation}/`;
};
