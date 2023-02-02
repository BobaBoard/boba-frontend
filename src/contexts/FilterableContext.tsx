import { ArrayParam } from "use-query-params";
import React from "react";
// import debug from "debug";
import { isNotNull } from "utils/typescript-utils";
import { useQueryParams } from "use-query-params";

//const log = debug("bobafrontend:contexts:RealmContext-log");
// const info = debug("bobafrontend:contexts:FilterableContext-info");

export const FilterParams = {
  filter: ArrayParam,
  filteredNotices: ArrayParam,
};

const FilterableContext = React.createContext<
  | {
      activeCategories: string[];
      setActiveCategories: (categories: string[]) => void;
      filteredNotices: string[];
      setFilteredNotices: (filters: string[]) => void;
    }
  | undefined
>(undefined);

const useFilterableContext = () => {
  const context = React.useContext(FilterableContext);
  if (context === undefined) {
    throw new Error(
      "useFilterableContext must be used within a FilterableContextProvider"
    );
  }
  return context;
};

const useActiveCategories = () => {
  const context = React.useContext(FilterableContext);
  if (context === undefined) {
    throw new Error(
      "useActiveCategories must be used within a FilterableContextProvider"
    );
  }
  return context.activeCategories;
};

const useSetActiveCategories = () => {
  const context = React.useContext(FilterableContext);
  if (context === undefined) {
    throw new Error(
      "useSetActiveCategories must be used within a FilterableContextProvider"
    );
  }
  return context.setActiveCategories;
};

const FilterableContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [{ filter, filteredNotices }, setQuery] = useQueryParams(FilterParams);
  const setActiveCategories = React.useCallback(
    (activeCategories: string[]) => {
      setQuery(
        {
          filter: activeCategories.length == 1 ? activeCategories : undefined,
        },
        "pushIn"
      );
    },
    [setQuery]
  );
  const setFilteredNotices = React.useCallback(
    (filteredNotices: string[]) => {
      setQuery(
        {
          filteredNotices:
            filteredNotices.length >= 1 ? filteredNotices : undefined,
        },
        "pushIn"
      );
    },
    [setQuery]
  );

  return (
    <FilterableContext.Provider
      value={React.useMemo(
        () => ({
          activeCategories: (filter ?? []).filter(isNotNull),
          setActiveCategories,
          filteredNotices: (filteredNotices ?? []).filter(isNotNull),
          setFilteredNotices: setFilteredNotices,
        }),
        [filter, setActiveCategories, filteredNotices, setFilteredNotices]
      )}
    >
      {children}
    </FilterableContext.Provider>
  );
};
const MemoizedProvider = React.memo(FilterableContextProvider);

export {
  MemoizedProvider as FilterableContextProvider,
  useFilterableContext,
  useActiveCategories,
  useSetActiveCategories,
};
