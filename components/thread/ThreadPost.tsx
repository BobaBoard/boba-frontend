import { Post, PostSizes } from "@bobaboard/ui-components";
import { PostProps } from "@bobaboard/ui-components/dist/post/Post";
import moment from "moment";
import { useRouter } from "next/router";
import React from "react";
import { PostType } from "../../types/Types";
import { createLinkTo, THREAD_URL_PATTERN } from "../../utils/link-utils";
import { ThreadPageDetails, usePageDetails } from "../../utils/router-utils";
import { ThreadContextType, withThreadData } from "./ThreadQueryHook";
import {
  getTotalContributions,
  getTotalNewContributions,
} from "../../utils/thread-utils";
import { PostOptions, usePostOptionsProvider } from "../hooks/useOptions";

interface ThreadPostProps
  // This type can add any prop from the original post type
  extends Omit<Partial<PostProps>, "onNewContribution" | "onNewComment">,
    ThreadContextType {
  post: PostType;
  isLoggedIn: boolean;
  onNewContribution: (id: string) => void;
  onNewComment: (
    replyToPostId: string,
    replyToCommentId: string | null
  ) => void;
  onEditPost?: (post: PostType) => void;
  onNotesClick?: (id: string) => void;
}

const ThreadPost = React.memo(
  withThreadData(
    ({
      post,
      isLoggedIn,
      onNewContribution,
      onNewComment,
      onEditPost,
      onNotesClick,
      parentChildrenMap,
      threadRoot,
      ...extraProps
    }: ThreadPostProps) => {
      const {
        slug,
        threadId,
        threadBaseUrl,
      } = usePageDetails<ThreadPageDetails>();
      const options = usePostOptionsProvider({
        options: [
          threadRoot?.postId == post.postId
            ? PostOptions.COPY_THREAD_LINK
            : PostOptions.COPY_LINK,
          PostOptions.EDIT_TAGS,
        ],
        postsData: [
          {
            slug,
            threadId,
            postId: post.postId,
            own: post.isOwn,
            muted: false,
            hidden: false,
          },
        ],
      });
      const router = useRouter();
      const url = new URL(`${window.location.origin}${router.asPath}`);
      const directLink = createLinkTo({
        urlPattern: THREAD_URL_PATTERN,
        url: `${threadBaseUrl}/${post.postId}${url.search}`,
      });
      const onNotesClickWithId = React.useCallback(
        () => onNotesClick?.(post.postId),
        [post.postId, onNotesClick]
      );

      return (
        <Post
          key={post.postId}
          size={post.options?.wide ? PostSizes.WIDE : PostSizes.REGULAR}
          createdTime={moment.utc(post.created).fromNow()}
          createdTimeLink={directLink}
          notesLink={React.useMemo(
            () => ({
              href: directLink.href,
              onClick: onNotesClick ? onNotesClickWithId : directLink.onClick,
            }),
            [directLink, onNotesClick]
          )}
          text={post.content}
          secretIdentity={post.secretIdentity}
          userIdentity={post.userIdentity}
          accessory={post.accessory}
          onNewContribution={React.useCallback(
            () => onNewContribution(post.postId),
            [onNewContribution, post.postId]
          )}
          onNewComment={React.useCallback(
            () => onNewComment(post.postId, null),
            [onNewComment, post.postId]
          )}
          totalComments={post.comments?.length}
          directContributions={
            parentChildrenMap.get(post.postId)?.children.length
          }
          totalContributions={getTotalContributions(post, parentChildrenMap)}
          newPost={isLoggedIn && post.isNew}
          newComments={isLoggedIn ? post.newCommentsAmount : 0}
          newContributions={
            isLoggedIn ? getTotalNewContributions(post, parentChildrenMap) : 0
          }
          tags={post.tags}
          answerable={isLoggedIn}
          menuOptions={options.get(post.postId)}
          {...extraProps}
        />
      );
    }
  )
);

export default ThreadPost;
