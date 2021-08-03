import React from "react";
import { NewThread, SegmentedButton } from "@bobaboard/ui-components";
import { useThreadContext } from "components/thread/ThreadContext";
import classnames from "classnames";
import CommentsThread from "./CommentsThread";
import ThreadPost, { scrollToPost } from "./ThreadPost";
import { ThreadPageDetails, usePageDetails } from "utils/router-utils";
import { useAuth } from "components/Auth";
import { useStemOptions } from "components/hooks/useStemOptions";
import { TIMELINE_VIEW_MODE, useThreadViewContext } from "./ThreadViewContext";
import { useThreadEditors } from "components/editors/withEditors";
import {
  extractPostId,
  getCommentThreadId,
  useThreadCollapseManager,
} from "./useCollapseManager";
import { DisplayManager } from "components/hooks/useDisplayMananger";
import EmptyView from "./EmptyView";
import { useBoardSummaryBySlug } from "components/hooks/queries/board";
//import { useHotkeys } from "react-hotkeys-hook";

// import debug from "debug";
// const log = debug("bobafrontend:threadLevel-log");

interface TimelineViewProps {
  displayManager: DisplayManager;
}

const TimelineView: React.FC<TimelineViewProps> = (props) => {
  const { newRepliesCount, chronologicalPostsSequence } = useThreadContext();
  const { timelineViewMode, setTimelineViewMode } = useThreadViewContext();
  const { onNewComment, onNewContribution, onEditContribution } =
    useThreadEditors();
  const {
    onCollapseLevel,
    onUncollapseLevel,
    onToggleCollapseLevel,
    getCollapseReason,
    isCollapsed,
  } = useThreadCollapseManager();

  const { slug: boardSlug, threadId } = usePageDetails<ThreadPageDetails>();
  const boardData = useBoardSummaryBySlug(boardSlug);
  const { isLoggedIn } = useAuth();

  const displayPosts = props.displayManager.currentModeLoadedElements;

  const getStemOptions = useStemOptions({
    boardSlug,
    threadId,
    onCollapse: (levelId) => {
      onCollapseLevel(levelId);
    },
    onScrollTo: (levelId) => {
      if (!levelId) {
        return;
      }
      scrollToPost(extractPostId(levelId), boardData?.accentColor);
    },
    onReply: (levelId) => {
      if (!levelId) {
        return;
      }
      onNewContribution(extractPostId(levelId));
    },
  });

  const viewChangeOptions = React.useMemo(
    () => [
      {
        id: TIMELINE_VIEW_MODE.NEW,
        label: "New",
        updates: newRepliesCount > 0 ? newRepliesCount : undefined,
        link: { onClick: () => setTimelineViewMode(TIMELINE_VIEW_MODE.NEW) },
      },
      {
        id: TIMELINE_VIEW_MODE.LATEST,
        label: "Latest",
        link: { onClick: () => setTimelineViewMode(TIMELINE_VIEW_MODE.LATEST) },
      },
      {
        id: TIMELINE_VIEW_MODE.ALL,
        label: `All (${chronologicalPostsSequence.length})`,
        link: { onClick: () => setTimelineViewMode(TIMELINE_VIEW_MODE.ALL) },
      },
    ],
    [newRepliesCount, setTimelineViewMode, chronologicalPostsSequence.length]
  );

  return (
    <div
      className={classnames("timeline-container", {
        "logged-in": isLoggedIn,
      })}
    >
      <div className="timeline-views">
        <SegmentedButton
          options={viewChangeOptions}
          selected={timelineViewMode}
        />
      </div>
      <div>
        {displayPosts.length == 0 && <EmptyView />}
        {displayPosts.map((post) => {
          return (
            <div className="thread" key={post.postId}>
              <NewThread
                onCollapseLevel={onCollapseLevel}
                onUncollapseLevel={onUncollapseLevel}
                getCollapseReason={getCollapseReason}
                getStemOptions={getStemOptions}
              >
                {(setThreadBoundary) => (
                  <>
                    <div className="post" key={post.postId}>
                      <ThreadPost
                        post={post}
                        isLoggedIn={isLoggedIn}
                        onNewContribution={onNewContribution}
                        onNewComment={onNewComment}
                        onEditPost={onEditContribution}
                        showThread
                        avatarRef={setThreadBoundary}
                        onNotesClick={onToggleCollapseLevel}
                      />
                    </div>
                    {post.comments && (
                      <NewThread.Indent
                        id={getCommentThreadId(post.postId)}
                        collapsed={isCollapsed(getCommentThreadId(post.postId))}
                      >
                        <div className="comments-thread">
                          <CommentsThread parentPostId={post.postId} />
                        </div>
                      </NewThread.Indent>
                    )}
                  </>
                )}
              </NewThread>
            </div>
          );
        })}
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
          margin: 20px auto;
          max-width: 300px;
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
