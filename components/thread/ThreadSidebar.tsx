import React from "react";
import {
  CategoryFilter,
  Button,
  ButtonStyle,
  PostQuote,
  DefaultTheme,
  // @ts-ignore
} from "@bobaboard/ui-components";
import { CategoryFilterType, PostType, THREAD_VIEW_MODES } from "types/Types";
import moment from "moment";

const ThreadSidebar: React.FC<ThreadSidebarProps> = (props) => {
  const post = props.firstPost;
  return (
    <div className="thread-sidebar">
      <div className="post-header">
        <PostQuote
          createdTime={moment.utc(post.created).fromNow()}
          text={post.content}
          secretIdentity={post.secretIdentity}
          userIdentity={post.userIdentity}
          backgroundColor={DefaultTheme.LAYOUT_BOARD_SIDEBAR_BACKGROUND_COLOR}
        />
      </div>
      <div className="views">
        <h3>View Type</h3>
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
          Masonry
        </Button>
        <Button theme={ButtonStyle.DARK}>Timeline</Button>
      </div>
      {props.categoryFilters && (
        <div className="category-filters">
          <h3>Category Filters</h3>
          <CategoryFilter
            categories={props.categoryFilters}
            onCategoryStateChange={(name: string, active: boolean) => {
              props.onFiltersStatecChange(
                props.categoryFilters.map((category) =>
                  category.name == name
                    ? {
                        name,
                        active,
                      }
                    : category
                )
              );
            }}
          />
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
        .category-filters {
          color: white;
        }
      `}</style>
    </div>
  );
};

export default ThreadSidebar;
export interface ThreadSidebarProps {
  categoryFilters: CategoryFilterType[];
  firstPost: PostType;
  onFiltersStatecChange: (newState: CategoryFilterType[]) => void;
  viewMode: THREAD_VIEW_MODES;
  onViewChange: (viewType: THREAD_VIEW_MODES) => void;
}
