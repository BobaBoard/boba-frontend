import { CompactPostThread, Post, PostHandler } from "@bobaboard/ui-components";
import { PostOptions, usePostOptions } from "components/options/usePostOptions";
import { PostType, RealmPermissions } from "types/Types";
import {
  TagsOptions,
  useGetTagOptions,
} from "components/options/useTagsOptions";
import { ThreadPageDetails, usePageDetails } from "utils/router-utils";
import {
  getTotalContributions,
  getTotalNewContributions,
} from "utils/thread-utils";
import {
  isCommentEditorState,
  isReplyContribution,
} from "components/core/editors/types";
import {
  useBoardSummary,
  useCurrentRealmBoardId,
  useRealmPermissions,
} from "contexts/RealmContext";

import { GetPropsFromForwardedRef } from "utils/typescript-utils";
import React from "react";
import { addPostHandlerRef } from "utils/scroll-utils";
import classNames from "classnames";
import { formatDistanceToNow } from "date-fns";
import { getCurrentSearchParams } from "utils/location-utils";
import { useAuth } from "components/Auth";
import { useCachedLinks } from "components/hooks/useCachedLinks";
import { useEditorsState } from "components/core/editors/EditorsContext";
import { useForceHideIdentity } from "components/hooks/useForceHideIdentity";
import { useThreadContext } from "./ThreadContext";
import { useThreadEditors } from "components/core/editors/withEditors";

export interface ThreadPostProps {
  /**
   * `post` is the main post displayed by ThreadPost.
   * In addition, `showPostAncestors` and `showThreadStarter` will
   * determine whether other posts are also going to be displayed.
   */
  post: PostType;
  /**
   * Whether to show the ancestors of `post` as part of this ThreadPost.
   */
  showPostAncestors?: boolean;
  /**
   * Whether to show the thread starter as part of this ThreadPost.
   */
  showThreadStarter?: boolean;
  // TODO: doublecheck this type
  avatarRef?:
    | React.MutableRefObject<HTMLImageElement | null>
    | ((avatarRef: HTMLImageElement | null) => void);
  onNotesClick?: (postId: string) => void;
  // TODO: rename this to "onSizeChange"
  onEmbedLoaded?: () => void;
}

const REGULAR_POST_OPTIONS = [
  PostOptions.COPY_LINK,
  PostOptions.COPY_THREAD_LINK,
  PostOptions.MUTE,
  PostOptions.HIDE,
  PostOptions.DELETE,
  PostOptions.EDIT_TAGS,
  PostOptions.DEBUG,
];

const REGULAR_ONLY_OPTIONS = [PostOptions.COPY_LINK, PostOptions.DEBUG];
const TOP_POST_OPTIONS = [
  ...REGULAR_POST_OPTIONS.filter(
    (option) => !REGULAR_ONLY_OPTIONS.includes(option)
  ),
  PostOptions.UPDATE_VIEW,
  // make sure this is always at the end
  PostOptions.DEBUG,
];

const POST_TAG_OPTIONS = [TagsOptions.FILTER_BY_CATEGORY];

/**
 * Returns all the ancestors of post starting from the one closest to
 * threadStarter all the way down to post itself.
 */
const getPostAncestors = ({
  post,
  allThreadPosts,
}: {
  post: PostType;
  allThreadPosts: PostType[];
}) => {
  const posts = [post];
  let nextParent: string | null = post.parentPostId;
  while (nextParent != null && nextParent != undefined) {
    const parentPost = allThreadPosts.find((p) => p.postId == nextParent);
    if (parentPost) {
      posts.unshift(parentPost);
    }
    nextParent = parentPost?.parentPostId || null;
  }
  return posts;
};

type CompactPostProps = GetPropsFromForwardedRef<typeof CompactPostThread>;
/**
 * @returns a function that takes a post and returns its data in the format our
 * UI uses for displaying it.
 */
