import React from "react";
import { NewThread } from "@bobaboard/ui-components";
import ThreadPost, { scrollToPost } from "./ThreadPost";
import { useThreadContext } from "components/thread/ThreadContext";
import { CommentType, PostType } from "../../types/Types";
import Link from "next/link";
import classnames from "classnames";
import CommentsThread from "./CommentsThread";
import { usePageDetails, ThreadPageDetails } from "utils/router-utils";
import { useAuth } from "components/Auth";
import { useStemOptions } from "components/hooks/useStemOptions";
import { useBoardContext } from "components/BoardContext";
import { useThreadEditors } from "components/editors/withEditors";
import {
  CollapseGroup,
  CollapseManager,
  extractPostId,
  getCommentThreadId,
  useThreadCollapseManager,
} from "./useCollapseManager";
import { DisplayManager } from "components/hooks/useDisplayMananger";

import debug from "debug";
const error = debug("bobafrontend:ThreadLevel-log");
const log = debug("bobafrontend:ThreadLevel-log");
const info = debug("bobafrontend:ThreadLevel-info");

const CollapseGroupDisplay: React.FC<{
  parentPostId: string;
  collapseGroup: CollapseGroup;
  collapseManager: ReturnType<typeof useThreadCollapseManager>;
  toDisplay: (PostType | CommentType)[];
}> = ({ parentPostId, collapseGroup, collapseManager, toDisplay }) => {
  const { parentChildrenMap } = useThreadContext();
  const children = parentChildrenMap.get(parentPostId)?.children;
  const [firstElement, lastElement] = collapseGroup;
  const collapseGroupId = collapseManager.getCollapseGroupId(collapseGroup);
  const firstElementIndex = children?.findIndex(
    (post) => post.postId == firstElement
  );
  const lastElementIndex = children?.findIndex(
    (post) => post.postId == lastElement
  );

  info(`Rendering collapse group:`, collapseGroup);
  info(
    `Collapse group is ${
      collapseManager.isCollapsed(collapseGroupId) ? "collapsed" : "UNcollapsed"
    }.`
  );
  if (!firstElementIndex || !lastElementIndex) {
    error(
      `Found collapse group with invalid indexed: [${firstElementIndex}, ${lastElementIndex}`
    );
    return null;
  }

  return (
    <NewThread.CollapseGroup
      id={collapseGroupId}
      collapsed={collapseManager.isCollapsed(collapseGroupId)}
    >
      {children?.slice(firstElementIndex, lastElementIndex).map((post) => (
        <ThreadLevel
          key={post.postId}
          post={post}
          toDisplay={toDisplay}
          collapseManager={collapseManager}
        />
      ))}
    </NewThread.CollapseGroup>
  );
};

