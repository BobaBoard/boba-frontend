import { BoardOptions, useBoardOptions } from "../hooks/useBoardOptions";
import {
  BoardSidebar as LibraryBoardSidebar,
  TagType,
} from "@bobaboard/ui-components";

import { BoardMetadata } from "types/Types";
import LoadingSpinner from "../LoadingSpinner";
import React from "react";
import { useUpdateBoardMetadata } from "lib/api/hooks/board";

interface BoardSidebarProps {
  boardMetadata: BoardMetadata | null | undefined;
  pageSlug: string;
  loading: boolean;
  activeCategory: string | null;
  onCategoriesStateChange: (
    categories: {
      name: string;
      active: boolean;
    }[]
  ) => void;
}

const TagsFilterSection = LibraryBoardSidebar.TagsFilterSection;
const TextSection = LibraryBoardSidebar.TextSection;

export const BoardSidebar: React.FC<BoardSidebarProps> = ({
  loading,
  boardMetadata,
  pageSlug,
  activeCategory,
  onCategoriesStateChange,
}) => {
  const [editingSidebar, setEditingSidebar] = React.useState(false);
  const boardOptions = useBoardOptions({
    options: [
      BoardOptions.MUTE,
      BoardOptions.PIN,
      BoardOptions.DISMISS_NOTIFICATIONS,
      BoardOptions.EDIT,
    ],
    boardId: boardMetadata?.id || null,
    callbacks: {
      editSidebar: setEditingSidebar,
    },
  });
  const updateBoardMetadata = useUpdateBoardMetadata();
  const stopEditing = React.useCallback(() => setEditingSidebar(false), []);

  return (
    <div style={{ position: "relative" }}>
      <LibraryBoardSidebar
        slug={boardMetadata?.slug || pageSlug}
        avatarUrl={boardMetadata?.avatarUrl || "/"}
        tagline={boardMetadata?.tagline || "loading..."}
        accentColor={boardMetadata?.accentColor || "#f96680"}
        muted={boardMetadata?.muted}
        previewOptions={boardOptions}
        descriptions={boardMetadata?.descriptions || []}
        editing={editingSidebar}
        onCancelEditing={stopEditing}
        onUpdateMetadata={(metadata) => {
          updateBoardMetadata({
            ...metadata,
            boardId: boardMetadata!.id,
          });
          setEditingSidebar(false);
        }}
        activeCategory={activeCategory}
        onCategoriesStateChange={onCategoriesStateChange}
      >
        {boardMetadata?.descriptions.map((description) => (
          <LibraryBoardSidebar.SidebarSection
            key={description.id}
            id={description.id}
            index={description.index}
            title={description.title}
          >
            {description.type == "text" ? (
              <TextSection description={description.description} />
            ) : (
              <TagsFilterSection
                tags={description.categories?.map((category) => ({
                  name: category,
                  state:
                    activeCategory == null || category == activeCategory
                      ? TagsFilterSection.FilteredTagsState.ACTIVE
                      : TagsFilterSection.FilteredTagsState.DISABLED,
                }))}
                type={TagType.CATEGORY}
                onClearFilterRequests={() =>
                  onCategoriesStateChange(
                    description.categories.map((category) => ({
                      name: category,
                      active: true,
                    }))
                  )
                }
                onTagsStateChangeRequest={(changedCategoryName) => {
                  onCategoriesStateChange(
                    description.categories.map((category) => ({
                      name: changedCategoryName,
                      active: category == changedCategoryName,
                    }))
                  );
                }}
              />
            )}
          </LibraryBoardSidebar.SidebarSection>
        ))}
      </LibraryBoardSidebar>
      {!loading && !boardMetadata?.descriptions.length && !editingSidebar && (
        <img
          className="under-construction"
          src="/under_construction_icon.png"
        />
      )}
      {loading && <LoadingSpinner loading={loading} />}
      <style jsx>{`
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
};