const useGetPostData = () => {
  const { slug, threadId } = usePageDetails<ThreadPageDetails>();
  const cachedLinks = useCachedLinks();
  const { opIdentity } = useThreadContext();
  const { parentChildrenMap, postCommentsMap } = useThreadContext();
  const { isLoggedIn } = useAuth();

  return React.useCallback(
    ({ post }: { post: PostType }): CompactPostProps["posts"][0] => {
      const { postId } = post;
      const linkToPost = cachedLinks.getLinkToPost({
        slug,
        threadId,
        postId: postId,
      });
      const linkToPostWithSearchParams = {
        href: `${linkToPost.href}${getCurrentSearchParams()}`,
        onClick: linkToPost.onClick,
      };
      const createdTime = formatDistanceToNow(new Date(post.created), {
        addSuffix: true,
      });
      return {
        id: postId,
        ...post,
        text: post.content,
        createdTime,
        createdTimeLink: linkToPostWithSearchParams,
        totalComments: postCommentsMap.get(postId)?.total || 0,
        directContributions: parentChildrenMap.get(postId)?.children.length,
        totalContributions: getTotalContributions(postId, parentChildrenMap),
        newComments: postCommentsMap.get(postId)?.new || 0,
        newContributions: isLoggedIn
          ? getTotalNewContributions(postId, parentChildrenMap)
          : 0,
        op: post.secretIdentity.name == opIdentity?.name,
        newPost: post.isNew,
      };
    },
    [
      cachedLinks,
      slug,
      threadId,
      opIdentity?.name,
      isLoggedIn,
      parentChildrenMap,
      postCommentsMap,
    ]
  );
};

/**
 * Returns all the data for the posts displayed by this ThreadPost.
 */
const useGetPostsData = ({
  post,
  showPostAncestors,
  showThreadStarter,
}: {
  post: PostType;
  showPostAncestors?: boolean;
  showThreadStarter?: boolean;
}) => {
  const getPostData = useGetPostData();
  const { chronologicalPostsSequence } = useThreadContext();

  return React.useMemo(() => {
    let postsToDisplay = [post];
    if (showPostAncestors) {
      postsToDisplay = getPostAncestors({
        post,
        allThreadPosts: chronologicalPostsSequence,
      });
      // Always keep the post itself if the post itself is the
      // thread starter.
      if (post.parentPostId !== null && !showThreadStarter) {
        // Remove the threadStarter (always the first post) from the
        // sequence of posts to display.
        postsToDisplay.shift();
      }
    }
    return postsToDisplay.map((post) => getPostData({ post }));
  }, [
    post,
    showPostAncestors,
    showThreadStarter,
    chronologicalPostsSequence,
    getPostData,
  ]);
};

const updateRefs = ({
  postRef,
  postId,
  avatarRef,
}: {
  postRef: PostHandler | undefined | null;
  postId: string;
  avatarRef?:
    | React.MutableRefObject<HTMLImageElement | null>
    | ((avatarRef: HTMLImageElement | null) => void);
}) => {
  if (postRef) {
    addPostHandlerRef({ postId: postId, ref: postRef });
  }
  if (!avatarRef) {
    return;
  }
  if (typeof avatarRef === "function") {
    avatarRef(postRef?.avatarRef?.current ?? null);
  } else {
    avatarRef.current = postRef?.avatarRef?.current ?? null;
  }
};

/**
 * A post as displayed within a thread page. It can render either as a
 * simple post, or as a post + its ancestors chain (a la "Tumblr reblog").
 */
