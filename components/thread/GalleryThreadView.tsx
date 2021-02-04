import React from "react";
import { MasonryView, ThreadIndent } from "@bobaboard/ui-components";
import TemporarySegmentedButton from "./TemporarySegmentedButton";
import {
  ThreadContextType,
  withThreadData,
} from "components/thread/ThreadQueryHook";
import CommentsThread from "./CommentsThread";
import { PostType } from "types/Types";
import ThreadPost from "./ThreadPost";
import { useAuth } from "components/Auth";
import {
  EditorActions,
  useEditorsDispatch,
} from "components/editors/EditorsContext";
import { ThreadPageDetails, usePageDetails } from "utils/router-utils";

enum TIMELINE_VIEW_MODE {
  UPDATED,
  ALL,
}

const EmptyGalleryView = ({
  cover,
  showCover,
  setShowCover,
  emptyMessage,
}: any) => (
  <div>
    {cover && (
      <ShowCover
        cover={cover}
        setShowCover={setShowCover}
        isShown={showCover}
      />
    )}
    <div className="image">
      <img src="/empty_gallery.gif" />
    </div>
    <div className="empty">{emptyMessage}</div>
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
const ShowCover = ({ cover, isShown, setShowCover }: any) => (
  <>
    <a
      href="#"
      onClick={(e) => {
        setShowCover(!isShown);
        e.preventDefault();
      }}
    >
      {isShown ? "Hide" : "Show"} cover (
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

interface GalleryThreadViewProps extends ThreadContextType {
  displayAtMost: number;
}
const GalleryThreadView: React.FC<GalleryThreadViewProps> = ({
  chronologicalPostsSequence,
  postCommentsMap,
  ...props
}) => {
  const masonryRef = React.createRef<{ reposition: () => void }>();
  const [showCover, setShowCover] = React.useState(false);
  const [timelineView, setTimelineView] = React.useState(
    TIMELINE_VIEW_MODE.ALL
  );
  const [showComments, setShowComments] = React.useState<string[]>([]);
  const { isLoggedIn } = useAuth();
  const dispatch = useEditorsDispatch();
  const { slug: boardSlug, threadId } = usePageDetails<ThreadPageDetails>();

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

  React.useEffect(() => {
    requestAnimationFrame(() => masonryRef.current?.reposition());
  }, [showComments, showCover]);
  const onNotesClick = React.useCallback((postId) => {
    setShowComments(
      showComments.includes(postId)
        ? showComments.filter((id) => postId != id)
        : [...showComments, postId]
    );
  }, []);

  const { coverPost, updatedPosts, allGalleryPosts } = React.useMemo(() => {
    let [coverPost, ...allGalleryPosts] = chronologicalPostsSequence;
    const updatedPosts = allGalleryPosts.filter(
      (post) => post.isNew || post.newCommentsAmount > 0
    );
    // We always automatically show all the posts when something posted there
    // is new.
    setShowComments(
      allGalleryPosts
        .filter((post) => post.newCommentsAmount > 0)
        .map((post) => post.postId)
    );

    return {
      coverPost,
      allGalleryPosts,
      updatedPosts,
    };
  }, [chronologicalPostsSequence, postCommentsMap]);
  const toDisplay = (TIMELINE_VIEW_MODE.ALL == timelineView
    ? showCover
      ? [coverPost, ...allGalleryPosts]
      : allGalleryPosts
    : showCover && (coverPost.isNew || coverPost.newCommentsAmount > 0)
    ? [coverPost, ...updatedPosts]
    : updatedPosts
  ).filter((_, index) => index < props.displayAtMost);

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

  if (!showCover && !allGalleryPosts.length) {
    return (
      <EmptyGalleryView
        showCover={showCover}
        setShowCover={setShowCover}
        cover={coverPost}
        emptyMessage={"The gallery is empty :("}
      />
    );
  }

  return (
    <>
      <div className="view-controls">
        <ShowCover
          cover={coverPost}
          setShowCover={setShowCover}
          isShown={showCover}
        />
        <TemporarySegmentedButton
          options={[
            {
              id: TIMELINE_VIEW_MODE.UPDATED,
              label: "New & Updated",
              updates:
                updatedPosts.length > 0 ? updatedPosts.length : undefined,
              onClick: () => setTimelineView(TIMELINE_VIEW_MODE.UPDATED),
            },
            {
              id: TIMELINE_VIEW_MODE.ALL,
              label: `All Posts (${allGalleryPosts.length})`,
              onClick: () => setTimelineView(TIMELINE_VIEW_MODE.ALL),
            },
          ]}
          selected={timelineView}
        />
      </div>
      {toDisplay.length == 0 && (
        <EmptyGalleryView emptyMessage={"No new (or updated) posts!"} />
      )}
      {toDisplay.length > 0 && (
        <MasonryView ref={masonryRef}>
          {
            toDisplay.map((post, index) => (
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
                <div className="post">
                  <ThreadPost
                    post={post}
                    isLoggedIn={isLoggedIn}
                    onNewContribution={onNewContribution}
                    onNewComment={onNewComment}
                    onEditPost={onEditContribution}
                    onNotesClick={onNotesClick}
                    onEmbedLoaded={() => masonryRef.current?.reposition()}
                  />
                </div>
                {post.comments && showComments.includes(post.postId) && (
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
            )) as any // TODO: figure out why it doesn't work without casting
          }
        </MasonryView>
      )}
      <style jsx>{`
        .view-controls {
          max-width: min(350px, 100%);
          margin: 0 auto;
          margin-bottom: 15px;
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
    </>
  );
};

export default withThreadData(GalleryThreadView);
