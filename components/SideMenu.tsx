import React from "react";
import {
  SideMenu as LibSideMenu,
  // @ts-ignore
} from "@bobaboard/ui-components";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { getAllBoardsData } from "../utils/queries";

const SideMenu: React.FC<{
  onBoardChange?: (slug: string) => void;
}> = (props) => {
  const router = useRouter();
  const {
    data: pinnedBoards,
    isFetching: isFetchingBoardData,
    error: boardDataError,
  } = useQuery("pinnedBoards", getAllBoardsData);

  if (isFetchingBoardData || boardDataError) {
    return <div />;
  }
  return (
    <LibSideMenu
      pinnedBoards={pinnedBoards.map((board: any) => ({
        slug: board.slug,
        avatar: `${board.avatarUrl}`,
        description: board.tagline,
        color: board.settings?.accentColor,
        onClick: (slug: string) => {
          router.push(`/[boardId]`, `/!${slug}`);
          props.onBoardChange?.(slug);
        },
      }))}
      searchBoards={undefined}
      recentBoards={undefined}
      showSearch={false}
    />
  );
};

export default SideMenu;