const ThreadPost: React.FC<ThreadPostProps> = ({
  post,
  showPostAncestors,
  showThreadStarter,
  avatarRef,
  onNotesClick,
}) => {
  const { slug, threadId } = usePageDetails<ThreadPageDetails>();
  const { isLoggedIn } = useAuth();
  const { onNewComment, onNewContribution } = useThreadEditors();
  const { defaultView, muted, hidden } = useThreadContext();
  const boardId = useCurrentRealmBoardId({
    boardSlug: slug,
  });
  const boardColor = useBoardSummary({ boardId })?.accentColor;
  const realmPermissions = useRealmPermissions();
  const editorState = useEditorsState();
  const isCurrentReplyToContribution =
    (isReplyContribution(editorState) &&
      editorState.newContribution.replyToContributionId === post.postId) ||
    (isCommentEditorState(editorState) &&
      editorState.newComment.replyToContributionId === post.postId &&
      editorState.newComment.replyToCommentId === null);
  const getTagOptions = useGetTagOptions({
    options: POST_TAG_OPTIONS,
  });
  const [options, optionComponents] = usePostOptions({
    options:
      post.parentPostId == null ? TOP_POST_OPTIONS : REGULAR_POST_OPTIONS,
    isLoggedIn,
    data: {
      boardId,
      threadId,
      post,
      currentView: defaultView!,
      muted,
      hidden,
    },
  });
  const { forceHideIdentity } = useForceHideIdentity();

  const onContributeToPost = React.useCallback(
    () => onNewContribution(post.postId),
    [post.postId, onNewContribution]
  );
  const onCommentOnPost = React.useCallback(
    () => onNewComment(post.postId, null),
    [post.postId, onNewComment]
  );
  const onRefUpdated = React.useCallback(
    (postRef: PostHandler) =>
      updateRefs({ postRef, postId: post.postId, avatarRef: avatarRef }),
    [post.postId, avatarRef]
  );

  const postsData = useGetPostsData({
    post,
    showPostAncestors,
    showThreadStarter,
  });

  // By default, the link in the notes will link to the same place as the "createdTimeLink"
  // of the last post. If an explictit onClick action was passed, however, that will be
  // executed instead.
  const directLinkToLastPost = postsData[postsData.length - 1].createdTimeLink;
  const notesLink = React.useMemo(
    () =>
      onNotesClick
        ? {
            onClick: () => onNotesClick(post.postId),
          }
        : directLinkToLastPost,
    [onNotesClick, post.postId, directLinkToLastPost]
  );

  return (
    <>
      {isCurrentReplyToContribution && (
        <div className="current-reply-header">You're replying to:</div>
      )}
      <div
        className={classNames("post", {
          "current-reply": isCurrentReplyToContribution,
        })}
        data-post-id={post.postId}
      >
        {postsData.length == 1 ? (
          // If there's a single post use the regular post
          <Post
            key={post.postId}
            ref={onRefUpdated}
            {...postsData[0]}
            forceHideIdentity={forceHideIdentity}
            getOptionsForTag={getTagOptions}
            onNewContribution={onContributeToPost}
            onNewComment={onCommentOnPost}
            allowsComment={
              realmPermissions.includes(RealmPermissions.COMMENT_ON_REALM) &&
              !editorState.isOpen
            }
            allowsContribution={
              realmPermissions.includes(RealmPermissions.POST_ON_REALM) &&
              !editorState.isOpen
            }
            menuOptions={options}
            notesLink={notesLink}
          />
        ) : (
          // If there's multiple posts use a compact thread
          <CompactPostThread
            key={post.postId}
            posts={postsData}
            ref={onRefUpdated}
            forceHideIdentity={forceHideIdentity}
            getOptionsForTag={getTagOptions}
            onNewContribution={onContributeToPost}
            onNewComment={onCommentOnPost}
            allowsComment={
              realmPermissions.includes(RealmPermissions.COMMENT_ON_REALM) &&
              !editorState.isOpen
            }
            allowsContribution={
              realmPermissions.includes(RealmPermissions.POST_ON_REALM) &&
              !editorState.isOpen
            }
            menuOptions={options}
            notesLink={notesLink}
          />
        )}
      </div>
      {optionComponents}
      <style jsx>{`
        .post {
          pointer-events: all;
        }
        .post.current-reply {
          outline: 5px solid ${boardColor};
          background-color: ${boardColor};
          border-radius: 15px;
        }
        .current-reply-header {
          color: rgb(255, 255, 255);
          padding-left: 15px;
          padding-bottom: 7px;
          font-size: 1.3rem;
        }
      `}</style>
    </>
  );
};

ThreadPost.whyDidYouRender = true;

export default React.memo(ThreadPost);
