import React from "react";
import {
  SideMenu as LibSideMenu,
  // @ts-ignore
} from "@bobaboard/ui-components";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import axios from "axios";

const getBoardData = async (key: string) => {
  const response = await axios.get(`boards`);
  return response.data;
};
const SideMenu: React.FC<{}> = (props) => {
  const router = useRouter();
  const {
    data: pinnedBoards,
    isFetching: isFetchingBoardData,
    error: boardDataError,
  } = useQuery("pinnedBoards", getBoardData);

  if (isFetchingBoardData || boardDataError) {
    return <div />;
  }
  return (
    <LibSideMenu
      pinnedBoards={pinnedBoards.map((board: any) => ({
        slug: board.slug,
        avatar: `${board.avatar_reference_id}`,
        description: board.tagline,
        color: board.settings?.accentColor,
        onClick: (slug: string) => router.push(`/!${slug}`),
      }))}
      searchBoards={undefined}
      recentBoards={undefined}
      showSearch={false}
    />
  );
};

export default SideMenu;
