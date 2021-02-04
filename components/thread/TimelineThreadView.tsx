import React from "react";
import { ThreadIndent } from "@bobaboard/ui-components";
import debug from "debug";
import {
  ThreadContextType,
  withThreadData,
} from "components/thread/ThreadQueryHook";
import classnames from "classnames";
import TemporarySegmentedButton from "./TemporarySegmentedButton";
import CommentsThread from "./CommentsThread";
import { PostType } from "types/Types";
import ThreadPost from "./ThreadPost";
import { ThreadPageDetails, usePageDetails } from "utils/router-utils";
import { useAuth } from "components/Auth";
import {
  EditorActions,
  useEditorsDispatch,
} from "components/editors/EditorsContext";
//import { useHotkeys } from "react-hotkeys-hook";

// @ts-ignore
const log = debug("bobafrontend:threadLevel-log");

export enum TIMELINE_VIEW_MODE {
  NEW,
  LATEST,
  ALL,
}

interface TimelineViewProps extends ThreadContextType {
  displayAtMost: number;
  viewMode: TIMELINE_VIEW_MODE;
  onViewModeChange: (newMode: TIMELINE_VIEW_MODE) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({
  chronologicalPostsSequence,
  newAnswersSequence,
  postCommentsMap,
  isLoading,
  viewMode,
  onViewModeChange,
  ...props
}) => {
  const { updatedPosts, allPosts } = React.useMemo(() => {
    // @ts-ignore
    let [unusedFirstElement, ...allPosts] = chronologicalPostsSequence;
    const updatedPosts = chronologicalPostsSequence.filter(
      (post) => post.isNew || post.newCommentsAmount > 0
    );

    return {
      allPosts: chronologicalPostsSequence,
      updatedPosts,
    };
  }, [chronologicalPostsSequence, postCommentsMap]);
  const { slug: boardSlug, threadId } = usePageDetails<ThreadPageDetails>();
  const { isLoggedIn } = useAuth();
  const dispatch = useEditorsDispatch();

  const onNewComment = React.useCallback(
    (replyToContributionId: string, replyToCommentId: string | null) => {
      dispatch({
        type: EditorActions.NEW_COMMENT,
        payload: {
          boardSlug,
          threadId,
          replyToContributionId,
          replyToCommentId,
        },
      });
    },
    [boardSlug, threadId]
  );

  const onNewContribution = React.useCallback(
    (replyToContributionId: string) => {
      dispatch({
        type: EditorActions.NEW_CONTRIBUTION,
        payload: {
          boardSlug,
          threadId,
          replyToContributionId,
        },
      });
    },
    [boardSlug, threadId]
  );

  const onEditContribution = React.useCallback(
    (editContribution: PostType) => {
      dispatch({
        type: EditorActions.EDIT_TAGS,
        payload: {
          boardSlug,
          threadId,
          contributionId: editContribution.postId,
        },
      });
    },
    [boardSlug, threadId]
  );

  const displayPosts =
    viewMode === TIMELINE_VIEW_MODE.ALL
      ? allPosts
      : viewMode == TIMELINE_VIEW_MODE.LATEST
      ? [...allPosts].reverse()
      : updatedPosts;

  return (
    <div
      className={classnames("timeline-container", {
        "logged-in": isLoggedIn,
      })}
    >
      <div className="timeline-views">
        <TemporarySegmentedButton
          options={[
            {
              id: TIMELINE_VIEW_MODE.NEW,
              label: "New",
              updates:
                updatedPosts.length > 0 ? updatedPosts.length : undefined,
              onClick: () => onViewModeChange(TIMELINE_VIEW_MODE.NEW),
            },
            {
              id: TIMELINE_VIEW_MODE.LATEST,
              label: "Latest",
              onClick: () => onViewModeChange(TIMELINE_VIEW_MODE.LATEST),
            },
            {
              id: TIMELINE_VIEW_MODE.ALL,
              label: `All (${allPosts.length})`,
              onClick: () => onViewModeChange(TIMELINE_VIEW_MODE.ALL),
            },
          ]}
          selected={viewMode}
        />
      </div>
      <div>
        {displayPosts.length == 0 && (
          <div className="empty">No post available.</div>
        )}
        {displayPosts
          .filter((_, index) => index < props.displayAtMost)
          .map((post) => (
            <div className="thread" key={post.postId}>
              <div className="post" key={post.postId}>
                <ThreadPost
                  post={post}
                  isLoggedIn={isLoggedIn}
                  onNewContribution={onNewContribution}
                  onNewComment={onNewComment}
                  onEditPost={onEditContribution}
                />
              </div>
              {post.comments && (
                <ThreadIndent level={1} key={`0_${post.postId}`} ends={[]}>
                  <CommentsThread
                    isLoggedIn={isLoggedIn}
                    parentPostId={post.postId}
                    parentCommentId={null}
                    level={0}
                    onReplyTo={(replyToCommentId: string) =>
                      onNewComment(post.postId, replyToCommentId)
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

export default withThreadData(TimelineView);