const ThreadLevel: React.FC<{
  post: PostType;
  showThread?: boolean;
  toDisplay: (PostType | CommentType)[];
  collapseManager: ReturnType<typeof useThreadCollapseManager>;
}> = (props) => {
  const {
    onNewComment,
    onNewContribution,
    onEditContribution,
  } = useThreadEditors();
  const { isLoggedIn } = useAuth();
  //info(`Rendering subtree starting with post with id ${props.post.postId}`);
  const { parentChildrenMap } = useThreadContext();
  if (!props.toDisplay.includes(props.post)) {
    return null;
  }

  const hasNestedContributions = parentChildrenMap.has(props.post.postId);
  // When there's only comments replying to the post, then the indentation is just made of
  // the comments themselves.
  // If there's comments and contributions, then the contributions are indented immediately
  // underneath this post, and the comments thread, is another extra indent at the beginning
  // of the contributions indent.
  // It's easier to reason about this when realizing that comments can be collapsed independently
  // from other contributions, and thus need their own special "indent level".
  const commentsThread = (
    <NewThread.Indent
      id={
        hasNestedContributions
          ? getCommentThreadId(props.post.postId)
          : props.post.postId
      }
      collapsed={props.collapseManager.isCollapsed(
        hasNestedContributions
          ? getCommentThreadId(props.post.postId)
          : props.post.postId
      )}
    >
      <CommentsThread parentPostId={props.post.postId} />
    </NewThread.Indent>
  );

  const hasComments = !!props.post.comments?.length;
  const children = parentChildrenMap.get(props.post.postId)?.children;
  const childrenDisplay: React.ReactNode[] = [];
  for (let i = 0; i < (children?.length || 0); i++) {
    const currentPost = children![i];
    const collapseGroup = props.collapseManager.getCollapseGroupAt(
      currentPost.postId
    );
    if (collapseGroup) {
      childrenDisplay.push(
        <CollapseGroupDisplay
          collapseGroup={collapseGroup}
          collapseManager={props.collapseManager}
          toDisplay={props.toDisplay}
          parentPostId={props.post.postId}
        />
      );
      i =
        children?.findIndex((child) => child.postId === collapseGroup[1]) ||
        Infinity;
      continue;
    }
    childrenDisplay.push(
      <ThreadLevel key={currentPost.postId} {...props} post={currentPost} />
    );
  }
  return (
    <>
      <NewThread.Item key={props.post.postId}>
        {(setHandler, boundaryId) => (
          <>
            <div
              className={classnames("post", {
                "with-indent": parentChildrenMap.has(props.post.postId),
              })}
            >
              <ThreadPost
                post={props.post}
                isLoggedIn={isLoggedIn}
                onNewContribution={onNewContribution}
                onNewComment={onNewComment}
                onEditPost={onEditContribution}
                avatarRef={setHandler}
                onNotesClick={props.collapseManager.onToggleCollapseLevel}
              />
            </div>
            {!hasNestedContributions && hasComments && commentsThread}
            {hasNestedContributions && (
              <NewThread.Indent
                id={props.post.postId}
                collapsed={props.collapseManager.isCollapsed(props.post.postId)}
              >
                {hasComments && (
                  <NewThread.Item parentBoundary={boundaryId}>
                    {commentsThread}
                  </NewThread.Item>
                )}
                {childrenDisplay}
              </NewThread.Indent>
            )}
          </>
        )}
      </NewThread.Item>
      <style jsx>
        {`
          .level {
            width: 100%;
          }
          .post {
            margin-top: 30px;
            margin-bottom: 15px;
            position: relative;
            pointer-events: none !important;
          }
        `}
      </style>
    </>
  );
};
ThreadLevel.displayName = "MemoizedThreadLevel";

interface ThreadViewProps {
  onTotalPostsChange: (total: number) => void;
  displayManager: DisplayManager;
  collapseManager: CollapseManager;
}
const ThreadView: React.FC<ThreadViewProps> = (props) => {
  const {
    postId,
    threadBaseUrl,
    slug: boardSlug,
    threadId,
  } = usePageDetails<ThreadPageDetails>();
  const { onNewContribution } = useThreadEditors();
  const boardData = useBoardContext(boardSlug);
  const { currentRoot, threadDisplaySequence } = useThreadContext();
  log(`Rerendering ThreadView.`);
  info(threadDisplaySequence);

  const {
    onCollapseLevel,
    onUncollapseLevel,
    getCollapseReason,
  } = props.collapseManager;

  const getStemOptions = useStemOptions({
    boardSlug,
    threadId,
    onCollapse: onCollapseLevel,
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

  const { onTotalPostsChange } = props;
  React.useEffect(() => {
    onTotalPostsChange(threadDisplaySequence.length);
    log(
      `Total post length changed. New Total: ${threadDisplaySequence.length}`
    );
  }, [threadDisplaySequence, onTotalPostsChange]);

  const toDisplay = threadDisplaySequence.filter(
    (value, index) => index < props.displayManager.maxDisplay
  );

  log(`Displaying `);
  info(toDisplay);

  if (!currentRoot) {
    return <div />;
  }
  return (
    <div className="thread-container">
      <div
        className={classnames("whole-thread", {
          visible: !!postId,
        })}
      >
        <Link
          as={`${threadBaseUrl}${window.location.search}`}
          href={`/[boardId]/thread/[...threadId]`}
          shallow={true}
        >
          <a>Show whole thread</a>
        </Link>
      </div>
      <NewThread
        onCollapseLevel={onCollapseLevel}
        onUncollapseLevel={onUncollapseLevel}
        getCollapseReason={getCollapseReason}
        getStemOptions={getStemOptions}
      >
        <ThreadLevel
          post={currentRoot}
          toDisplay={toDisplay}
          collapseManager={props.collapseManager}
        />
      </NewThread>
      <style jsx>{`
        .whole-thread {
          margin-bottom: -5px;
          padding-top: 10px;
          display: none;
        }
        .whole-thread.visible {
          display: block;
        }
        .whole-thread a {
          color: white;
          font-size: 13px;
        }
        .thread-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
};

const MemoizedThreadView = React.memo(ThreadView);
MemoizedThreadView.whyDidYouRender = true;
export default MemoizedThreadView;
