import React from "react";
import { Post, TagsType, TagType } from "@bobaboard/ui-components";
import moment from "moment";
import { ThreadType } from "../types/Types";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { useCachedLinks } from "./hooks/useCachedLinks";
import noop from "noop-ts";
import { usePostOptions, PostOptions } from "./hooks/useOptions";
import { useSetThreadHidden } from "./hooks/queries/thread";
import { useForceHideIdentity } from "./hooks/useForceHideIdentity";
import { withEditors } from "./editors/withEditors";

const THREAD_OPTIONS = [
  PostOptions.COPY_THREAD_LINK,
  PostOptions.MARK_READ,
  PostOptions.HIDE,
  PostOptions.MUTE,
  PostOptions.OPEN_AS,
  PostOptions.UPDATE_VIEW,
  PostOptions.EDIT_TAGS,
];

const HiddenThread: React.FC<{
  thread: ThreadType;
}> = ({ thread }) => {
  const setThreadHidden = useSetThreadHidden();
  return (
    <div className="post hidden" key={thread.threadId}>
      This thread was hidden{" "}
      <a
        href="#"
        onClick={(e) => {
          setThreadHidden({
            threadId: thread.threadId,
            slug: thread.boardSlug,
            hide: !thread.hidden,
          });
          e.preventDefault();
        }}
      >
        [unhide]
      </a>
      <style jsx>{`
        .post.hidden {
          max-width: 500px;
          width: calc(100% - 40px);
          background-color: gray;
          padding: 20px;
          border: 1px dashed black;
          border-radius: 15px;
        }
      `}</style>
    </div>
  );
};

const ThreadPreview: React.FC<{
  thread: ThreadType;
  isLoggedIn: boolean;
  originBoard?: {
    slug: string;
    accentColor: string;
  };
  onSetCategoryFilter?: (filter: string) => void;
}> = ({ thread, isLoggedIn, onSetCategoryFilter, originBoard }) => {
  const { getLinkToThread } = useCachedLinks();
  const hasReplies =
    thread.totalPostsAmount > 1 || thread.totalCommentsAmount > 0;
  const linkToThread = getLinkToThread({
    slug: thread.boardSlug,
    threadId: thread.threadId,
  });
  const rootPost = thread.posts[0];
  const options = usePostOptions({
    options: THREAD_OPTIONS,
    isLoggedIn,
    data: {
      slug: thread.boardSlug,
      threadId: thread.threadId,
      postId: rootPost.postId,
      own: rootPost.isOwn,
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

  if (thread.hidden) {
    return <HiddenThread thread={thread} />;
  }

  return (
    <Post
      key={rootPost.postId}
      createdTime={`${moment.utc(rootPost.created).fromNow()}${
        hasReplies
          ? ` [updated: ${moment.utc(thread.lastActivity).fromNow()}]`
          : ""
      }`}
      createdTimeLink={linkToThread}
      text={rootPost.content}
      tags={rootPost.tags}
      secretIdentity={rootPost.secretIdentity}
      userIdentity={rootPost.userIdentity}
      onNewContribution={noop}
      onNewComment={noop}
      newPost={isLoggedIn && !thread.muted && rootPost.isNew}
      newComments={
        isLoggedIn ? (thread.muted ? undefined : thread.newCommentsAmount) : 0
      }
      newContributions={
        isLoggedIn
          ? thread.muted
            ? undefined
            : thread.newPostsAmount - (rootPost.isNew ? 1 : 0)
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
