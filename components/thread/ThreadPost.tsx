import {
  CompactPostThread,
  Post,
  PostSizes,
  PostHandler,
} from "@bobaboard/ui-components";
import { PostProps } from "@bobaboard/ui-components/dist/post/Post";
import moment from "moment";
import React from "react";
import { PostType } from "../../types/Types";
import { ThreadPageDetails, usePageDetails } from "../../utils/router-utils";
import { ThreadContextType, withThreadData } from "./ThreadQueryHook";
import {
  getTotalContributions,
  getTotalNewContributions,
} from "../../utils/thread-utils";
import { usePostOptions, PostOptions } from "../hooks/useOptions";
import { useCachedLinks } from "components/hooks/useCachedLinks";

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
  innerRef?: React.Ref<PostHandler>;
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

const getPostAncestors = (
  post: PostType,
  allPosts: PostType[],
  rootData: { showRoot?: boolean; rootId?: string }
) => {
  const posts = [post];
  let nextParent: string | null = post.parentPostId;
  while (
    nextParent != null &&
    nextParent != (rootData?.showRoot ? rootData.rootId : undefined)
  ) {
    const parentPost = allPosts.find((p) => p.postId == nextParent);
    if (parentPost) {
      posts.unshift(parentPost);
    }
    nextParent = parentPost?.parentPostId || null;
  }
  return posts;
};

const ThreadPost: React.FC<ThreadPostProps & ThreadContextType> = ({
  post,
  isLoggedIn,
  onNewContribution,
  onNewComment,
  onEditPost,
  onNotesClick,
  parentChildrenMap,
  showThread,
  showRoot,
  ...extraProps
}) => {
  const { slug, threadId } = usePageDetails<ThreadPageDetails>();
  const cachedLinks = useCachedLinks();
  const options = usePostOptions({
    options:
      post.parentPostId == null ? TOP_POST_OPTIONS : REGULAR_POST_OPTIONS,
    isLoggedIn,
    data: {
      slug,
      threadId,
      postId: post.postId,
      own: post.isOwn,
      currentView: extraProps.defaultView!,
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
    [directLink, onNotesClick, window.location.search]
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
        ? getPostAncestors(post, extraProps.chronologicalPostsSequence, {
            showRoot,
            rootId: extraProps.threadRoot?.postId,
          })
        : [post],
    [
      post,
      extraProps.chronologicalPostsSequence,
      extraProps?.threadRoot?.postId,
    ]
  );

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
            onClick: onNotesClick ? onNotesClickWithId : directLink.onClick,
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
  }, [posts, window.location.search]);

  if (posts.length > 1) {
    return (
      <CompactPostThread
        key={post.postId}
        posts={memoizedPropsMap}
        ref={extraProps.innerRef}
      />
    );
  }
  return (
    <Post
      key={post.postId}
      {...memoizedPropsMap[0]}
      ref={extraProps.innerRef}
    />
  );
};

const MemoizedPost = React.memo(withThreadData(ThreadPost));

const ForwardedThreadPost = React.forwardRef<PostHandler, ThreadPostProps>(
  (props, ref) => {
    return <MemoizedPost {...props} innerRef={ref} />;
  }
);

export default ForwardedThreadPost;
