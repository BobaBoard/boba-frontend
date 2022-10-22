import { Client, getThreadRequestPromise, getThreadRouter } from "../utils";
import {
  TagsOptions,
  useGetTagOptions,
} from "components/options/useTagsOptions";
import { act, renderHook } from "@testing-library/react-hooks";
import { animationFrame, requestIdleCallback } from "@shopify/jest-dom-mocks";

import { DropdownProps } from "@bobaboard/ui-components/dist/common/DropdownListMenu";
import { FAVORITE_CHARACTER_TO_MAIM_THREAD } from "../../server-mocks/data/thread";
import React from "react";
import { TagType } from "@bobaboard/ui-components";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

const mockSetActiveFilter = jest.fn();
jest.mock("contexts/ThreadViewContext.tsx", () => ({
  useThreadViewContext: jest.fn(() => ({
    setActiveFilter: mockSetActiveFilter,
  })),
}));

// const getThreadContextWrapper = (threadId: string) => {
//   // TODO: maybe remove board slug and board id
//   return function ContextWrapper({ children }: { children: React.ReactNode }) {
//     return (
//       <Client
//         router={getThreadRouter({
//           boardSlug: "gore",
//           threadId,
//         })}
//       >
//         <ThreadContextProvider boardId="gore" postId={null} threadId={threadId}>
//           {children}
//         </ThreadContextProvider>
//       </Client>
//     );
//   };
// };

// beforeAll(() => {
//   jest.useFakeTimers();
// });

// beforeEach(() => {
//   requestIdleCallback.mock();
//   animationFrame.mock();
// });

// afterEach(() => {
//   requestIdleCallback.restore();
//   animationFrame.restore();
//   jest.clearAllTimers();
// });

// afterAll(() => {
//   jest.useRealTimers();
// });

describe("useTagOptions", () => {
  describe("when a tag is of type category", () => {
    let categoryTagOptions: DropdownProps["options"];
    beforeEach(() => {
      const { result } = renderHook(() =>
        useGetTagOptions({ options: [TagsOptions.FILTER_BY_CATEGORY] })
      );
      categoryTagOptions = result.current?.({
        name: "a category tag",
        type: TagType.CATEGORY,
      });
    });
    it("displays the set filter option", () => {
      expect(categoryTagOptions).toEqual([
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
      const link = categoryTagOptions?.[0]["link"];
      if (!link) {
        throw new Error("Link should be present in category tag options.");
      }
      link.onClick();
      expect(mockSetActiveFilter).toHaveBeenCalledWith("a category tag");
    });
  });

  describe("when a tag is of type whispertag", () => {
    let whisperTagOptions: DropdownProps["options"];
    beforeEach(() => {
      const { result } = renderHook(() =>
        useGetTagOptions({ options: [TagsOptions.FILTER_BY_CATEGORY] })
      );
      whisperTagOptions = result.current?.({
        name: "a whisper tag",
        type: TagType.WHISPER,
      });
    });
    it("does not displays the set filter option", () => {
      expect(whisperTagOptions).toEqual([]);
    });
  });

  describe("when a tag is of type index", () => {
    let indexTagOptions: DropdownProps["options"];
    beforeEach(() => {
      const { result } = renderHook(() =>
        useGetTagOptions({ options: [TagsOptions.FILTER_BY_CATEGORY] })
      );
      indexTagOptions = result.current?.({
        name: "a index tag",
        type: TagType.INDEXABLE,
      });
    });
    it("does not displays the set filter option", () => {
      expect(indexTagOptions).toEqual([]);
    });
  });

  describe("when a tag is of type content notice", () => {
    let contentNoticeTagOptions: DropdownProps["options"];
    beforeEach(() => {
      const { result } = renderHook(() =>
        useGetTagOptions({ options: [TagsOptions.FILTER_BY_CATEGORY] })
      );
      contentNoticeTagOptions = result.current?.({
        name: "a content notice tag",
        type: TagType.CONTENT_WARNING,
      });
    });
    it("does not displays the set filter option", () => {
      expect(contentNoticeTagOptions).toEqual([]);
    });
  });
});
