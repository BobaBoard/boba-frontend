import React from "react";
import {
  Post,
  PostSizes,
  MasonryView,
  ThreadIndent,
  // @ts-ignore
} from "@bobaboard/ui-components";
import {
  getTotalContributions,
  getTotalNewContributions,
} from "../../utils/thread-utils";
import moment from "moment";
import TemporarySegmentedButton from "./TemporarySegmentedButton";
import { useThread } from "components/thread/ThreadContext";
import { useRouter } from "next/router";
import { createLinkTo, THREAD_URL_PATTERN } from "utils/link-utils";
import CommentsThread from "./CommentsThread";

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

const GalleryThreadView: React.FC<{
  onNewComment: (
    replyToPostId: string,
    replyToCommentId: string | null
  ) => void;
  onNewContribution: (id: string) => void;
  isLoggedIn: boolean;
}> = (props) => {
  const {
    baseUrl,
    chronologicalPostsSequence,
    parentChildrenMap,
    postCommentsMap,
    categoryFilterState,
  } = useThread();
  const masonryRef = React.createRef<{ reposition: () => void }>();
  const router = useRouter();
  const [showCover, setShowCover] = React.useState(false);
  const [timelineView, setTimelineView] = React.useState(
    TIMELINE_VIEW_MODE.ALL
  );
  const [showComments, setShowComments] = React.useState<string[]>([]);

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
  const toDisplay =
    TIMELINE_VIEW_MODE.ALL == timelineView
      ? showCover
        ? [coverPost, ...allGalleryPosts]
        : allGalleryPosts
      : showCover && (coverPost.isNew || coverPost.newCommentsAmount > 0)
      ? [coverPost, ...updatedPosts]
      : updatedPosts;

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

  const url = new URL(`${window.location.origin}${router.asPath}`);
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
            toDisplay.map((post) => (
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
                  <Post
                    key={post.postId}
                    size={
                      post.options?.wide ? PostSizes.WIDE : PostSizes.REGULAR
                    }
                    createdTime={moment.utc(post.created).fromNow()}
                    createdTimeLink={createLinkTo({
                      urlPattern: THREAD_URL_PATTERN,
                      url: `${baseUrl}/${post.postId}${url.search}`,
                    })}
                    notesLink={{
                      href: `${baseUrl}/${post.postId}${url.search}`,
                      onClick: () => {
                        setShowComments(
                          showComments.includes(post.postId)
                            ? showComments.filter((id) => post.postId != id)
                            : [...showComments, post.postId]
                        );
                      },
                    }}
                    text={post.content}
                    secretIdentity={post.secretIdentity}
                    userIdentity={post.userIdentity}
                    onNewContribution={() =>
                      props.onNewContribution(post.postId)
                    }
                    onNewComment={() => props.onNewComment(post.postId, null)}
                    totalComments={post.comments?.length}
                    directContributions={
                      parentChildrenMap.get(post.postId)?.children.length
                    }
                    totalContributions={getTotalContributions(
                      post,
                      parentChildrenMap
                    )}
                    newPost={props.isLoggedIn && post.isNew}
                    newComments={props.isLoggedIn ? post.newCommentsAmount : 0}
                    newContributions={
                      props.isLoggedIn
                        ? getTotalNewContributions(post, parentChildrenMap)
                        : 0
                    }
                    tags={post.tags}
                    onEmbedLoaded={() => masonryRef.current?.reposition()}
                    answerable={props.isLoggedIn}
                  />
                </div>
                {post.comments && showComments.includes(post.postId) && (
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

export default GalleryThreadView;
