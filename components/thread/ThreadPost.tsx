import {
  CompactPostThread,
  Post,
  PostHandler,
  TagType,
  TagsType,
} from "@bobaboard/ui-components";
import { PostOptions, usePostOptions } from "../options/usePostOptions";
import { PostType, RealmPermissions } from "types/Types";
import { ThreadPageDetails, usePageDetails } from "utils/router-utils";
import {
  getTotalContributions,
  getTotalNewContributions,
} from "utils/thread-utils";
import { useRealmBoardId, useRealmPermissions } from "contexts/RealmContext";

import { PostProps } from "@bobaboard/ui-components/dist/post/Post";
import React from "react";
import { addPostHandlerRef } from "utils/scroll-utils";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { formatDistanceToNow } from "date-fns";
import { getCurrentSearchParams } from "utils/location-utils";
import { useCachedLinks } from "components/hooks/useCachedLinks";
import { useForceHideIdentity } from "components/hooks/useForceHideIdentity";
import { useThreadContext } from "./ThreadContext";
import { useThreadViewContext } from "contexts/ThreadViewContext";

interface ThreadPostProps
  // This type can add any prop from the original post type
  extends Omit<Partial<PostProps>, "onNewContribution" | "onNewComment"> {
  post: PostType;
  isLoggedIn: boolean;
  onNewContribution: (id: string) => void;
  onNewComment: (
    replyToPostId: string,
    replyToCommentId: string | null
  ) => void;
  onEditPost?: (post: PostType) => void;
  onNotesClick?: (id: string) => void;
  showThread?: boolean;
  showRoot?: boolean;
  avatarRef?: React.Ref<HTMLDivElement | null>;
}
const REGULAR_POST_OPTIONS = [
  PostOptions.COPY_LINK,
  PostOptions.COPY_THREAD_LINK,
  PostOptions.MUTE,
  PostOptions.HIDE,
  PostOptions.EDIT_TAGS,
  PostOptions.DEBUG,
];
const TOP_POST_OPTIONS = [
  ...REGULAR_POST_OPTIONS.filter(
    (option) => option != PostOptions.COPY_LINK && option != PostOptions.DEBUG
  ),
  PostOptions.UPDATE_VIEW,
  // make sure this is always at the end
  PostOptions.DEBUG,
];

export const isPostLoaded = (postId: string): boolean => {
  return !!document.querySelector(`.post[data-post-id='${postId}']`);
};

const getPostAncestors = (
  post: PostType,
  allPosts: PostType[],
  rootId?: string,
  showRoot?: boolean
) => {
  const posts = [post];
  let nextParent: string | null = post.parentPostId;
  while (
    nextParent != null &&
    // TODO: rather than pass rootId, just check grandparent
    nextParent != (showRoot ? undefined : rootId)
  ) {
    const parentPost = allPosts.find((p) => p.postId == nextParent);
    if (parentPost) {
      posts.unshift(parentPost);
    }
    nextParent = parentPost?.parentPostId || null;
  }
  return posts;
};

