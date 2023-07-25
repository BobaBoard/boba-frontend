import { Post, PostHandler, TagType, TagsType, HiddenThread } from "@bobaboard/ui-components";
import { PostData, ThreadSummaryType } from "types/Types";
import { PostOptions, usePostOptions } from "components/options/usePostOptions";
import {
  addThreadHandlerRef,
  removeThreadHandlerRef,
} from "utils/scroll-utils";

import React from "react";
import { THREAD_VIEW_OPTIONS } from "components/core/editors/utils";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { formatDistanceToNow } from "date-fns";
import noop from "noop-ts";
import { useCachedLinks } from "../../hooks/useCachedLinks";
import { useCurrentRealmBoardId } from "contexts/RealmContext";
import { useForceHideIdentity } from "../../hooks/useForceHideIdentity";
import { useSetThreadHidden } from "lib/api/hooks/thread";
import { withEditors } from "components/core/editors/withEditors";

const THREAD_OPTIONS = [
  PostOptions.COPY_THREAD_LINK,
  PostOptions.MARK_READ,
  PostOptions.MUTE,
  PostOptions.HIDE,
  PostOptions.OPEN_AS,
  PostOptions.EDIT_TAGS,
  PostOptions.UPDATE_VIEW,
  PostOptions.DEBUG,
];

const getThreadTypeIcon = (view: PostData["defaultView"]) => {
  return THREAD_VIEW_OPTIONS.find((options) => options.id == view)?.icon;
};

const ThreadPreview: React.FC<{
  thread: ThreadSummaryType;
  isLoggedIn: boolean;
  originBoard?: {
    slug: string;
    accentColor: string;
  };
  onSetCategoryFilter?: (filter: string) => void;
}> = ({ thread, isLoggedIn, onSetCategoryFilter, originBoard }) => {
  const { getLinkToThread } = useCachedLinks();
  const setThreadHidden = useSetThreadHidden();
  const hasReplies =
    thread.totalPostsAmount > 1 || thread.totalCommentsAmount > 0;
  const linkToThread = getLinkToThread({
    slug: thread.parentBoardSlug,
    threadId: thread.id,
  });
  const rootPost = thread.starter;
  const boardId = useCurrentRealmBoardId({
    boardSlug: thread.parentBoardSlug,
  });
  const options = usePostOptions({
    options: THREAD_OPTIONS,
    isLoggedIn,
    data: {
      boardId,
      threadId: thread.id,
      post: rootPost,
      currentView: thread.defaultView,
      muted: thread.muted,
      hidden: thread.hidden,
    },
  });
  const { forceHideIdentity } = useForceHideIdentity();

  const tagOptions = React.useCallback(
    (tag: TagsType) => {
      if (tag.type == TagType.CATEGORY && onSetCategoryFilter) {
        return [
          {
            icon: faFilter,
            name: "Filter",
            link: {
              onClick: () => {
                onSetCategoryFilter(tag.name);
              },
            },
          },
        ];
      }
      return undefined;
    },
    [onSetCategoryFilter]
  );

  // We save the thread handler ref so that UI effects that want to highlight
  // the thread can do so.
  const { id: threadId } = thread;
  const updateRef = React.useCallback(
    (ref: PostHandler) => {
      addThreadHandlerRef({ threadId, ref });
    },
    [threadId]
  );
  React.useEffect(() => {
    // When the components is unmounted, we remove the ref from memory.
    return () => {
      removeThreadHandlerRef({ threadId });
    };
  }, [threadId]);

  // If the thread is hidden, use a special placeholder to represent it.
  if (thread.hidden) {
    return <HiddenThread 
             threadId={thread.id} 
             boardId={thread.parentBoardId} 
             hide={!thread.hidden} 
             onThreadHidden={setThreadHidden} />;
  }

  return (
    <Post
      key={rootPost.postId}
      createdTime={`${formatDistanceToNow(new Date(rootPost.created), {
        addSuffix: true,
      })}${
        hasReplies
          ? ` [updated: ${formatDistanceToNow(new Date(thread.lastActivityAt), {
              addSuffix: true,
            })}]`
          : ""
      }`}
      ref={updateRef}
      createdMessageIcon={getThreadTypeIcon(thread.defaultView)}
      createdTimeLink={linkToThread}
      text={rootPost.content}
      tags={rootPost.tags}
      secretIdentity={rootPost.secretIdentity}
      userIdentity={rootPost.userIdentity}
      onNewContribution={noop}
      onNewComment={noop}
      newPost={isLoggedIn && !thread.muted && thread.new}
      newComments={
        isLoggedIn ? (thread.muted ? undefined : thread.newCommentsAmount) : 0
      }
      newContributions={
        isLoggedIn
          ? thread.muted
            ? undefined
            : thread.newPostsAmount - (thread.new ? 1 : 0)
          : 0
      }
      totalComments={thread.totalCommentsAmount}
      // subtract 1 since posts_amount is the amount of posts total in the thread
      // including the head one.
      totalContributions={thread.totalPostsAmount - 1}
      directContributions={thread.directThreadsAmount}
      notesLink={linkToThread}
      muted={isLoggedIn && thread.muted}
      menuOptions={options}
      getOptionsForTag={tagOptions}
      board={originBoard}
      forceHideIdentity={forceHideIdentity}
    />
  );
};

export default withEditors(ThreadPreview);
