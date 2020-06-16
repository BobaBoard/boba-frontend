import React from "react";

import { getBoardData, getAllBoardsData } from "./../utils/queries";

const BoardThemeContext = React.createContext({} as any);

const useBoardTheme = () => React.useContext(BoardThemeContext);
import { useRouter } from "next/router";
import { useQuery } from "react-query";

const BoardThemeProvider: React.FC<{}> = (props) => {
  const router = useRouter();
  const [themeData, setThemeData] = React.useState({});
  const { data: boardData } = useQuery(
    ["boardData", { slug: router.query.boardId?.slice(1) }],
    getBoardData,
    { staleTime: Infinity }
  );
  const { data: pinnedBoards } = useQuery("allBoardsData", getAllBoardsData, {
    staleTime: Infinity,
  });

  React.useEffect(() => {
    if (pinnedBoards) {
      console.log(pinnedBoards);
      const newThemeData = pinnedBoards.reduce((agg: {}, value: any) => {
        agg[value.slug] = {
          slug: value.slug,
          avatarUrl: value.avatarUrl,
          tagline: value.tagline,
          accentColor: value.settings.accentColor,
        };
        return agg;
      }, {});
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
      };
      setThemeData(newThemeData);
    }
  }, [boardData]);

  return <BoardThemeContext.Provider value={themeData} {...props} />;
};

export { BoardThemeProvider, useBoardTheme };
