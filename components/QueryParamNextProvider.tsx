import React, { memo, useMemo } from "react";

import { QueryParamProvider as ContextProvider } from "use-query-params";
import { NextRouter } from "next/router";

export const QueryParamProviderComponent = (props: {
  children?: React.ReactNode;
  router: NextRouter;
}) => {
  const { children, router } = props;
  const match = router.asPath.match(/[^?]+/);
  const pathname = match ? match[0] : router.asPath;

  const location = useMemo(
    () =>
      typeof window !== "undefined"
        ? window.location
        : ({
            search: router.asPath.replace(/[^?]+/u, ""),
          } as Location),
    [router.asPath]
  );

  const history = useMemo(
    () => ({
      push: ({ search }: Location) =>
        router.push(
          { pathname: router.pathname, query: router.query },
          { search, pathname }
        ),
      replace: ({ search }: Location) =>
        router.replace(
          { pathname: router.pathname, query: router.query },
          { search, pathname }
        ),
      location,
    }),
    [pathname, router.pathname, router.query, location.pathname]
  );

  return (
    <ContextProvider history={history} location={location}>
      {children}
    </ContextProvider>
  );
};

export const QueryParamProvider = memo(QueryParamProviderComponent);

export const ExistanceParam = {
  encode: (exists: boolean | null | undefined) => (exists ? null : undefined),

  decode: (value: string | (string | null)[] | null | undefined) =>
    typeof value == "string" || value === null ? true : false,
};
