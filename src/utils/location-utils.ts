import { NextPageContext } from "next/dist/shared/lib/utils";
import getConfig from "next/config";

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
  if (isLocal(hostname)) {
    return hostname.substring(0, hostname.indexOf(REALM_SLUG_SEPARATOR_LOCAL));
  }
  if (isStaging(hostname)) {
    // Everything in staging is fixed to v0.
    return "v0";
  }
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
  if (isLocal(getCurrentHost(serverHostname))) {
    if (isStaging(serverHostname)) {
      return "v0";
    }
    if (isLocalhost(serverHostname)) {
      return "twisted-minds";
    }
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

export const isLocal = (hostName?: string | undefined) => {
  return !!(
    hostName?.startsWith("localhost") ||
    hostName?.startsWith("192.") ||
    hostName?.endsWith(".local") ||
    hostName?.endsWith(".local:3000")
  );
};

export const isLocalhost = (hostName?: string | undefined) => {
  if (typeof window !== "undefined") {
    return window.location.hostname.startsWith("localhost");
  }
  return hostName?.startsWith("localhost");
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
  const { publicRuntimeConfig } = getConfig();

  if (publicRuntimeConfig.defaultBackendUrl) {
    return publicRuntimeConfig.defaultBackendUrl;
  }

  // TODO: remove this hardcoding completely and only use the environment variables
  if (process.env.NODE_ENV == "production") {
    return staging
      ? "https://staging-dot-backend-dot-bobaboard.uc.r.appspot.com/"
      : "https://backend-dot-bobaboard.uc.r.appspot.com/";
  }

  if (!context) {
    return `http://localhost:4200/`;
  }

  let backendLocation = "";
  const localhost = isLocal(currentHost);
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

export const isClientContext = (context: NextPageContext) => {
  return !context.req;
};
