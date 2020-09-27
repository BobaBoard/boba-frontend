import React from "react";
import {
  Post,
  PostSizes,
  Button,
  ButtonStyle,
  // @ts-ignore
} from "@bobaboard/ui-components";
import debug from "debug";
import {
  getTotalContributions,
  getTotalNewContributions,
} from "../../utils/thread-utils";
import moment from "moment";
import { useThread } from "components/thread/ThreadContext";
import { useRouter } from "next/router";
import classnames from "classnames";
import { createLinkTo, THREAD_URL_PATTERN } from "utils/link-utils";
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
  isLoggedIn: boolean;
}> = (props) => {
  const [timelineView, setTimelineView] = React.useState(
    TIMELINE_VIEW_MODE.ALL
  );
  const {
    chronologicalPostsSequence,
    filteredParentChildrenMap,
    baseUrl,
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

  const setTimelineViewMode = (viewMode: TIMELINE_VIEW_MODE) => {
    const queryParam =
      viewMode === TIMELINE_VIEW_MODE.ALL
        ? "?timeline&all"
        : viewMode == TIMELINE_VIEW_MODE.UPDATED
        ? "?timeline&updated"
        : "?timeline";
    router.push(`/[boardId]/thread/[...threadId]`, `${baseUrl}${queryParam}`, {
      shallow: true,
    });
  };

  React.useEffect(() => {
    if (!isLoading && !chronologicalPostsSequence.some((post) => post.isNew)) {
      setTimelineViewMode(
        chronologicalPostsSequence.some((post) => post.newCommentsAmount > 0)
          ? TIMELINE_VIEW_MODE.UPDATED
          : TIMELINE_VIEW_MODE.ALL
      );
    }
  }, [isLoading]);

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
  }, [chronologicalPostsSequence]);

  const displayPosts =
    timelineView === TIMELINE_VIEW_MODE.ALL
      ? allPosts
      : timelineView == TIMELINE_VIEW_MODE.UPDATED
      ? updatedPosts
      : newPosts;

  const url = new URL(`${window.location.origin}${router.asPath}`);
  return (
    <div className="timeline-container">
      <div
        className={classnames("timeline-views", {
          "logged-in": props.isLoggedIn,
        })}
      >
        <div className="button new">
          <Button
            theme={
              timelineView == TIMELINE_VIEW_MODE.NEW
                ? ButtonStyle.LIGHT
                : ButtonStyle.DARK
            }
            onClick={() => setTimelineViewMode(TIMELINE_VIEW_MODE.NEW)}
            updates={newPosts.length > 0 ? newPosts.length : undefined}
          >
            New
          </Button>
        </div>
        <div className="button updated">
          <Button
            theme={
              timelineView == TIMELINE_VIEW_MODE.UPDATED
                ? ButtonStyle.LIGHT
                : ButtonStyle.DARK
            }
            onClick={() => setTimelineViewMode(TIMELINE_VIEW_MODE.UPDATED)}
            updates={updatedPosts.length > 0 ? updatedPosts.length : undefined}
          >
            Updated
          </Button>
        </div>
        <div className="button all">
          {/* @ts-ignore */}
          <Button
            theme={
              timelineView == TIMELINE_VIEW_MODE.ALL
                ? ButtonStyle.LIGHT
                : ButtonStyle.DARK
            }
            onClick={() => setTimelineViewMode(TIMELINE_VIEW_MODE.ALL)}
          >
            All ({allPosts.length})
          </Button>
        </div>
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
        {displayPosts.map((post) => (
          <div className="post" key={post.postId}>
            <Post
              key={post.postId}
              size={post.options?.wide ? PostSizes.WIDE : PostSizes.REGULAR}
              createdTime={moment.utc(post.created).fromNow()}
              createdTimeLink={createLinkTo({
                urlPattern: THREAD_URL_PATTERN,
                url: `${baseUrl}/${post.postId}${url.search}`,
              })}
              notesLink={createLinkTo({
                urlPattern: THREAD_URL_PATTERN,
                url: `${baseUrl}/${post.postId}${url.search}`,
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
                  ? getTotalNewContributions(post, filteredParentChildrenMap)
                  : 0
              }
              tags={post.tags}
            />
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
          margin-bottom: 20px;
        }
        .empty {
          color: white;
          width: 100%;
        }
        .timeline-views {
          margin: 20px 30px;
          display: flex;
          justify-content: space-evenly;
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
