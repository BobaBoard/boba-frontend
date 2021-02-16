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
import { ExistanceParam } from "components/QueryParamNextProvider";
import { DecodedValueMap, useQueryParams } from "use-query-params";
//import { useHotkeys } from "react-hotkeys-hook";

// @ts-ignore
const log = debug("bobafrontend:threadLevel-log");

export enum TIMELINE_VIEW_MODE {
  NEW,
  LATEST,
  ALL,
}

const TimelineViewQueryParams = {
  new: ExistanceParam,
  latest: ExistanceParam,
  all: ExistanceParam,
};

const getTimelineViewMode = (
  timelineQuery: DecodedValueMap<typeof TimelineViewQueryParams>
) => {
  if (timelineQuery.new) {
    return TIMELINE_VIEW_MODE.NEW;
  } else if (timelineQuery.latest) {
    return TIMELINE_VIEW_MODE.LATEST;
  } else if (timelineQuery.all) {
    return TIMELINE_VIEW_MODE.ALL;
  }
  return TIMELINE_VIEW_MODE.ALL;
};

interface TimelineViewProps extends ThreadContextType {
  displayAtMost: number;
  onTotalPostsChange: (total: number) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({
  chronologicalPostsSequence,
  newAnswersSequence,
  postCommentsMap,
  isLoading,
  isRefetching,
  hasNewReplies,
  ...props
}) => {
  const { updatedPosts, allPosts } = React.useMemo(() => {
    const updatedPosts = chronologicalPostsSequence.filter(
      (post) => post.isNew || post.newCommentsAmount > 0
    );

    return {
      allPosts: chronologicalPostsSequence,
      updatedPosts,
    };
  }, [chronologicalPostsSequence, postCommentsMap]);

  const [timelineViewParams, setTimelineViewParams] = useQueryParams(
    TimelineViewQueryParams
  );
  const viewMode = getTimelineViewMode(timelineViewParams);

  React.useEffect(() => {
    if (isRefetching || isLoading) {
      return;
    }
    if (
      timelineViewParams.new ||
      timelineViewParams.latest ||
      timelineViewParams.all
    ) {
      // A default view has already been set. Bail.
      return;
    }
    setTimelineViewParams(
      {
        new: hasNewReplies,
        all: false,
        latest: false,
      },
      "replaceIn"
    );
  }, [isRefetching, isLoading]);

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

  React.useEffect(() => {
    props.onTotalPostsChange(displayPosts.length);
  }, [displayPosts.length]);

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
              onClick: () =>
                setTimelineViewParams(
                  {
                    new: true,
                    latest: false,
                    all: false,
                  },
                  "replaceIn"
                ),
            },
            {
              id: TIMELINE_VIEW_MODE.LATEST,
              label: "Latest",
              onClick: () =>
                setTimelineViewParams(
                  {
                    new: false,
                    latest: true,
                    all: false,
                  },
                  "replaceIn"
                ),
            },
            {
              id: TIMELINE_VIEW_MODE.ALL,
              label: `All (${allPosts.length})`,
              onClick: () =>
                setTimelineViewParams(
                  {
                    new: false,
                    latest: false,
                    all: true,
                  },
                  "replaceIn"
                ),
            },
          ]}
          selected={viewMode}
        />
      </div>
      <div>
        {displayPosts.length == 0 && (
          <div className="empty">No new or updated post!</div>
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
