import React from "react";
import { Post, PostSizes, FeedWithMenu, toast } from "@bobaboard/ui-components";
import Layout from "../../components/Layout";
import { useInfiniteQuery } from "react-query";
import { useAuth } from "../../components/Auth";
import { useBoardContext } from "../../components/BoardContext";
import { getUserActivityData } from "../../utils/queries/user";
import debug from "debug";
import moment from "moment";
import { ThreadType } from "../../types/Types";
import FeedSidebar, { FeedOptions } from "../../components/feed/FeedSidebar";

import { createLinkTo, THREAD_URL_PATTERN } from "utils/link-utils";
import {
  faBookOpen,
  faEye,
  faEyeSlash,
  faLink,
  faVolumeMute,
  faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import {
  useMarkThreadAsRead,
  useMuteThread,
  useSetThreadHidden,
} from "components/hooks/queries/thread";

const info = debug("bobafrontend:boardPage-info");
info.log = console.info.bind(console);

const MemoizedPost = React.memo(Post);

function UserFeedPage() {
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [feedOptions, setFeedOptions] = React.useState<FeedOptions>({
    updatedOnly: true,
    ownOnly: false,
  });
  const { isLoggedIn } = useAuth();
  const { boardsData } = useBoardContext();
  const setThreadHidden = useSetThreadHidden();
  const markThreadAsRead = useMarkThreadAsRead();
  const muteThread = useMuteThread();
  const threadRedirectMethod = React.useRef(
    new Map<
      string,
      {
        href: string;
        onClick: () => void;
      }
    >()
  );

  const {
    data: userActivityData,
    isFetching: isFetchingUserActivity,
    isFetchingPreviousPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    ["userActivityData", { ...feedOptions }],
    ({ pageParam = undefined }) => getUserActivityData(feedOptions, pageParam),
    {
      getNextPageParam: (lastGroup) => {
        // TODO: if this method fires too often in a row, sometimes there's duplicate
        // values within allGroups (aka groups fetched with the same cursor).
        // This seems to be a library problem.
        return lastGroup?.nextPageCursor;
      },
    }
  );

  const getMemoizedRedirectMethod = (data: {
    slug: string;
    threadId: string;
  }) => {
    if (!threadRedirectMethod.current?.has(data.threadId)) {
      info(`Creating new handler for thread id: ${data.threadId}`);
      threadRedirectMethod.current?.set(
        data.threadId,
        createLinkTo({
          urlPattern: THREAD_URL_PATTERN,
          url: `/!${data.slug}/thread/${data.threadId}`,
        })
      );
    }
    info(`Returning handler for thread id: ${data.threadId}`);
    // This should never be null
    return threadRedirectMethod.current?.get(data.threadId) || (() => {});
  };

  const showEmptyMessage =
    !isFetchingUserActivity && userActivityData?.[0]?.activity?.length === 0;

  return (
    <div className="main">
      <Layout
        mainContent={
          <FeedWithMenu
            onCloseSidebar={() => setShowSidebar(false)}
            showSidebar={showSidebar}
            sidebarContent={
              <FeedSidebar
                currentOptions={feedOptions}
                onOptionsChange={setFeedOptions}
                open={showSidebar}
              />
            }
            feedContent={
              <div className="main">
                {showEmptyMessage && (
                  <img className="empty" src={"/nothing.jpg"} />
                )}
                {userActivityData?.pages &&
                  userActivityData.pages
                    .flatMap((activityData) => activityData?.activity)
                    .map((thread: ThreadType) => {
                      const post = thread.posts[0];
                      const hasReplies =
                        thread.totalPostsAmount > 1 ||
                        thread.totalCommentsAmount > 0;
                      const redirectMethod = getMemoizedRedirectMethod({
                        slug: thread.boardSlug,
                        threadId: thread.threadId,
                      });
                      if (thread.hidden) {
                        return (
                          <div className="post hidden" key={thread.threadId}>
                            This thread was hidden{" "}
                            <a
                              href="#"
                              onClick={(e) => {
                                setThreadHidden({
                                  threadId: thread.threadId,
                                  slug: thread.boardSlug,
                                  hide: !thread.hidden,
                                });
                                e.preventDefault();
                              }}
                            >
                              [unhide]
                            </a>
                          </div>
                        );
                      }
                      // TODO: memoize whole div
                      return (
                        <div className="post" key={`${post.postId}_container`}>
                          <MemoizedPost
                            key={post.postId}
                            createdTime={`${moment
                              .utc(post.created)
                              .fromNow()}${
                              hasReplies
                                ? ` [updated: ${moment
                                    .utc(thread.lastActivity)
                                    .fromNow()}]`
                                : ""
                            }`}
                            createdTimeLink={redirectMethod}
                            text={post.content}
                            tags={post.tags}
                            secretIdentity={post.secretIdentity}
                            userIdentity={post.userIdentity}
                            accessory={post.accessory}
                            onNewContribution={() => {}}
                            onNewComment={() => {}}
                            size={
                              post?.options?.wide
                                ? PostSizes.WIDE
                                : PostSizes.REGULAR
                            }
                            newPost={isLoggedIn && !thread.muted && post.isNew}
                            newComments={
                              isLoggedIn &&
                              (thread.muted
                                ? undefined
                                : thread.newCommentsAmount)
                            }
                            board={{
                              slug: `!${thread.boardSlug}`,
                              accentColor:
                                boardsData[thread.boardSlug]?.accentColor,
                            }}
                            newContributions={
                              isLoggedIn &&
                              (thread.muted
                                ? undefined
                                : thread.newPostsAmount - (post.isNew ? 1 : 0))
                            }
                            totalComments={thread.totalCommentsAmount}
                            // subtract 1 since posts_amount is the amount of posts total in the thread
                            // including the head one.-
                            totalContributions={thread.totalPostsAmount - 1}
                            directContributions={thread.directThreadsAmount}
                            notesLink={redirectMethod}
                            muted={isLoggedIn && thread.muted}
                            menuOptions={[
                              {
                                icon: faLink,
                                name: "Copy Link",
                                link: {
                                  onClick: () => {
                                    const tempInput = document.createElement(
                                      "input"
                                    );
                                    tempInput.value = new URL(
                                      (redirectMethod as any)?.href,
                                      window.location.origin
                                    ).toString();
                                    document.body.appendChild(tempInput);
                                    tempInput.select();
                                    document.execCommand("copy");
                                    document.body.removeChild(tempInput);
                                    toast.success("Link copied!");
                                  },
                                },
                              },
                              // Add options just for logged in users
                              ...(isLoggedIn
                                ? [
                                    {
                                      icon: faBookOpen,
                                      name: "Mark Read",
                                      link: {
                                        onClick: () => {
                                          markThreadAsRead({
                                            threadId: thread.threadId,
                                            slug: thread.boardSlug,
                                          });
                                        },
                                      },
                                    },
                                    {
                                      icon: thread.muted
                                        ? faVolumeUp
                                        : faVolumeMute,
                                      name: thread.muted ? "Unmute" : "Mute",
                                      link: {
                                        onClick: () => {
                                          muteThread({
                                            threadId: thread.threadId,
                                            slug: thread.boardSlug,
                                            mute: !thread.muted,
                                          });
                                        },
                                      },
                                    },
                                    {
                                      icon: thread.hidden ? faEye : faEyeSlash,
                                      name: thread.hidden ? "Unhide" : "Hide",
                                      link: {
                                        onClick: () => {
                                          setThreadHidden({
                                            threadId: thread.threadId,
                                            slug: thread.boardSlug,
                                            hide: !thread.hidden,
                                          });
                                        },
                                      },
                                    },
                                  ]
                                : []),
                            ]}
                          />
                        </div>
                      );
                    })}
                <div className="loading">
                  {!showEmptyMessage &&
                    userActivityData?.pages?.length &&
                    (isFetchingPreviousPage
                      ? "Loading more..."
                      : hasNextPage
                      ? "..."
                      : "Nothing more to load")}
                </div>
              </div>
            }
            onReachEnd={() => {
              info(`Attempting to fetch more...`);
              info(hasNextPage);
              if (hasNextPage && !isFetchingPreviousPage) {
                info(`...found stuff!`);
                fetchNextPage();
                return;
              }
              info(
                isFetchingPreviousPage
                  ? `...but we're already fetching`
                  : `...but there's nothing!`
              );
            }}
          />
        }
        title={`Your Stuff`}
        onTitleClick={createLinkTo({ url: "/users/feed" })?.onClick}
        onCompassClick={() => setShowSidebar(true)}
        forceHideTitle={true}
        loading={isFetchingUserActivity}
      />
      <style jsx>{`
        .main {
          width: 100%;
        }
        .post.hidden {
          max-width: 500px;
          width: calc(100% - 40px);
          background-color: gray;
          padding: 20px;
          border: 1px dashed black;
          border-radius: 15px;
        }
        .post {
          margin: 20px auto;
          margin-bottom: 30px;
          width: 100%;
        }
        .post > :global(div) {
          margin: 0 auto;
        }
        .empty {
          margin: 0 auto;
          display: block;
          margin-top: 30px;
          filter: grayscale(0.4);
          max-width: 100%;
        }
        .loading {
          text-align: center;
          margin-bottom: 20px;
          color: white;
        }
        .under-construction {
          width: 50px;
          margin: 0 auto;
          display: block;
          opacity: 0.5;
          filter: grayscale(0.4);
        }
      `}</style>
    </div>
  );
}

export default UserFeedPage;
