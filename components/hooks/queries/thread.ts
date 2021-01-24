import { toast } from "@bobaboard/ui-components";
import { useMutation, useQueryClient } from "react-query";
import {
  markThreadAsRead,
  muteThread,
  hideThread,
} from "../../../utils/queries";
import {
  removeThreadActivityFromCache,
  setDefaultThreadViewInCache,
  setThreadHiddenInCache,
  setThreadMutedInCache,
} from "../../../utils/queries/cache";
import debug from "debug";
import { ThreadType } from "../../../types/Types";
import { updateThreadView } from "../../../utils/queries/post";

const error = debug("bobafrontend:hooks:queries:thread-error");
const log = debug("bobafrontend:hooks:queries:thread-log");

export const useMarkThreadAsRead = () => {
  const queryClient = useQueryClient();
  const { mutate: readThread } = useMutation(
    ({ threadId }: { threadId: string; slug: string }) =>
      markThreadAsRead({ threadId }),
    {
      onMutate: ({ threadId, slug }) => {
        log(`Optimistically marking thread ${threadId} as visited.`);
        removeThreadActivityFromCache(queryClient, {
          slug,
          categoryFilter: null,
          threadId,
        });
      },
      onError: (serverError: Error, threadId) => {
        toast.error("Error while marking thread as visited");
        error(`Error while marking thread ${threadId} as visited:`);
        error(serverError);
      },
      onSuccess: (data: boolean, { threadId }) => {
        log(`Successfully marked thread ${threadId} as visited.`);
      },
    }
  );
  return readThread;
};

export const useMuteThread = () => {
  const queryClient = useQueryClient();
  const { mutate: setThreadMuted } = useMutation(
    ({ threadId, mute }: { threadId: string; mute: boolean; slug: string }) =>
      muteThread({ threadId, mute }),
    {
      onMutate: ({ threadId, mute, slug }) => {
        log(
          `Optimistically marking thread ${threadId} as ${
            mute ? "muted" : "unmuted"
          }.`
        );
        // TODO: the thread should be searched in the appropriate activity
        // caches.
        setThreadMutedInCache(queryClient, {
          slug,
          categoryFilter: null,
          threadId,
          mute,
        });
      },
      onError: (error: Error, { threadId, mute }) => {
        toast.error(
          `Error while marking thread as ${mute ? "muted" : "unmuted"}`
        );
        log(`Error while marking thread ${threadId} as muted:`);
        log(error);
      },
      onSuccess: (data: boolean, { threadId, mute }) => {
        log(
          `Successfully marked thread ${threadId} as  ${
            mute ? "muted" : "unmuted"
          }.`
        );
        queryClient.invalidateQueries("allBoardsData");
      },
    }
  );

  return setThreadMuted;
};

export const useSetThreadView = () => {
  const queryClient = useQueryClient();
  const { mutate: setThreadView } = useMutation(
    ({
      threadId,
      view,
    }: {
      threadId: string;
      view: ThreadType["defaultView"];
      slug: string;
    }) => updateThreadView({ threadId, view }),
    {
      onMutate: ({ threadId, view, slug }) => {
        log(
          `Optimistically switched thread ${threadId} to default view ${view}.`
        );
        setDefaultThreadViewInCache(queryClient, {
          slug,
          categoryFilter: null,
          threadId,
          view,
        });
      },
      onError: (error: Error, { threadId, view }) => {
        toast.error(
          `Error while switching thread ${threadId} to default view ${view}.`
        );
        log(error);
      },
      onSuccess: (_, { threadId, view }) => {
        log(
          `Successfully switched thread ${threadId} to default view ${view}.`
        );
        toast.success("Successfully updated thread view!");
      },
    }
  );

  return setThreadView;
};

export const useSetThreadHidden = () => {
  const queryClient = useQueryClient();
  const { mutate: setThreadHidden } = useMutation(
    ({ threadId, hide }: { threadId: string; hide: boolean; slug: string }) =>
      hideThread({ threadId, hide }),
    {
      onMutate: ({ threadId, hide, slug }) => {
        log(
          `Optimistically marking thread ${threadId} as ${
            hide ? "hidden" : "visible"
          }.`
        );
        setThreadHiddenInCache(queryClient, {
          slug,
          categoryFilter: null,
          threadId,
          hide,
        });
      },
      onError: (error: Error, { threadId, hide }) => {
        toast.error(
          `Error while marking thread as ${hide ? "hidden" : "visible"}`
        );
        log(`Error while marking thread ${threadId} as hidden:`);
        log(error);
      },
      onSuccess: (data: boolean, { threadId, hide }) => {
        log(
          `Successfully marked thread ${threadId} as  ${
            hide ? "hidden" : "visible"
          }.`
        );
        queryClient.invalidateQueries("allBoardsData");
      },
    }
  );
  return setThreadHidden;
};
