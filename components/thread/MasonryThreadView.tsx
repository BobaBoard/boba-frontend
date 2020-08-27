import React from "react";
import {
  Post,
  PostSizes,
  MasonryView,
  // @ts-ignore
} from "@bobaboard/ui-components";
import debug from "debug";
import {
  getTotalContributions,
  getTotalNewContributions,
} from "../../utils/thread-utils";
import moment from "moment";
import { useThread } from "components/thread/ThreadContext";

const log = debug("bobafrontend:threadLevel-log");

const MasonryThreadView: React.FC<{
  onNewComment: (
    replyToPostId: string,
    replyToCommentId: string | null
  ) => void;
  onNewContribution: (id: string) => void;
  isLoggedIn: boolean;
}> = (props) => {
  const {
    allPosts,
    filteredParentChildrenMap,
    categoryFilterState,
  } = useThread();

  const orderedPosts = React.useMemo(() => {
    // @ts-ignore
    let [unusedFirstElement, ...sortedArray] = allPosts ? [...allPosts] : [];
    sortedArray.sort((post1, post2) => {
      if (moment.utc(post1.created).isBefore(moment.utc(post2.created))) {
        return -1;
      }
      if (moment.utc(post1.created).isAfter(moment.utc(post2.created))) {
        return 1;
      }
      return 0;
    });

    const activeCategories = categoryFilterState.filter(
      (category) => category.active
    );
    if (activeCategories.length == categoryFilterState.length) {
      return sortedArray;
    }
    return sortedArray.filter((post) =>
      post.tags.categoryTags.some((category) =>
        activeCategories.some(
          (activeCategory) => category == activeCategory.name
        )
      )
    );
  }, [allPosts, categoryFilterState]);

  const picsContainerRef = React.useRef<HTMLDivElement[]>([]);
  const resizeObserver = React.useRef<ResizeObserver>();
  const [x, setX] = React.useState(0);

  React.useEffect(() => {
    if (picsContainerRef.current) {
      resizeObserver.current = new ResizeObserver((entries) => {
        console.log(entries);
        setX(x + 1);
      });
      picsContainerRef.current.forEach((pic) => {
        if (pic && !pic.getAttribute("observing")) {
          pic.setAttribute("observing", "true");
          resizeObserver.current?.observe(pic);
        }
      });
    }
    return () => {
      // picsContainerRef.current &&
      //   resizeObserver.current?.unobserve(picsContainerRef.current);
    };
  }, [picsContainerRef.current.length, orderedPosts]);

  if (!orderedPosts.length) {
    return <div>The gallery is empty :(</div>;
  }

  return (
    <MasonryView>
      {orderedPosts.map((post) => (
        <div
          className="post"
          key={post.postId}
          ref={(ref) => {
            picsContainerRef.current.push(ref);
          }}
        >
          <Post
            key={post.postId}
            size={post.options?.wide ? PostSizes.WIDE : PostSizes.REGULAR}
            createdTime={moment.utc(post.created).fromNow()}
            text={post.content}
            secretIdentity={post.secretIdentity}
            userIdentity={post.userIdentity}
            onNewContribution={() => props.onNewContribution(post.postId)}
            onNewComment={() => props.onNewComment(post.postId, null)}
            totalComments={post.comments?.length}
            directContributions={
              filteredParentChildrenMap.get(post.postId)?.length
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
            onNotesClick={() => {}}
            notesUrl={"#"}
            tags={post.tags}
          />
        </div>
      ))}
      <style jsx>{`
        .post {
          max-width: 45%;
        }
      `}</style>
    </MasonryView>
  );
};

export default MasonryThreadView;
