import { toast } from "@bobaboard/ui-components";
import { useMutation, useQueryClient } from "react-query";
import {
  updateBoardSettings,
  muteBoard,
  dismissBoardNotifications,
  pinBoard,
} from "../../../utils/queries/board";
import {
  setBoardMutedInCache,
  setBoardPinnedInCache,
} from "../../../utils/queries/cache";
import debug from "debug";
import { BoardData, BoardDescription } from "../../../types/Types";
import { useBoardsContext } from "components/BoardContext";

const error = debug("bobafrontend:hooks:queries:board-error");
const log = debug("bobafrontend:hooks:queries:board-log");

export const useMuteBoard = () => {
  const queryClient = useQueryClient();
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
        queryClient.invalidateQueries("allBoardsData");
      },
    }
  );

  return setBoardMuted;
};

export const usePinBoard = () => {
  const queryClient = useQueryClient();
  const { nextPinnedOrder } = useBoardsContext();
  const { mutate: setBoardPinned } = useMutation(
    ({ slug, pin }: { slug: string; pin: boolean }) => pinBoard({ slug, pin }),
    {
      onMutate: ({ slug, pin }) => {
        log(
          `Optimistically marking board ${slug} as ${
            pin ? "pinned" : "unpinned"
          }.`
        );
        setBoardPinnedInCache(queryClient, { slug, pin, nextPinnedOrder });
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
        queryClient.invalidateQueries("allBoardsData");
      },
    }
  );

  return setBoardPinned;
};

export const useDismissBoardNotifications = () => {
  const queryClient = useQueryClient();
  const { mutate: dismissNotifications } = useMutation(
    ({ slug }: { slug: string }) => dismissBoardNotifications({ slug }),
    {
      onSuccess: (_, { slug }) => {
        log(`Successfully dismissed board notifications. Refetching...`);
        queryClient.invalidateQueries("allBoardsData");
        queryClient.invalidateQueries(["boardActivityData", { slug }]);
      },
    }
  );

  return dismissNotifications;
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
      onError: (serverError: Error, {}) => {
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
