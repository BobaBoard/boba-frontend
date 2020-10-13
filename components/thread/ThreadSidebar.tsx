import React from "react";
import {
  CategoryFilter,
  Button,
  ButtonStyle,
  PostQuote,
  DefaultTheme,
  // @ts-ignore
} from "@bobaboard/ui-components";
import { useThread } from "components/thread/ThreadContext";
import { THREAD_VIEW_MODES } from "types/Types";
import moment from "moment";

const ThreadSidebar: React.FC<ThreadSidebarProps> = (props) => {
  const {
    threadRoot,
    categoryFilterState,
    setCategoryFilterState,
  } = useThread();

  if (!threadRoot) {
    return <div />;
  }
  return (
    <div className="thread-sidebar">
      <div className="post-header">
        <PostQuote
          createdTime={moment.utc(threadRoot.created).fromNow()}
          text={threadRoot.content}
          secretIdentity={threadRoot.secretIdentity}
          userIdentity={threadRoot.userIdentity}
          backgroundColor={DefaultTheme.LAYOUT_BOARD_SIDEBAR_BACKGROUND_COLOR}
        />
      </div>
      <div className="views">
        <h3>View Type</h3>
        <div className="buttons">
          <Button
            theme={
              props.viewMode == THREAD_VIEW_MODES.THREAD
                ? ButtonStyle.LIGHT
                : ButtonStyle.DARK
            }
            onClick={() => props.onViewChange(THREAD_VIEW_MODES.THREAD)}
          >
            Thread
          </Button>
          <Button
            theme={
              props.viewMode == THREAD_VIEW_MODES.MASONRY
                ? ButtonStyle.LIGHT
                : ButtonStyle.DARK
            }
            onClick={() => props.onViewChange(THREAD_VIEW_MODES.MASONRY)}
          >
            Gallery
          </Button>
          <Button
            theme={
              props.viewMode == THREAD_VIEW_MODES.TIMELINE
                ? ButtonStyle.LIGHT
                : ButtonStyle.DARK
            }
            onClick={() => props.onViewChange(THREAD_VIEW_MODES.TIMELINE)}
          >
            Timeline
          </Button>
        </div>
      </div>
      {categoryFilterState.length > 1 && (
        <div className="category-filters">
          <h3>Category Filters</h3>
          {
            // TODO: re-enable this after changing logic in the various modes so it... well, works.
            false ? (
              <div>
                <CategoryFilter
                  categories={categoryFilterState}
                  onCategoryStateChangeRequest={(name: string) => {
                    setCategoryFilterState(
                      categoryFilterState.map((category) => ({
                        ...category,
                        active: category.name == name,
                      }))
                    );
                  }}
                />
                {categoryFilterState.some((category) => !category.active) && (
                  <a
                    className="clear-filters"
                    href="#"
                    onClick={() => {
                      setCategoryFilterState(
                        categoryFilterState.map((category) => ({
                          ...category,
                          active: true,
                        }))
                      );
                    }}
                  >
                    Clear filters
                  </a>
                )}
              </div>
            ) : (
              <div className="sorry">
                Sorry! Category filters are not (yet) available in this mode.
              </div>
            )
          }
        </div>
      )}
      <style jsx>{`
        .thread-sidebar {
          padding: 10px;
        }
        .post-header {
          margin-top: 20px;
          margin-bottom: 10px;
        }
        .views {
          color: white;
          margin-bottom: 10px;
        }
        .views .buttons {
          display: flex;
          justify-content: space-around;
        }
        .category-filters {
          color: white;
        }
        .sorry {
          font-style: italic;
          font-size: 16px;
          margin-top: -6px;
        }
        .clear-filters {
          color: white;
          font-size: smaller;
          display: block;
          margin-top: 5px;
          text-align: center;
        }
        /*TODO: remove this and figure out how not to load the tweets in the sidebar
          when not needed. (Tweets loaded in the sidebar will have problems with people
          clicking on them even if the sidebar is not displayed.*/
        @media screen and (max-width: 950px) {
          .thread-sidebar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ThreadSidebar;
export interface ThreadSidebarProps {
  viewMode: THREAD_VIEW_MODES;
  onViewChange: (viewType: THREAD_VIEW_MODES) => void;
}
