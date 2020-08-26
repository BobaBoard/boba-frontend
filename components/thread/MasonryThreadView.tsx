// @ts-nocheck
import React from "react";
import {
  Post,
  PostSizes,
  MasonryView,
  // @ts-ignore
} from "@bobaboard/ui-components";
import debug from "debug";
import { PostType } from "../../types/Types";
import {
  getTotalContributions,
  getTotalNewContributions,
} from "../../utils/thread-utils";
import moment from "moment";
//import { useHotkeys } from "react-hotkeys-hook";

const log = debug("bobafrontend:threadLevel-log");

const MasonryThreadView: React.FC<{
  posts: PostType[] | undefined;
  postsMap: Map<string, { children: PostType[]; parent: PostType | null }>;
  categoryFilters: { name: string; active: boolean }[];
  onNewComment: (
    replyToPostId: string,
    replyToCommentId: string | null
  ) => void;
  onNewContribution: (id: string) => void;
  isLoggedIn: boolean;
  lastOf: { level: number; postId: string }[];
}> = (props) => {
  const orderedPosts = React.useMemo(() => {
    let [unusedFirstElement, ...sortedArray] = props.posts
      ? [...props.posts]
      : [];
    sortedArray.sort((post1, post2) => {
      if (moment.utc(post1.created).isBefore(moment.utc(post2.created))) {
        return -1;
      }
      if (moment.utc(post1.created).isAfter(moment.utc(post2.created))) {
        return 1;
      }
      return 0;
    });

    const activeCategories = props.categoryFilters.filter(
      (category) => category.active
    );
    if (activeCategories.length == props.categoryFilters.length) {
      return sortedArray;
    }
    return sortedArray.filter((post) =>
      post.tags.categoryTags.some((category) =>
        activeCategories.some(
          (activeCategory) => category == activeCategory.name
        )
      )
    );
  }, [props.posts, props.categoryFilters]);

  if (!orderedPosts.length) {
    return <div>The gallery is empty :(</div>;
  }

  return (
    <MasonryView>
      {orderedPosts.map((post) => (
        <div className="post" key={post.postId}>
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
            directContributions={props.postsMap.get(post.postId)?.length}
            totalContributions={getTotalContributions(post, props.postsMap)}
            newPost={props.isLoggedIn && post.isNew}
            newComments={props.isLoggedIn ? post.newCommentsAmount : 0}
            newContributions={
              props.isLoggedIn
                ? getTotalNewContributions(post, props.postsMap)
                : 0
            }
            onNotesClick={() => {}}
            notesUrl={"#"}
            tags={post.tags}
          />
        </div>
      ))}
      <style jsx>{``}</style>
    </MasonryView>
  );
};

export default MasonryThreadView;
