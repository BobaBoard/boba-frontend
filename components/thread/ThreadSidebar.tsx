import React from "react";
import {
  TagsFilterSection,
  PostQuote,
  SegmentedButton,
  TagType,
} from "@bobaboard/ui-components";
import { useThreadContext } from "components/thread/ThreadContext";
import {
  THREAD_VIEW_MODES,
  useThreadViewContext,
} from "components/thread/ThreadViewContext";
import moment from "moment";
import classnames from "classnames";
import { useForceHideIdentity } from "components/hooks/useForceHideIdentity";
import { DisplayManager } from "components/hooks/useDisplayMananger";
import { UNCATEGORIZED_LABEL } from "utils/thread-utils";

export interface ThreadSidebarProps {
  viewMode: THREAD_VIEW_MODES;
  open?: boolean;
  onViewChange: (viewType: THREAD_VIEW_MODES) => void;
  displayManager: DisplayManager;
}

const ThreadSidebar: React.FC<ThreadSidebarProps> = (props) => {
  const { forceHideIdentity } = useForceHideIdentity();
  const { threadRoot, categories, contentNotices } = useThreadContext();
  const {
    setActiveFilter,
    activeFilters,
    setExcludedNotices,
    excludedNotices,
  } = useThreadViewContext();
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
      {contentNotices.length >= 1 && (
        <div className="category-filters">
          <TagsFilterSection
            title={"Content Notices"}
            tags={contentNotices.map((notice) => ({
              name: notice,
              active:
                excludedNotices == null || !excludedNotices.includes(notice),
            }))}
            onTagsStateChangeRequest={(notice) => {
              if (excludedNotices?.includes(notice)) {
                const newNotices = excludedNotices.filter(
                  (existingNotice) => existingNotice != notice
                );
                setExcludedNotices(newNotices.length > 0 ? newNotices : null);
                return;
              }
              setExcludedNotices(
                excludedNotices ? [...excludedNotices, notice] : [notice]
              );
            }}
            onClearFilterRequests={() => {
              setExcludedNotices(null);
            }}
            type={TagType.CONTENT_WARNING}
          />
        </div>
      )}
      {categories.length >= 1 && (
        <div className="category-filters">
          <TagsFilterSection
            title={"Category Filters"}
            tags={categories.map((category) => ({
              name: category,
              active: activeFilters == null || activeFilters.includes(category),
            }))}
            onTagsStateChangeRequest={(name) => {
              setActiveFilter(name);
            }}
            onClearFilterRequests={() => {
              setActiveFilter(null);
            }}
            uncategorized={
              activeFilters == null ||
              activeFilters.includes(UNCATEGORIZED_LABEL)
            }
            onUncategorizedStateChangeRequest={() => {
              setActiveFilter(UNCATEGORIZED_LABEL);
            }}
            type={TagType.CATEGORY}
          />
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
          margin-top: 15px;
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
