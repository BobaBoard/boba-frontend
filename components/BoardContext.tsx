import React from "react";
import debug from "debug";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { getBoardData, getAllBoardsData } from "../utils/queries";
import { BoardData } from "../types/Types";

const BoardThemeContext = React.createContext({} as any);

const useBoardContext = () =>
  React.useContext<{ [key: string]: BoardData } & { fetching: string }>(
    BoardThemeContext
  );

const log = debug("bobafrontend:boardTheme-log");

const BoardContextProvider: React.FC<{}> = (props) => {
  const router = useRouter();
  const [themeData, setThemeData] = React.useState<{
    [key: string]: BoardData;
  }>({});
  const { data: boardData } = useQuery(
    ["boardThemeData", { slug: router.query.boardId?.slice(1) }],
    getBoardData,
    { staleTime: Infinity }
  );
  const { data: pinnedBoards } = useQuery("boardsThemeData", getAllBoardsData, {
    staleTime: Infinity,
  });

  React.useEffect(() => {
    if (pinnedBoards) {
      log(pinnedBoards);
      const newThemeData: { [key: string]: BoardData } = pinnedBoards.reduce(
        (agg: {}, value: any) => {
          agg[value.slug] = {
            slug: value.slug,
            avatarUrl: value.avatarUrl,
            tagline: value.tagline,
            accentColor: value.settings.accentColor,
            descriptions: themeData[value.slug]?.descriptions,
            muted: value.muted || themeData[value.slug]?.muted,
            permissions: themeData[value.slug]?.permissions,
            postingIdentities: themeData[value.slug]?.postingIdentities,
            suggestedCategories: themeData[value.slug]?.suggestedCategories,
          };
          return agg;
        },
        {}
      );
      setThemeData({
        ...themeData,
        ...newThemeData,
      });
    }
  }, [pinnedBoards]);

  React.useEffect(() => {
    if (boardData) {
      const newThemeData = {
        ...themeData,
      };
      newThemeData[boardData.slug] = {
        slug: boardData.slug,
        avatarUrl: boardData.avatarUrl,
        tagline: boardData.tagline,
        accentColor: boardData.settings.accentColor,
        descriptions: boardData.descriptions,
        muted: boardData.muted || false,
        permissions: boardData.permissions,
        postingIdentities: boardData.postingIdentities,
        suggestedCategories: boardData.descriptions?.flatMap(
          (description: any) => description.categories || []
        ),
      };
      setThemeData(newThemeData);
    }
  }, [boardData]);

  return <BoardThemeContext.Provider value={themeData} {...props} />;
};

export { BoardContextProvider, useBoardContext };
