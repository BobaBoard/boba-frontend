import React from "react";
import { Post, PostSizes, ThreadIndent, toast } from "@bobaboard/ui-components";
import debug from "debug";
import {
  getTotalContributions,
  getTotalNewContributions,
} from "../../utils/thread-utils";
import moment from "moment";
import { useThread } from "components/thread/ThreadContext";
import { useRouter } from "next/router";
import classnames from "classnames";
import TemporarySegmentedButton from "./TemporarySegmentedButton";
import CommentsThread from "./CommentsThread";
import { faEdit, faLink } from "@fortawesome/free-solid-svg-icons";
import { ThreadPageDetails, usePageDetails } from "utils/router-utils";
import { useCachedLinks } from "components/hooks/useCachedLinks";
import { PostType } from "types/Types";
//import { useHotkeys } from "react-hotkeys-hook";

// @ts-ignore
const log = debug("bobafrontend:threadLevel-log");

enum TIMELINE_VIEW_MODE {
  NEW,
  UPDATED,
  ALL,
}

const TimelineView: React.FC<{
  onNewComment: (
    replyToPostId: string,
    replyToCommentId: string | null
  ) => void;
  onNewContribution: (id: string) => void;
  onEditPost: (post: PostType) => void;
  isLoggedIn: boolean;
  displayAtMost: number;
}> = (props) => {
  const [timelineView, setTimelineView] = React.useState(
    TIMELINE_VIEW_MODE.ALL
  );
  const { slug, threadBaseUrl, threadId } = usePageDetails<ThreadPageDetails>();
  const {
    chronologicalPostsSequence,
    postCommentsMap,
    filteredParentChildrenMap,
    isLoading,
  } = useThread();
  const router = useRouter();

  React.useEffect(() => {
    const url = new URL(`${window.location.origin}${router.asPath}`);
    if (url.searchParams.has("timeline") && url.searchParams.has("all")) {
      setTimelineView(TIMELINE_VIEW_MODE.ALL);
    } else if (
      url.searchParams.has("timeline") &&
      url.searchParams.has("updated")
    ) {
      setTimelineView(TIMELINE_VIEW_MODE.UPDATED);
    } else {
      setTimelineView(TIMELINE_VIEW_MODE.NEW);
    }
  }, [router.asPath]);

  const setTimelineViewMode = (
    viewMode: TIMELINE_VIEW_MODE,
    replace: boolean = false
  ) => {
    const queryParam =
      viewMode === TIMELINE_VIEW_MODE.ALL
        ? "?timeline&all"
        : viewMode == TIMELINE_VIEW_MODE.UPDATED
        ? "?timeline&updated"
        : "?timeline";

    const routingMethod = replace ? router.replace : router.push;
    routingMethod(
      `/[boardId]/thread/[...threadId]`,
      `${threadBaseUrl}${queryParam}`,
      {
        shallow: true,
      }
    );
  };

  React.useEffect(() => {
    if (!isLoading && !chronologicalPostsSequence.some((post) => post.isNew)) {
      setTimelineViewMode(
        chronologicalPostsSequence.some((post) => post.newCommentsAmount > 0)
          ? TIMELINE_VIEW_MODE.UPDATED
          : TIMELINE_VIEW_MODE.ALL,
        true
      );
    }
  }, [isLoading]);
  const { getLinkToPost } = useCachedLinks();

  const { newPosts, updatedPosts, allPosts } = React.useMemo(() => {
    // @ts-ignore
    let [unusedFirstElement, ...allPosts] = chronologicalPostsSequence;
    const newPosts = chronologicalPostsSequence.filter((post) => post.isNew);
    const updatedPosts = chronologicalPostsSequence.filter(
      (post) => post.isNew || post.newCommentsAmount > 0
    );

    return {
      allPosts: chronologicalPostsSequence,
      newPosts,
      updatedPosts,
    };
  }, [chronologicalPostsSequence, postCommentsMap]);

  const displayPosts =
    timelineView === TIMELINE_VIEW_MODE.ALL
      ? allPosts
      : timelineView == TIMELINE_VIEW_MODE.UPDATED
      ? updatedPosts
      : newPosts;

  const menuOptions = React.useMemo(
    () =>
      displayPosts.map((post) => [
        {
          icon: faLink,
          name: "Copy Link",
          link: {
            onClick: () => {
              const tempInput = document.createElement("input");
              tempInput.value = new URL(
                getLinkToPost({
                  slug,
                  postId: post.postId,
                  threadId,
                })?.href as string,
                window.location.origin
              ).toString();
              document.body.appendChild(tempInput);
              tempInput.select();
              document.execCommand("copy");
              document.body.removeChild(tempInput);
              toast.success("Link copied!");
            },
          },
        },
        // Add options just for logged in users
        ...(props.isLoggedIn && post.isOwn
          ? [
              {
                icon: faEdit,
                name: "Edit tags",
                link: {
                  onClick: () => {
                    props.onEditPost(post);
                  },
                },
              },
            ]
          : []),
      ]),
    [props.isLoggedIn, displayPosts, threadId]
  );
  return (
    <div
      className={classnames("timeline-container", {
        "logged-in": props.isLoggedIn,
      })}
    >
      <div className="timeline-views">
        <TemporarySegmentedButton
          options={[
            {
              id: TIMELINE_VIEW_MODE.NEW,
              label: "New",
              updates: newPosts.length > 0 ? newPosts.length : undefined,
              onClick: () => setTimelineView(TIMELINE_VIEW_MODE.NEW),
            },
            {
              id: TIMELINE_VIEW_MODE.UPDATED,
              label: "New+Updated",
              updates:
                updatedPosts.length > 0 ? updatedPosts.length : undefined,
              onClick: () => setTimelineView(TIMELINE_VIEW_MODE.UPDATED),
            },
            {
              id: TIMELINE_VIEW_MODE.ALL,
              label: `All (${allPosts.length})`,
              onClick: () => setTimelineView(TIMELINE_VIEW_MODE.ALL),
            },
          ]}
          selected={timelineView}
        />
      </div>
      <div>
        {displayPosts.length == 0 && (
          <div className="empty">
            No{" "}
            {timelineView === TIMELINE_VIEW_MODE.NEW
              ? "new "
              : timelineView == TIMELINE_VIEW_MODE.UPDATED
              ? "updated "
              : ""}
            post available.
          </div>
        )}
        {displayPosts
          .filter((_, index) => index < props.displayAtMost)
          .map((post, index) => (
            <div className="thread" key={post.postId}>
              <div className="post" key={post.postId}>
                <Post
                  key={post.postId}
                  size={post.options?.wide ? PostSizes.WIDE : PostSizes.REGULAR}
                  createdTime={moment.utc(post.created).fromNow()}
                  createdTimeLink={getLinkToPost({
                    slug,
                    threadId,
                    postId: post.postId,
                  })}
                  notesLink={getLinkToPost({
                    slug,
                    threadId,
                    postId: post.postId,
                  })}
                  text={post.content}
                  secretIdentity={post.secretIdentity}
                  userIdentity={post.userIdentity}
                  onNewContribution={() => props.onNewContribution(post.postId)}
                  onNewComment={() => props.onNewComment(post.postId, null)}
                  totalComments={post.comments?.length}
                  directContributions={
                    filteredParentChildrenMap.get(post.postId)?.children.length
                  }
                  totalContributions={getTotalContributions(
                    post,
                    filteredParentChildrenMap
                  )}
                  newPost={props.isLoggedIn && post.isNew}
                  newComments={props.isLoggedIn ? post.newCommentsAmount : 0}
                  newContributions={
                    props.isLoggedIn
                      ? getTotalNewContributions(
                          post,
                          filteredParentChildrenMap
                        )
                      : 0
                  }
                  tags={post.tags}
                  answerable={props.isLoggedIn}
                  menuOptions={menuOptions[index]}
                />
              </div>
              {post.comments && (
                <ThreadIndent level={1} key={`0_${post.postId}`} ends={[]}>
                  <CommentsThread
                    isLoggedIn={props.isLoggedIn}
                    parentPostId={post.postId}
                    parentCommentId={null}
                    level={0}
                    onReplyTo={(replyToCommentId: string) =>
                      props.onNewComment(post.postId, replyToCommentId)
                    }
                  />
                </ThreadIndent>
              )}
            </div>
          ))}
      </div>
      <style jsx>{`
        .timeline-container {
          width: 100%;
          text-align: center;
          max-width: 550px;
          margin: 0 auto;
        }
        .post {
          position: relative;
          z-index: 1;
        }
        .thread {
          margin-bottom: 20px;
        }
        .empty {
          color: white;
          width: 100%;
        }
        .timeline-views {
          margin: 20px 30px;
        }
        .button {
          display: none;
        }
        .logged-in .button {
          display: block;
        }
      `}</style>
    </div>
  );
};

export default TimelineView;

0;
