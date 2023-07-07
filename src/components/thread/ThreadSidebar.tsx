import {
  PostQuote,
  SegmentedButton,
  SidebarSection,
  TagType,
  TagsFilterSection,
} from "@bobaboard/ui-components";
import { ThreadPageDetails, usePageDetails } from 'utils/router-utils';

import { DisplayManager } from "components/hooks/useDisplayMananger";
import React from "react";
import { THREAD_VIEW_MODE } from "contexts/ThreadViewContext";
import { UNCATEGORIZED_LABEL } from "utils/thread-utils";
import classnames from "classnames";
import { formatDistanceToNow } from "date-fns";
import { useCachedLinks } from 'components/hooks/useCachedLinks';
import { useFilterableContext } from "components/core/feeds/FilterableContext";
import { useForceHideIdentity } from "components/hooks/useForceHideIdentity";
import { useThreadContext } from "components/thread/ThreadContext";

export interface ThreadSidebarProps {
  viewMode: THREAD_VIEW_MODE;
  open?: boolean;
  onViewChange: (viewType: THREAD_VIEW_MODE) => void;
  displayManager: DisplayManager;
}

const ThreadSidebar: React.FC<ThreadSidebarProps> = (props) => {
  const { forceHideIdentity } = useForceHideIdentity();
  const { threadRoot, categories, contentNotices } = useThreadContext();
  const { getLinkToThread } = useCachedLinks();

  const {threadId, slug} = usePageDetails<ThreadPageDetails>();

  const linkToThread = getLinkToThread({
    slug,
    threadId,
    view: "thread"
  }).href;
  const linkToGallery = getLinkToThread({
    slug,
    threadId,
    view: "gallery"
  }).href;
const linkToTimeline = getLinkToThread({
    slug,
    threadId,
    view: "timeline"
  }).href;
 
  const {
    activeCategories,
    setActiveCategories,
    filteredNotices,
    setFilteredNotices,
  } = useFilterableContext();
  if (!threadRoot) {
    return null;
  }
  return (
    <div className={classnames("thread-sidebar", { open: !!props.open })}>
      <div className="post-header">
        <PostQuote
          createdTime={formatDistanceToNow(new Date(threadRoot.created), {
            addSuffix: true,
          })}
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
                id: THREAD_VIEW_MODE.THREAD,
                label: "Thread",
                link: {
                  onClick: () => props.onViewChange(THREAD_VIEW_MODE.THREAD),
                  href: `${linkToThread}`
                },
              },
              {
                id: THREAD_VIEW_MODE.MASONRY,
                label: "Gallery",
                link: {
                  onClick: () => props.onViewChange(THREAD_VIEW_MODE.MASONRY),
                  href: `${linkToGallery}`
                },
              },
              {
                id: THREAD_VIEW_MODE.TIMELINE,
                label: "Timeline",
                link: {
                  onClick: () => props.onViewChange(THREAD_VIEW_MODE.TIMELINE),
                  href: `${linkToTimeline}`
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
          <SidebarSection id="1" index={0} title="Content Notices">
            <TagsFilterSection
              tags={contentNotices.map((notice) => ({
                name: notice,
                state:
                  !filteredNotices.length || !filteredNotices.includes(notice)
                    ? TagsFilterSection.FilteredTagsState.ACTIVE
                    : TagsFilterSection.FilteredTagsState.DISABLED,
              }))}
              onTagsStateChangeRequest={(notice) => {
                if (filteredNotices?.includes(notice)) {
                  const newNotices = filteredNotices.filter(
                    (existingNotice) => existingNotice != notice
                  );
                  setFilteredNotices(newNotices);
                  return;
                }
                setFilteredNotices(
                  filteredNotices ? [...filteredNotices, notice] : [notice]
                );
              }}
              onClearFilterRequests={() => {
                setFilteredNotices([]);
              }}
              type={TagType.CONTENT_WARNING}
            />
          </SidebarSection>
        </div>
      )}
      {categories.length >= 1 && (
        <div className="category-filters">
          <SidebarSection id="1" index={0} title="Category Filter">
            <TagsFilterSection
              tags={categories.map((category) => ({
                name: category,
                state:
                  !activeCategories.length ||
                  activeCategories.includes(category)
                    ? TagsFilterSection.FilteredTagsState.ACTIVE
                    : TagsFilterSection.FilteredTagsState.DISABLED,
              }))}
              onTagsStateChangeRequest={(name) => {
                setActiveCategories([name]);
              }}
              onClearFilterRequests={() => {
                setActiveCategories([]);
              }}
              uncategorized={
                !activeCategories.length ||
                activeCategories.includes(UNCATEGORIZED_LABEL)
                  ? TagsFilterSection.FilteredTagsState.ACTIVE
                  : TagsFilterSection.FilteredTagsState.DISABLED
              }
              onUncategorizedStateChangeRequest={() => {
                setActiveCategories([UNCATEGORIZED_LABEL]);
              }}
              type={TagType.CATEGORY}
            />
          </SidebarSection>
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

        .category-filters {
          color: white;
          margin-top: 15px;
        }
        h3 {
          font-weight: bold;
          font-size: var(--font-size-regular);
          margin-top: 20px;
          display: flex;
          -webkit-box-align: baseline;
          align-items: baseline;
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
