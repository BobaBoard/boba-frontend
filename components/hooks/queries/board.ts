import {
  BoardData,
  BoardDescription,
  BoardMetadata,
} from "../../../types/Types";
import {
  dismissBoardNotifications,
  getBoardMetadata,
  muteBoard,
  pinBoard,
  updateBoardSettings,
} from "../../../utils/queries/board";
import {
  getBoardSummaryInCache,
  setBoardMutedInCache,
  setBoardPinnedInCache,
} from "../../../cache/board";
import { useMutation, useQuery, useQueryClient } from "react-query";

import React from "react";
import debug from "debug";
import { toast } from "@bobaboard/ui-components";
import { useAuth } from "components/Auth";
import { useInvalidateNotifications } from "./notifications";
import { useRealmBoards } from "contexts/RealmContext";
import { useRefetchBoardActivity } from "./board-activity";
import { useRefetchPinnedBoards } from "./pinned-boards";

const error = debug("bobafrontend:hooks:queries:board-error");
const log = debug("bobafrontend:hooks:queries:board-log");

export const useMuteBoard = () => {
  const queryClient = useQueryClient();
  const refetchNotifications = useInvalidateNotifications();
  const { mutate: setBoardMuted } = useMutation(
    ({ slug, mute }: { slug: string; mute: boolean }) =>
      muteBoard({ slug, mute }),
    {
      onMutate: ({ slug, mute }) => {
        log(
          `Optimistically marking board ${slug} as ${
            mute ? "muted" : "unmuted"
          }.`
        );
        setBoardMutedInCache(queryClient, { slug, mute });
      },
      onError: (error: Error, { slug, mute }) => {
        toast.error(
          `Error while marking board as ${mute ? "muted" : "unmuted"}`
        );
        log(`Error while marking board ${slug} as muted:`);
        log(error);
      },
      onSuccess: (data: boolean, { slug, mute }) => {
        log(
          `Successfully marked board ${slug} as  ${mute ? "muted" : "unmuted"}.`
        );
        refetchNotifications();
      },
    }
  );

  return setBoardMuted;
};

export const usePinBoard = () => {
  const queryClient = useQueryClient();
  const refetchPinnedBoards = useRefetchPinnedBoards();
  const { mutate: setBoardPinned } = useMutation(
    ({ slug, pin }: { slug: string; pin: boolean }) => pinBoard({ slug, pin }),
    {
      onMutate: ({ slug, pin }) => {
        log(
          `Optimistically marking board ${slug} as ${
            pin ? "pinned" : "unpinned"
          }.`
        );
        setBoardPinnedInCache(queryClient, { boardId: slug, pin });
      },
      onError: (error: Error, { slug, pin }) => {
        toast.error(
          `Error while marking board as ${pin ? "pinned" : "unpinned"}`
        );
        log(
          `Error while marking board ${slug} as ${pin ? "pinned" : "unpinned"}:`
        );
        log(error);
      },
      onSuccess: (data: boolean, { slug, pin }) => {
        log(
          `Successfully marked board ${slug} as ${pin ? "pinned" : "unpinned"}.`
        );
        refetchPinnedBoards();
      },
    }
  );

  return setBoardPinned;
};

export const useDismissBoardNotifications = () => {
  const refetchNotifications = useInvalidateNotifications();
  const refetchBoardActivity = useRefetchBoardActivity();
  const { mutate: dismissNotifications } = useMutation(
    ({ slug }: { slug: string }) => dismissBoardNotifications({ slug }),
    {
      onSuccess: (_, { slug }) => {
        log(`Successfully dismissed board notifications. Refetching...`);
        refetchNotifications();
        refetchBoardActivity({ slug });
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
  return () =>
    queryClient.invalidateQueries([BOARD_METADATA_KEY, { boardId }], {
      exact: false,
    });
};

export const useUpdateBoardMetadata = (callbacks: {
  onSuccess: () => void;
}) => {
  const queryClient = useQueryClient();
  const { mutate: updateBoardMetadata } = useMutation(
    ({
      slug,
      descriptions,
      accentColor,
      tagline,
    }: {
      slug: string;
      descriptions: BoardDescription[];
      accentColor: string;
      tagline: string;
    }) => updateBoardSettings({ slug, descriptions, accentColor, tagline }),
    {
      onError: (serverError: Error) => {
        toast.error("Error while updating the board sidebar.");
        error(serverError);
      },
      onSuccess: (data: BoardData, { slug }) => {
        log(`Received comment data after save:`);
        log(data);
        callbacks.onSuccess();
        queryClient.setQueryData(["boardThemeData", { slug }], data);
        queryClient.invalidateQueries("allBoardsData");
      },
    }
  );

  return updateBoardMetadata;
};

export const useBoardSummaryBySlug = (slug: string | null) => {
  const boards = useRealmBoards();
  if (!slug) {
    return null;
  }
  return boards?.find((board) => board.slug == slug);
};
