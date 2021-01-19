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
import { usePageDetails } from "../../../utils/router-utils";

const error = debug("bobafrontend:hooks:queries:thread-error");
const log = debug("bobafrontend:hooks:queries:thread-log");

export const useMarkThreadAsRead = () => {
  const { slug } = usePageDetails();
  const queryClient = useQueryClient();
  const { mutate: readThread } = useMutation(
    (threadId: string) => markThreadAsRead({ threadId }),
    {
      onMutate: (threadId) => {
        log(`Optimistically marking thread ${threadId} as visited.`);
        // TODO: the thread should be searched in the appropriate activity
        // caches.
        if (slug) {
          removeThreadActivityFromCache(queryClient, {
            slug,
            categoryFilter: null,
            threadId,
          });
        }
      },
      onError: (serverError: Error, threadId) => {
        toast.error("Error while marking thread as visited");
        error(`Error while marking thread ${threadId} as visited:`);
        error(serverError);
      },
      onSuccess: (data: boolean, threadId) => {
        log(`Successfully marked thread ${threadId} as visited.`);
      },
    }
  );
  return readThread;
};

export const useMuteThread = () => {
  const { slug } = usePageDetails();
  const queryClient = useQueryClient();
  const { mutate: setThreadMuted } = useMutation(
    ({ threadId, mute }: { threadId: string; mute: boolean }) =>
      muteThread({ threadId, mute }),
    {
      onMutate: ({ threadId, mute }) => {
        log(
          `Optimistically marking thread ${threadId} as ${
            mute ? "muted" : "unmuted"
          }.`
        );
        // TODO: the thread should be searched in the appropriate activity
        // caches.
        if (slug) {
          setThreadMutedInCache(queryClient, {
            slug,
            categoryFilter: null,
            threadId,
            mute,
          });
        }
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
  const { slug } = usePageDetails();
  const queryClient = useQueryClient();
  const { mutate: setThreadView } = useMutation(
    ({
      threadId,
      view,
    }: {
      threadId: string;
      view: ThreadType["defaultView"];
    }) => updateThreadView({ threadId, view }),
    {
      onMutate: ({ threadId, view }) => {
        log(
          `Optimistically switched thread ${threadId} to default view ${view}.`
        );
        // TODO: the thread should be searched in the appropriate activity
        // caches.
        if (!slug) {
          return;
        }
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
  const { slug } = usePageDetails();
  const queryClient = useQueryClient();
  const { mutate: setThreadHidden } = useMutation(
    ({ threadId, hide }: { threadId: string; hide: boolean }) =>
      hideThread({ threadId, hide }),
    {
      onMutate: ({ threadId, hide }) => {
        log(
          `Optimistically marking thread ${threadId} as ${
            hide ? "hidden" : "visible"
          }.`
        );
        // TODO: the thread should be searched in the appropriate activity
        // caches.
        if (!slug) {
          return;
        }
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
