import React from "react";
import {
  MasonryView,
  NewThread,
  SegmentedButton,
} from "@bobaboard/ui-components";
import { useThreadContext } from "components/thread/ThreadContext";
import CommentsThread from "./CommentsThread";
import EmptyView from "./EmptyView";
import { PostType } from "types/Types";
import ThreadPost, { scrollToPost } from "./ThreadPost";
import { useAuth } from "components/Auth";
import { ThreadPageDetails, usePageDetails } from "utils/router-utils";
import { useStemOptions } from "components/hooks/useStemOptions";

import { GALLERY_VIEW_MODE, useThreadViewContext } from "./ThreadViewContext";
import { useThreadEditors } from "components/editors/withEditors";
import {
  extractPostId,
  getCommentThreadId,
  useThreadCollapseManager,
} from "./useCollapseManager";
import { DisplayManager } from "components/hooks/useDisplayMananger";
import { useBoardSummaryBySlug } from "components/hooks/queries/board";

// import debug from "debug";
// const log = debug("bobafrontend:threadPage:GalleryView-log");

// This is just a temporary component until we get a better handler here.
const ShowCover = ({
  cover,
  showCover,
  setShowCover,
}: {
  cover: PostType | null;
  showCover: boolean;
  setShowCover: (show: boolean) => void;
}) => {
  const { postCommentsMap } = useThreadContext();
  const postComments =
    typeof cover?.postId !== "undefined"
      ? postCommentsMap.get(cover.postId)
      : undefined;
  return (
    <>
      <button
        // TODO: this button should be an a with an href to the page with the cover on/off.
        onClick={(e) => {
          setShowCover(!showCover);
          e.preventDefault();
        }}
      >
        {showCover ? "Hide" : "Show"} cover (
        {postComments?.total || 0 /*TODO: wtf?? why do we need this??*/}{" "}
        comments, {postComments?.new || 0} new)
      </button>
      <style jsx>{`
        button {
          display: block;
          color: white;
          text-align: center;
          font-size: small;
          margin: 10px auto;
          border: 0;
          background-color: transparent;
        }
        button:hover {
          cursor: pointer;
          text-decoration: underline;
        }
        button:focus {
          outline: none;
        }
        button:focus-visible {
          outline: auto;
        }
      `}</style>
    </>
  );
};

