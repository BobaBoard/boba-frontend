import { BoardDescription, BoardMetadata } from "types/Types";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import {
  dismissBoardNotifications,
  getBoardMetadata,
  muteBoard,
  pinBoard,
  updateBoardMetadata,
} from "utils/queries/board";
import {
  getBoardSummaryInCache,
  setBoardMetadataInCache,
  setBoardMutedInCache,
  setBoardPinnedInCache,
  setBoardSummaryInCache,
  setPinnedBoardInCache,
} from "cache/board";

import React from "react";
import debug from "debug";
import { toast } from "@bobaboard/ui-components";
import { useAuth } from "components/Auth";
import { useInvalidateNotifications } from "./notifications";
import { useRealmBoards } from "contexts/RealmContext";
import { useRefetchBoardActivity } from "./board-feed";
import { useRefetchPinnedBoards } from "./pinned-boards";

const error = debug("bobafrontend:hooks:queries:board-error");
const log = debug("bobafrontend:hooks:queries:board-log");

export const useMuteBoard = () => {
  const queryClient = useQueryClient();
  const refetchNotifications = useInvalidateNotifications();
  const { mutate: setBoardMuted } = useMutation(
    ({ boardId, mute }: { boardId: string; mute: boolean }) =>
      muteBoard({ boardId, mute }),
    {
      onMutate: ({ boardId, mute }) => {
        log(
          `Optimistically marking board ${boardId} as ${
            mute ? "muted" : "unmuted"
          }.`
        );
        setBoardMutedInCache(queryClient, { boardId, mute });
      },
      onError: (error: Error, { boardId, mute }) => {
        toast.error(
          `Error while marking board as ${mute ? "muted" : "unmuted"}`
        );
        log(`Error while marking board ${boardId} as muted:`);
        log(error);
      },
      onSuccess: (data: boolean, { boardId, mute }) => {
        log(
          `Successfully marked board ${boardId} as  ${
            mute ? "muted" : "unmuted"
          }.`
        );
        refetchNotifications();
        refetchBoardMetadata(queryClient, { boardId });
      },
    }
  );

  return setBoardMuted;
};

export const usePinBoard = () => {
  const queryClient = useQueryClient();
  const refetchPinnedBoards = useRefetchPinnedBoards();
  const { mutate: setBoardPinned } = useMutation(
    ({ boardId, pin }: { boardId: string; pin: boolean }) =>
      pinBoard({ boardId, pin }),
    {
      onMutate: ({ boardId, pin }) => {
        log(
          `Optimistically marking board ${boardId} as ${
            pin ? "pinned" : "unpinned"
          }.`
        );
        setBoardPinnedInCache(queryClient, { boardId, pin });
      },
      onError: (error: Error, { boardId, pin }) => {
        toast.error(
          `Error while marking board as ${pin ? "pinned" : "unpinned"}`
        );
        log(
          `Error while marking board ${boardId} as ${
            pin ? "pinned" : "unpinned"
          }:`
        );
        log(error);
      },
      onSuccess: (data: boolean, { boardId, pin }) => {
        log(
          `Successfully marked board ${boardId} as ${
            pin ? "pinned" : "unpinned"
          }.`
        );
        toast.success(`Board ${pin ? "pinned" : "unpinned"}!`);
        refetchPinnedBoards();
        refetchBoardMetadata(queryClient, { boardId });
      },
    }
  );

  return setBoardPinned;
};

export const useDismissBoardNotifications = () => {
  const refetchNotifications = useInvalidateNotifications();
  const refetchBoardActivity = useRefetchBoardActivity();
  const { mutate: dismissNotifications } = useMutation(
    ({ boardId }: { boardId: string }) =>
      dismissBoardNotifications({ boardId }),
    {
      onSuccess: (_, { boardId }) => {
        log(`Successfully dismissed board notifications. Refetching...`);
        refetchNotifications();
        refetchBoardActivity({
          boardId,
        });
      },
    }
  );

  return dismissNotifications;
};

export const BOARD_METADATA_KEY = "boardMetadata";
export const useBoardMetadata = ({ boardId }: { boardId: string | null }) => {
  const { isLoggedIn } = useAuth();
  const queryClient = useQueryClient();

  const { data: boardMetadata, isFetched } = useQuery<BoardMetadata | null>(
    [BOARD_METADATA_KEY, { boardId, isLoggedIn }],
    async () => (boardId ? await getBoardMetadata({ boardId }) : null),
    {
      placeholderData: () => {
        if (!boardId) {
          return;
        }
        const boardSummary = getBoardSummaryInCache(queryClient, { boardId });
        if (!boardSummary) {
          return undefined;
        }
        return {
          ...boardSummary,
          descriptions: [],
        };
      },
      staleTime: Infinity,
      refetchInterval: 60 * 1000,
      refetchOnWindowFocus: true,
    }
  );

  return React.useMemo(
    () => ({ boardMetadata, isFetched }),
    [boardMetadata, isFetched]
  );
};

export const useRefetchBoardMetadata = ({ boardId }: { boardId: string }) => {
  const queryClient = useQueryClient();
  return () => refetchBoardMetadata(queryClient, { boardId });
};

export const refetchBoardMetadata = (
  queryClient: QueryClient,
  { boardId }: { boardId: string }
) => {
  queryClient.invalidateQueries([BOARD_METADATA_KEY, { boardId }], {
    exact: false,
  });
};

export const useUpdateBoardMetadata = () => {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(
    ({
      boardId,
      descriptions,
      accentColor,
      tagline,
    }: {
      boardId: string;
      slug: string;
      descriptions: BoardDescription[];
      accentColor: string;
      tagline: string;
    }) => updateBoardMetadata({ boardId, descriptions, accentColor, tagline }),
    {
      onMutate: ({ boardId, descriptions, accentColor, tagline }) => {
        log(`Optimistically updating the metadata of board ${boardId}`);
        const transform = (boardMetadata: BoardMetadata) => {
          const newMetdata: BoardMetadata = {
            ...boardMetadata,
            accentColor,
            tagline,
            descriptions,
          };
          return newMetdata;
        };
        setBoardMetadataInCache(queryClient, { boardId }, transform);
        setBoardSummaryInCache(queryClient, { boardId }, transform);
        setPinnedBoardInCache(queryClient, { boardId }, (pinnedBoard) => {
          return {
            ...transform({
              ...pinnedBoard,
              descriptions: [],
            }),
            pinnedIndex: pinnedBoard.pinnedIndex,
          };
        });
      },
      onError: (serverError: Error) => {
        toast.error("Error while updating the board sidebar.");
        error(serverError);
      },
      onSuccess: (data: BoardMetadata) => {
        log(`Received new board metadata.`);
        log(data);
      },
    }
  );

  return mutate;
};

export const useBoardSummaryBySlug = (slug: string | null) => {
  const boards = useRealmBoards();
  if (!slug) {
    return null;
  }
  return boards?.find((board) => board.slug == slug);
};
