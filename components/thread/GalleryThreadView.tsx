import React from "react";
import {
  MasonryView,
  NewThread,
  SegmentedButton,
} from "@bobaboard/ui-components";
import { useThreadContext } from "components/thread/ThreadContext";
import CommentsThread from "./CommentsThread";
import { PostType } from "types/Types";
import ThreadPost, { scrollToPost } from "./ThreadPost";
import { useAuth } from "components/Auth";
import { ThreadPageDetails, usePageDetails } from "utils/router-utils";
import { useStemOptions } from "components/hooks/useStemOptions";
import { useBoardContext } from "components/BoardContext";

import { GALLERY_VIEW_MODE, useThreadView } from "./useThreadView";
import { useThreadEditors } from "components/editors/withEditors";
import {
  extractPostId,
  getCommentThreadId,
  useThreadCollapseManager,
} from "./useCollapseManager";
import { DisplayManager } from "components/hooks/useDisplayMananger";

// import debug from "debug";
// const log = debug("bobafrontend:threadPage:GalleryView-log");

const EmptyGalleryView = (props: { emptyMessage: string }) => (
  <div>
    <div className="image">
      <img src="/empty_gallery.gif" />
    </div>
    <div className="empty">{props.emptyMessage}</div>
    <style jsx>{`
      .image {
        text-align: center;
      }
      .image img {
        max-width: 100%;
      }
      .empty {
        color: white;
        text-align: center;
        margin-top: 10px;
        font-size: normal;
      }
      a {
        display: block;
        color: white;
        text-align: center;
        font-size: small;
        margin-top: 10px;
        margin-bottom: 10px;
      }
    `}</style>
  </div>
);

// This is just a temporary component until we get a better handler here.
const ShowCover = ({
  cover,
  showCover,
  setShowCover,
}: {
  cover: PostType | null;
  showCover: boolean;
  setShowCover: (show: boolean) => void;
}) => (
  <>
    <a
      href="#"
      onClick={(e) => {
        setShowCover(!showCover);
        e.preventDefault();
      }}
    >
      {showCover ? "Hide" : "Show"} cover (
      {cover?.commentsAmount || 0 /*TODO: wtf?? why do we need this??*/}{" "}
      comments, {cover?.newCommentsAmount} new)
    </a>
    <style jsx>{`
      a {
        display: block;
        color: white;
        text-align: center;
        font-size: small;
        margin-top: 10px;
        margin-bottom: 10px;
      }
    `}</style>
  </>
);

interface GalleryThreadViewProps {
  displayManager: DisplayManager;
  onTotalPostsChange: (total: number) => void;
}
const GalleryThreadView: React.FC<GalleryThreadViewProps> = (props) => {
  const masonryRef = React.createRef<{ reposition: () => void }>();
  const { isLoggedIn } = useAuth();
  const {
    onNewComment,
    onNewContribution,
    onEditContribution,
  } = useThreadEditors();
  const { slug: boardSlug, threadId } = usePageDetails<ThreadPageDetails>();
  const boardData = useBoardContext(boardSlug);
  const { galleryViewMode, setGalleryViewMode } = useThreadView();
  const {
    chronologicalPostsSequence,
    newRepliesCount,
    threadRoot,
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

  const repositionGallery = React.useCallback(() => {
    requestAnimationFrame(() => masonryRef.current?.reposition());
  }, [masonryRef]);

  // const activeCategories = categoryFilterState.filter(
  //   (category) => category.active
  // );
  // const isUntaggedActive = activeCategories.some(
  //   (category) => category.name == UNCATEGORIZED_LABEL
  // );
  // let orderedPosts = unfilteredArray;
  // if (activeCategories.length != categoryFilterState.length) {
  //   orderedPosts = unfilteredArray.filter(
  //     (post) =>
  //       (post.tags.categoryTags.length == 0 && isUntaggedActive) ||
  //       post.tags.categoryTags.some((category) =>
  //         activeCategories.some(
  //           (activeCategory) => category == activeCategory.name
  //         )
  //       )
  //   );
  // }

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

  const {
    currentModeDisplayElements,
    currentModeLoadedElements,
  } = props.displayManager;

  const cover = threadRoot;

  React.useEffect(() => {
    // Hide comments from all posts with no new comments.
    currentModeDisplayElements
      .filter((post) => post.newCommentsAmount === 0)
      .forEach((post) => onCollapseLevel(post.postId));
  }, [currentModeDisplayElements, onCollapseLevel]);

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
      {currentModeDisplayElements.length == 0 && (
        <EmptyGalleryView
          emptyMessage={
            chronologicalPostsSequence.length == 1
              ? "The gallery is empty :("
              : "No new (or updated) posts!"
          }
        />
      )}
      {currentModeLoadedElements.length > 0 && (
        <MasonryView ref={masonryRef}>
          {currentModeLoadedElements.map((post) => (
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
                    {post.comments && !isCollapsed(post.postId) && (
                      <NewThread.Indent id={getCommentThreadId(post.postId)}>
                        <CommentsThread parentPostId={post.postId} />
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