interface GalleryThreadViewProps {
  displayManager: DisplayManager;
}
const GalleryThreadView: React.FC<GalleryThreadViewProps> = (props) => {
  const masonryRef = React.createRef<{ reposition: () => void }>();
  const { isLoggedIn } = useAuth();
  const { onNewComment, onNewContribution, onEditContribution } =
    useThreadEditors();
  const { slug: boardSlug, threadId } = usePageDetails<ThreadPageDetails>();
  const boardData = useBoardSummaryBySlug(boardSlug);
  const { galleryViewMode, setGalleryViewMode } = useThreadViewContext();
  const {
    chronologicalPostsSequence,
    newRepliesCount,
    threadRoot,
    postCommentsMap,
  } = useThreadContext();
  const {
    onCollapseLevel,
    onUncollapseLevel,
    getCollapseReason,
    onToggleCollapseLevel,
    isCollapsed,
    subscribeToCollapseChange,
    unsubscribeFromCollapseChange,
  } = useThreadCollapseManager();

  // We reposition more than once because the timing is finnicky.
  const repositionGallery = React.useCallback(() => {
    let repositionsCount = 10;
    let timeout: NodeJS.Timeout | null = setTimeout(function reposition() {
      masonryRef.current?.reposition();
      if (repositionsCount > 0) {
        repositionsCount--;
        timeout = setTimeout(reposition, 300);
      } else {
        timeout = null;
      }
    }, 200);
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [masonryRef]);

  React.useEffect(repositionGallery, [
    galleryViewMode.showCover,
    masonryRef,
    repositionGallery,
  ]);

  React.useEffect(() => {
    subscribeToCollapseChange(repositionGallery);
    return () => unsubscribeFromCollapseChange(repositionGallery);
  }, [
    repositionGallery,
    subscribeToCollapseChange,
    unsubscribeFromCollapseChange,
  ]);

  const { currentModeDisplayElements, currentModeLoadedElements } =
    props.displayManager;

  const cover = threadRoot;

  React.useEffect(() => {
    // Hide comments from all posts with no new comments.
    currentModeDisplayElements
      .filter((post) => !postCommentsMap.get(post.postId)?.new)
      .forEach((post) => onCollapseLevel(post.postId));
  }, [currentModeDisplayElements, onCollapseLevel, postCommentsMap]);

  React.useEffect(() => {
    if (currentModeLoadedElements.length > 0) {
      repositionGallery();
    }
  }, [currentModeLoadedElements, repositionGallery]);

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

  const displayElements = [...currentModeLoadedElements];
  if (displayElements[0] == threadRoot && !galleryViewMode.showCover) {
    displayElements.shift();
  }

  return (
    <div className="gallery">
      <div className="view-controls">
        <ShowCover
          showCover={galleryViewMode.showCover}
          setShowCover={(show: boolean) => {
            setGalleryViewMode({
              mode: galleryViewMode.mode,
              showCover: show,
            });
          }}
          cover={cover}
        />
        <SegmentedButton
          options={[
            {
              id: GALLERY_VIEW_MODE.NEW,
              label: "New & Updated",
              updates: newRepliesCount > 0 ? newRepliesCount : undefined,
              link: {
                onClick: () =>
                  setGalleryViewMode({
                    mode: GALLERY_VIEW_MODE.NEW,
                    showCover: galleryViewMode.showCover,
                  }),
              },
            },
            {
              id: GALLERY_VIEW_MODE.ALL,
              label: `All Posts (${
                chronologicalPostsSequence.length -
                (galleryViewMode.showCover ? 0 : 1)
              })`,
              link: {
                onClick: () =>
                  setGalleryViewMode({
                    mode: GALLERY_VIEW_MODE.ALL,
                    showCover: galleryViewMode.showCover,
                  }),
              },
            },
          ]}
          selected={galleryViewMode.mode}
        />
      </div>
      {displayElements.length == 0 && <EmptyView />}
      {displayElements.length > 0 && (
        <MasonryView ref={masonryRef}>
          {displayElements.map((post) => (
            <div
              className="thread"
              key={post.postId}
              // TODO: figure out why this is necessary.
              // Right now it's here because there is a bug in the masonry view where
              // when the elements are changed the positions are recalculated but, for some reason,
              // position: absolute isn't maintained in certain divs. I assume it has somethign to do
              // with react and re-rendering, but honestly I have no idea.
              style={{ position: "absolute" }}
            >
              <NewThread
                onCollapseLevel={onCollapseLevel}
                onUncollapseLevel={onUncollapseLevel}
                getCollapseReason={getCollapseReason}
                getStemOptions={getStemOptions}
              >
                {(setThreadBoundary) => (
                  <>
                    <div className="post">
                      <ThreadPost
                        post={post}
                        isLoggedIn={isLoggedIn}
                        onNewContribution={onNewContribution}
                        onNewComment={onNewComment}
                        onEditPost={onEditContribution}
                        onNotesClick={onToggleCollapseLevel}
                        onEmbedLoaded={repositionGallery}
                        avatarRef={setThreadBoundary}
                      />
                    </div>
                    {postCommentsMap.has(post.postId) &&
                      !isCollapsed(post.postId) && (
                        <NewThread.Indent id={getCommentThreadId(post.postId)}>
                          <div className="comments">
                            <CommentsThread
                              parentPostId={post.postId}
                              disableMotionEffect
                            />
                          </div>
                        </NewThread.Indent>
                      )}
                  </>
                )}
              </NewThread>
            </div>
          ))}
        </MasonryView>
      )}
      <style jsx>{`
        .gallery {
          width: 100%;
          position: relative;
          margin-top: 20px;
          margin-bottom: 20px;
        }
        .view-controls {
          margin: 0 auto;
          margin-bottom: 15px;
          max-width: 300px;
        }
        .post {
          z-index: 1;
          position: relative;
        }
        .comments {
          position: relative;
        }
        .thread {
          max-width: min(45%, 550px);
        }
        @media only screen and (max-width: 550px) {
          .thread {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default GalleryThreadView;
