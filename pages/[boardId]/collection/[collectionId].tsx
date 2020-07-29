import React from "react";
import {
  FeedWithMenu,
  PostingActionButton,
  // @ts-ignore
} from "@bobaboard/ui-components";
import Layout from "../../../components/Layout";
import PostEditorModal from "../../../components/PostEditorModal";
import { useRouter } from "next/router";
import { useAuth } from "../../../components/Auth";
import debug from "debug";
import { PostType } from "../../../types/Types";
import classnames from "classnames";
import { useBoardTheme } from "../../../components/BoardTheme";

const log = debug("bobafrontend:collection-log");

function CollectionPage() {
  const router = useRouter();
  const slug: string = router.query.boardId?.slice(1) as string;
  const collectionId = router.query.collectionId as string;

  const [postEditorOpen, setPostEditorOpen] = React.useState(false);
  const { isLoggedIn, user } = useAuth();
  const { [slug]: boardData } = useBoardTheme();

  return (
    <div className="main">
      {isLoggedIn && (
        <>
          <PostEditorModal
            isOpen={postEditorOpen}
            secretIdentity={{
              name: "[TBD]",
              avatar: `/tuxedo-mask.jpg`,
            }}
            userIdentity={{
              name: user?.username,
              avatar: user?.avatarUrl,
            }}
            onPostSaved={(post: PostType) => {
              log(
                `Saved new thread ${post.threadId} to collection ${collectionId}.`
              );
              log(post);
              //   const threadData = queryCache.getQueryData<ThreadType>([
              //     "threadData",
              //     { threadId },
              //   ]);
              //   if (!threadData) {
              //     log(
              //       `Couldn't read thread data during post upload for thread id ${threadId}`
              //     );
              //     return;
              //   }
              //   threadData.posts = [...threadData.posts, post];
              //   queryCache.setQueryData(["threadData", { threadId }], () => ({
              //     ...threadData,
              //   }));
              setPostEditorOpen(false);
            }}
            onCloseModal={() => setPostEditorOpen(false)}
            slug={slug}
            replyToPostId={null}
            uploadBaseUrl={`images/${slug}/${collectionId}/`}
          />
        </>
      )}
      <Layout
        mainContent={
          <FeedWithMenu
            sidebarContent={<div />}
            feedContent={
              <div className="feed-content">
                TBD
                <div
                  className={classnames("loading-indicator", {
                    loading: false,
                  })}
                >
                  Loading...
                </div>
              </div>
            }
          />
        }
        title={`!${slug}`}
        onTitleClick={() => {
          router.push(`/[boardId]`, `/!${slug}`, {
            shallow: true,
          });
        }}
        loading={false}
        actionButton={
          <PostingActionButton
            accentColor={boardData?.accentColor || "#f96680"}
            onNewPost={() => setPostEditorOpen(true)}
          />
        }
      />
      <style jsx>
        {`
          .feed-content {
            max-width: 100%;
            padding-bottom: 20px;
          }
          .loading-indicator {
            color: white;
            width: 100%;
            text-align: center;
            padding: 20px;
            display: none;
          }
          .loading-indicator.loading {
            display: block;
          }
        `}
      </style>
    </div>
  );
}

export default CollectionPage;
