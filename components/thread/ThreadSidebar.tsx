import React from "react";
import {
  CategoryFilter,
  PostQuote,
  SegmentedButton,
} from "@bobaboard/ui-components";
import { useThreadContext } from "components/thread/ThreadContext";
import { THREAD_VIEW_MODES } from "components/thread/ThreadViewContext";
import moment from "moment";
import classnames from "classnames";
import { useForceHideIdentity } from "components/hooks/useForceHideIdentity";
import { DisplayManager } from "components/hooks/useDisplayMananger";

export interface ThreadSidebarProps {
  viewMode: THREAD_VIEW_MODES;
  open?: boolean;
  onViewChange: (viewType: THREAD_VIEW_MODES) => void;
  displayManager: DisplayManager;
  setActiveFilter: (filter: string | null) => void;
  activeFilters: string[] | null;
}

const ThreadSidebar: React.FC<ThreadSidebarProps> = (props) => {
  const { forceHideIdentity } = useForceHideIdentity();
  const { threadRoot, categories } = useThreadContext();
  if (!threadRoot) {
    return null;
  }
  return (
    <div className={classnames("thread-sidebar", { open: !!props.open })}>
      <div className="post-header">
        <PostQuote
          createdTime={moment.utc(threadRoot.created).fromNow()}
          text={threadRoot.content}
          secretIdentity={threadRoot.secretIdentity}
          userIdentity={threadRoot.userIdentity}
          forceHideIdentity={forceHideIdentity}
        />
      </div>
      <div className="views">
        <h3>View Type</h3>
        <div className="buttons">
          <SegmentedButton
            options={[
              {
                id: THREAD_VIEW_MODES.THREAD,
                label: "Thread",
                link: {
                  onClick: () => props.onViewChange(THREAD_VIEW_MODES.THREAD),
                },
              },
              {
                id: THREAD_VIEW_MODES.MASONRY,
                label: "Gallery",
                link: {
                  onClick: () => props.onViewChange(THREAD_VIEW_MODES.MASONRY),
                },
              },
              {
                id: THREAD_VIEW_MODES.TIMELINE,
                label: "Timeline",
                link: {
                  onClick: () => props.onViewChange(THREAD_VIEW_MODES.TIMELINE),
                },
              },
            ]}
            selected={props.viewMode}
          />
        </div>
        {/* <div>
          Showing {props.displayManager.currentModeLoadedElements.length}{" "}
          contributions of{" "}
          {props.displayManager.currentModeDisplayElements.length}
        </div> */}
      </div>
      {categories.length > 1 && (
        <div className="category-filters">
          <h3>Category Filters</h3>
          <div>
            <CategoryFilter
              categories={categories.map((category) => ({
                name: category,
                active:
                  props.activeFilters == null ||
                  props.activeFilters.includes(category),
              }))}
              onCategoryStateChangeRequest={(name) => {
                props.setActiveFilter(name);
              }}
            />
            {props.activeFilters !== null && (
              <button
                className="clear-filters"
                onClick={() => {
                  props.setActiveFilter(null);
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}
      <style jsx>{`
        .thread-sidebar {
          padding: 10px 20px;
        }
        .post-header {
          margin-top: 20px;
          margin-bottom: 10px;
          margin-right: 10px;
        }
        .views {
          color: white;
          margin-bottom: 10px;
        }
        .views .buttons {
          width: 100%;
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
          .thread-sidebar:not(.open) {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ThreadSidebar;
