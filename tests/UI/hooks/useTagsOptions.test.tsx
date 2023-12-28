import {
  TagsOptions,
  useGetTagOptions,
} from "components/options/useTagsOptions";

import { TagType } from "@bobaboard/ui-components";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { renderHook } from "@testing-library/react-hooks";

const mockSetActiveCategories = vi.fn();
vi.mock("components/core/feeds/FilterableContext.tsx", () => ({
  useFilterableContext: vi.fn(() => ({
    setActiveCategories: mockSetActiveCategories,
  })),
}));

describe("useTagOptions", () => {
  describe("when a tag is of type category", () => {
    it("displays the set filter option", () => {
      const { result } = renderHook(() =>
        useGetTagOptions({ options: [TagsOptions.FILTER_BY_CATEGORY] })
      );
      expect(
        result.current?.({
          name: "a category tag",
          type: TagType.CATEGORY,
        })
      ).toEqual([
        {
          icon: faFilter,
          name: "Filter",
          link: {
            onClick: expect.any(Function),
          },
        },
      ]);
    });
    it("calls the filtering function on click", () => {
      const { result } = renderHook(() =>
        useGetTagOptions({ options: [TagsOptions.FILTER_BY_CATEGORY] })
      );
      const link = result.current?.({
        name: "a category tag",
        type: TagType.CATEGORY,
      })?.[0]["link"];
      if (!link) {
        throw new Error("Link should be present in category tag options.");
      }
      link.onClick();
      expect(mockSetActiveCategories).toHaveBeenCalledWith(["a category tag"]);
    });
  });

  describe("when a tag is of type whispertag", () => {
    it("does not displays the set filter option", () => {
      const { result } = renderHook(() =>
        useGetTagOptions({ options: [TagsOptions.FILTER_BY_CATEGORY] })
      );
      expect(
        result.current?.({
          name: "a whisper tag",
          type: TagType.WHISPER,
        })
      ).toEqual([]);
    });
  });

  describe("when a tag is of type index", () => {
    it("does not displays the set filter option", () => {
      const { result } = renderHook(() =>
        useGetTagOptions({ options: [TagsOptions.FILTER_BY_CATEGORY] })
      );
      expect(
        result.current?.({
          name: "a index tag",
          type: TagType.INDEXABLE,
        })
      ).toEqual([]);
    });
  });

  describe("when a tag is of type content notice", () => {
    it("does not displays the set filter option", () => {
      const { result } = renderHook(() =>
        useGetTagOptions({ options: [TagsOptions.FILTER_BY_CATEGORY] })
      );
      expect(
        result.current?.({
          name: "a content notice tag",
          type: TagType.CONTENT_WARNING,
        })
      ).toEqual([]);
    });
  });
});
