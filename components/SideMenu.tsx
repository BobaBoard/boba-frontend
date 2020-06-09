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
  isLoggedIn?: boolean;
}> = (props) => {
  const router = useRouter();
  const {
    data: pinnedBoards,
    isFetching: isFetchingBoardData,
    error: boardDataError,
    refetch,
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
        updates: props.isLoggedIn && board.has_updates,
        onClick: (slug: string) => {
          router.push(`/[boardId]`, `/!${slug}`);
          props.onBoardChange?.(slug);
          // TODO: do this on board opening
          setTimeout(() => {
            refetch({ force: true });
          }, 2000);
        },
      }))}
      searchBoards={undefined}
      recentBoards={undefined}
      showSearch={false}
    />
  );
};

export default SideMenu;
