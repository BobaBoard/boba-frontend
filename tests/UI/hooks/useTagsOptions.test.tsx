import { Client, getThreadRequestPromise, getThreadRouter } from "../utils";
import {
  TagsOptions,
  useGetTagOptions,
} from "components/options/useTagsOptions";
import { act, renderHook } from "@testing-library/react-hooks";
import { animationFrame, requestIdleCallback } from "@shopify/jest-dom-mocks";

import { FAVORITE_CHARACTER_TO_MAIM_THREAD } from "../../server-mocks/data/thread";
import React from "react";
import { TagType } from "@bobaboard/ui-components";

jest.mock("contexts/ThreadViewContext.tsx");

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
  describe("when tag is of type category", async () => {
    let getTagOptions: ReturnType<typeof useGetTagOptions>;
    beforeEach(() => {
      const { result } = renderHook(() =>
        useGetTagOptions({ options: [TagsOptions.FILTER_BY_CATEGORY] })
      );
      getTagOptions = result.current;
    });
    it("displays the set filter option", () => {
      expect(
        getTagOptions?.({
          name: "a category",
          type: TagType.CATEGORY,
        })
      ).toBe(5);
    });

    // await act(() => threadFetched as Promise<void>);
    // expect(result.current.hasMore()).toBe(false);
    // expect(
    //   result.current.currentModeLoadedElements.map((post) => post.postId)
    // ).toEqual([
    //   "11b85dac-e122-40e0-b09a-8829c5e0250e",
    //   "619adf62-833f-4bea-b591-03e807338a8e",
    //   "b95bb260-eae0-456c-a5d0-8ae9e52608d8",
    // ]);
  });
});
