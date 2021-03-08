import {
  CompactPostThread,
  Post,
  PostSizes,
  PostHandler,
  DefaultTheme,
} from "@bobaboard/ui-components";
import { PostProps } from "@bobaboard/ui-components/dist/post/Post";
import moment from "moment";
import React from "react";
import { PostType } from "../../types/Types";
import { ThreadPageDetails, usePageDetails } from "../../utils/router-utils";
import { useThreadContext } from "./ThreadContext";
import {
  getTotalContributions,
  getTotalNewContributions,
} from "../../utils/thread-utils";
import { usePostOptions, PostOptions } from "../hooks/useOptions";
import { useCachedLinks } from "components/hooks/useCachedLinks";
import { log } from "debug";
import { useForceHideIdentity } from "components/hooks/useForceHideIdentity";

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
  PostOptions.EDIT_TAGS,
];
const TOP_POST_OPTIONS = [
  ...REGULAR_POST_OPTIONS.filter((option) => option != PostOptions.COPY_LINK),
  PostOptions.UPDATE_VIEW,
];

const postHandlers = new Map<string, PostHandler>();
export const scrollToPost = (postId: string, color: string | undefined) => {
  log(`Beaming up to post with id ${postId}`);
  const element: HTMLElement | null = document.querySelector(
    `.post[data-post-id='${postId}']`
  );
  if (!element) {
    return;
  }
  const observer = new IntersectionObserver((observed) => {
    if (observed[0].isIntersecting) {
      postHandlers
        .get(postId)
        ?.highlight(color || DefaultTheme.DEFAULT_ACCENT_COLOR),
        observer.disconnect();
    }
  });
  observer.observe(element);
  element.classList.add("outline-hidden");
  window.scroll({
    top:
      element.getBoundingClientRect().top +
      window.pageYOffset -
      (DefaultTheme.HEADER_HEIGHT_PX + 2),
    behavior: "smooth",
  });
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
  const cachedLinks = useCachedLinks();
  const {
    defaultView,
    parentChildrenMap,
    chronologicalPostsSequence,
    threadRoot,
  } = useThreadContext();
  const options = usePostOptions({
    options:
      post.parentPostId == null ? TOP_POST_OPTIONS : REGULAR_POST_OPTIONS,
    isLoggedIn,
    data: {
      slug,
      threadId,
      postId: post.postId,
      own: post.isOwn,
      currentView: defaultView!,
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
      href: `${directLink.href}${window.location.search}`,
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
      postHandlers.set(post.postId, postRef);
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
    return posts.map(
      (post): PostProps => {
        const directLink = cachedLinks.getLinkToPost({
          slug,
          threadId,
          postId: post.postId,
        });
        return {
          size: post.options?.wide ? PostSizes.WIDE : PostSizes.REGULAR,
          createdTime: moment.utc(post.created).fromNow(),
          text: post.content,
          secretIdentity: post.secretIdentity,
          userIdentity: post.userIdentity,
          createdTimeLink: {
            href: `${directLink.href}${window.location.search}`,
            onClick: directLink.onClick,
          },
          notesLink: threadLink,
          accessory: post.accessory,
          onNewContribution: onNewContributionCallback,
          onNewComment: onNewCommentCallback,
          totalComments: post.comments?.length,
          directContributions: parentChildrenMap.get(post.postId)?.children
            .length,
          totalContributions: getTotalContributions(post, parentChildrenMap),
          newPost: isLoggedIn && post.isNew,
          newComments: isLoggedIn ? post.newCommentsAmount : 0,
          newContributions: isLoggedIn
            ? getTotalNewContributions(post, parentChildrenMap)
            : 0,
          tags: post.tags,
          answerable: isLoggedIn,
          menuOptions: options,
          ...extraProps,
        };
      }
    );
  }, [
    posts,
    cachedLinks,
    extraProps,
    onNotesClick,
    isLoggedIn,
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
