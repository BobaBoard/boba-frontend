import React from "react";
import {
  CategoryFilter,
  PostQuote,
  SegmentedButton,
} from "@bobaboard/ui-components";
import {
  ThreadContextType,
  withThreadData,
} from "components/thread/ThreadContext";
import { THREAD_VIEW_MODES } from "components/thread/useThreadView";
import moment from "moment";
import classnames from "classnames";
import { useForceHideIdentity } from "components/hooks/useForceHideIdentity";

const ThreadSidebar: React.FC<ThreadSidebarProps> = ({
  threadRoot,
  categoryFilterState,
  setCategoryFilterState,
  ...props
}) => {
  const { forceHideIdentity } = useForceHideIdentity();
  if (!threadRoot) {
    return <div />;
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
                onClick: () => props.onViewChange(THREAD_VIEW_MODES.THREAD),
              },
              {
                id: THREAD_VIEW_MODES.MASONRY,
                label: "Gallery",
                onClick: () => props.onViewChange(THREAD_VIEW_MODES.MASONRY),
              },
              {
                id: THREAD_VIEW_MODES.TIMELINE,
                label: "Timeline",
                onClick: () => props.onViewChange(THREAD_VIEW_MODES.TIMELINE),
              },
            ]}
            selected={props.viewMode}
          />
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

export default withThreadData(ThreadSidebar);
export interface ThreadSidebarProps extends ThreadContextType {
  viewMode: THREAD_VIEW_MODES;
  open?: boolean;
  onViewChange: (viewType: THREAD_VIEW_MODES) => void;
}