const ThreadPost: React.FC<ThreadPostProps> = ({
  post,
  isLoggedIn,
  onNotesClick,
  onNewContribution,
  onNewComment,
  showThread,
  showRoot,
  ...extraProps
}) => {
  const { slug, threadId } = usePageDetails<ThreadPageDetails>();
  const { setActiveFilter } = useThreadViewContext();
  const cachedLinks = useCachedLinks();
  const {
    defaultView,
    parentChildrenMap,
    postCommentsMap,
    chronologicalPostsSequence,
    threadRoot,
    muted,
    hidden,
    opIdentity,
  } = useThreadContext();
  const boardId = useRealmBoardId({
    boardSlug: slug,
    realmSlug: "v0",
  });
  const realmPermissions = useRealmPermissions();

  const tagOptions = React.useCallback(
    (tag: TagsType) => {
      if (tag.type == TagType.CATEGORY) {
        return [
          {
            icon: faFilter,
            name: "Filter",
            link: {
              onClick: () => {
                setActiveFilter(tag.name);
              },
            },
          },
        ];
      }
      return undefined;
    },
    [setActiveFilter]
  );

  const options = usePostOptions({
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
  const directLink = cachedLinks.getLinkToPost({
    slug,
    threadId,
    postId: post.postId,
  });
  const onNotesClickWithId = React.useCallback(
    () => onNotesClick?.(post.postId),
    [post.postId, onNotesClick]
  );
  const threadLink = React.useMemo(
    () => ({
      href: `${directLink.href}${getCurrentSearchParams()}`,
      onClick: onNotesClick ? onNotesClickWithId : directLink.onClick,
    }),
    [directLink, onNotesClickWithId, onNotesClick]
  );
  const onNewContributionCallback = React.useCallback(
    () => onNewContribution(post.postId),
    [onNewContribution, post.postId]
  );

  const onNewCommentCallback = React.useCallback(
    () => onNewComment(post.postId, null),
    [onNewComment, post.postId]
  );
  const posts = React.useMemo(
    () =>
      showThread
        ? getPostAncestors(
            post,
            chronologicalPostsSequence,
            threadRoot?.postId,
            showRoot
          )
        : [post],
    [post, chronologicalPostsSequence, threadRoot?.postId, showRoot, showThread]
  );

  const callbackRef = (postRef: PostHandler | undefined | null) => {
    if (postRef) {
      // TODO: also remove this ref
      addPostHandlerRef({ postId: post.postId, ref: postRef });
    }
    if (!extraProps.avatarRef) {
      return;
    }
    if (typeof extraProps.avatarRef === "function") {
      extraProps.avatarRef(postRef?.avatarRef?.current || null);
    } else {
      // @ts-ignore
      extraProps.avatarRef.current = postRef?.avatarRef?.current || null;
    }
  };
  const { forceHideIdentity } = useForceHideIdentity();

  const memoizedPropsMap = React.useMemo(() => {
    return posts.map((post): PostProps => {
      const directLink = cachedLinks.getLinkToPost({
        slug,
        threadId,
        postId: post.postId,
      });
      return {
        createdTime: formatDistanceToNow(new Date(post.created), {
          addSuffix: true,
        }),
        text: post.content,
        secretIdentity: post.secretIdentity,
        userIdentity: post.userIdentity,
        createdTimeLink: {
          href: `${directLink.href}${getCurrentSearchParams()}`,
          onClick: directLink.onClick,
        },
        notesLink: threadLink,
        onNewContribution: onNewContributionCallback,
        onNewComment: onNewCommentCallback,
        totalComments: postCommentsMap.get(post.postId)?.total || 0,
        directContributions: parentChildrenMap.get(post.postId)?.children
          .length,
        totalContributions: getTotalContributions(post, parentChildrenMap),
        newPost: post.isNew,
        newComments: postCommentsMap.get(post.postId)?.new || 0,
        newContributions: isLoggedIn
          ? getTotalNewContributions(post, parentChildrenMap)
          : 0,
        tags: post.tags,
        allowsComment: realmPermissions.includes(
          RealmPermissions.COMMENT_ON_REALM
        ),
        allowsContribution: realmPermissions.includes(
          RealmPermissions.POST_ON_REALM
        ),
        menuOptions: options,
        op: post.secretIdentity.name == opIdentity?.name,
        getOptionsForTag: tagOptions,
        ...extraProps,
      };
    });
  }, [
    posts,
    cachedLinks,
    extraProps,
    onNotesClick,
    isLoggedIn,
    realmPermissions,
    // onNewCommentCallback,
    // onNewContributionCallback,
    // onNotesClickWithId,
    // options,
    // parentChildrenMap,
    // slug,
    // threadId,
    // threadLink,
  ]);

  if (posts.length > 1) {
    return (
      <div className="post" data-post-id={post.postId}>
        <CompactPostThread
          key={post.postId}
          posts={memoizedPropsMap}
          ref={callbackRef}
          forceHideIdentity={forceHideIdentity}
        />
      </div>
    );
  }
  return (
    <div className="post" data-post-id={post.postId}>
      <Post
        key={post.postId}
        {...memoizedPropsMap[0]}
        ref={callbackRef}
        forceHideIdentity={forceHideIdentity}
      />
    </div>
  );
};

export default React.memo(ThreadPost);
