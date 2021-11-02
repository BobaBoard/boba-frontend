import {
  getThreadData,
  hideThread,
  markThreadAsRead,
  muteThread,
} from "../../../utils/queries";
import {
  getThreadSummaryInCache,
  setThreadActivityClearedInCache,
  setThreadDefaultViewInCache,
  setThreadHiddenInCache,
  setThreadMutedInCache,
} from "cache/thread";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { ThreadType } from "../../../types/Types";
import debug from "debug";
import { toast } from "@bobaboard/ui-components";
import { updateThreadView } from "../../../utils/queries/post";
import { useAuth } from "components/Auth";
import { useBoardSummary } from "contexts/RealmContext";

const info = debug("bobafrontend:hooks:queries:thread-info");
const error = debug("bobafrontend:hooks:queries:thread-error");
const log = debug("bobafrontend:hooks:queries:thread-log");

export const THREAD_QUERY_KEY = "threadData";

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
        setThreadMutedInCache(queryClient, {
          slug,
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
        setThreadDefaultViewInCache(queryClient, {
          slug,
          categoryFilter: null,
          threadId,
          view,
        });
        toast.success("Thread view updated!");
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

export const useReadThread = (args?: { activityOnly?: boolean }) => {
  const queryClient = useQueryClient();
  const { isLoggedIn } = useAuth();
  // Mark thread as read on authentication and thread fetch
  const { mutate: readThread } = useMutation(
    ({ threadId }: { threadId: string; slug: string }) => {
      if (!isLoggedIn) {
        throw new Error("Attempt to read thread with no user logged in.");
      }
      if (!threadId) {
        return Promise.resolve(null);
      }
      return markThreadAsRead({ threadId });
    },
    {
      onMutate: ({ threadId, slug }) => {
        if (!threadId || !slug) {
          return;
        }
        log(`Optimistically marking thread ${threadId} as visited.`);
        setThreadActivityClearedInCache(
          queryClient,
          {
            slug,
            threadId,
          },
          {
            activityOnly: args?.activityOnly,
          }
        );
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

export const useThread = ({
  threadId,
  boardId,
  fetch,
}: {
  threadId: string | null;
  boardId: string | null;
  fetch?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { isLoggedIn } = useAuth();
  // TODO[realms]: get rid of the need for slug here and also
  // figure out a better default for boardId.
  const { slug } = useBoardSummary({ boardId: boardId || "" }) || {};

  log(`Using thread with null`);
  //const queryClient = useQueryClient();
  const { data, isLoading, isFetching } = useQuery<
    ThreadType | null,
    [
      string,
      {
        threadId: string;
      }
    ]
  >(
    [THREAD_QUERY_KEY, { threadId, isLoggedIn }],
    () => {
      if (!threadId) {
        return null;
      }
      return getThreadData({ threadId });
    },

    {
      refetchOnWindowFocus: false,
      // We don't want thread to be automatically refetched on mount because this might
      // cause the "read" status to change. Instead, we want to wait for them to become
      // inactive (no one is using them) and then quickly garbage collect them so they get
      // refetched again next visit.
      // TODO: better investigate whether to use the fetch variable (or another) for this.
      // TODO: one blessed day we will simply mark "your thread was updated, click to refresh"
      // and maybe at that point we can keep refreshing the thread if we wait to load the data.
      refetchOnMount: false,
      cacheTime: 5 * 1000,
      placeholderData: () => {
        if (!threadId || !boardId || !slug) {
          return null;
        }
        info(
          `Searching board activity data for board ${boardId} and thread ${threadId}`
        );
        const thread = getThreadSummaryInCache(queryClient, {
          slug,
          threadId,
        });
        info(`...${thread ? "found" : "NOT found"}!`);
        return thread ? { ...thread, posts: [], comments: {} } : undefined;
      },
      staleTime: 30 * 1000,
      notifyOnChangeProps: ["data", "isLoading", "isFetching"],
      enabled: !!(fetch ?? true) && !!slug && !!threadId,
      onSuccess: (data) => {
        log(`Retrieved thread data for thread with id ${threadId}`);
        info(data);
      },
    }
  );

  return { data, isLoading, isFetching };
};
