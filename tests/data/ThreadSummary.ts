import {
  FAVORITE_CHARACTER_CONTRIBUTION,
  FAVORITE_MURDER_CONTRIBUTION,
  REMEMBER_TO_BE_EXCELLENT_CONTRIBUTION,
  STUFF_WILL_BE_INSERTED_CONTRIBUTION,
} from "./Contribution";

import { GORE_BOARD_ID } from "./BoardSummary";
import { ThreadSummaryType } from "types/Types";

export const REMEMBER_TO_BE_EXCELLENT_GORE_THREAD_SUMMARY: ThreadSummaryType = {
  id: "8b2646af-2778-487e-8e44-7ae530c2549c",
  parentBoardSlug: "gore",
  parentBoardId: GORE_BOARD_ID,
  starter: REMEMBER_TO_BE_EXCELLENT_CONTRIBUTION,
  defaultView: "thread",
  new: false,
  muted: false,
  hidden: false,
  newPostsAmount: 0,
  newCommentsAmount: 0,
  totalPostsAmount: 1,
  totalCommentsAmount: 2,
  directThreadsAmount: 0,
  lastActivityAt: "2020-10-04T05:44:00.00Z",
};

export const FAVORITE_CHARACTER_GORE_THREAD_SUMMARY: ThreadSummaryType = {
  id: "29d1b2da-3289-454a-9089-2ed47db4967b",
  parentBoardSlug: "gore",
  parentBoardId: GORE_BOARD_ID,
  starter: FAVORITE_CHARACTER_CONTRIBUTION,
  defaultView: "thread",
  new: false,
  muted: false,
  hidden: false,
  newPostsAmount: 0,
  newCommentsAmount: 0,
  totalPostsAmount: 3,
  totalCommentsAmount: 2,
  directThreadsAmount: 2,
  lastActivityAt: "2020-05-23T05:52:00.00Z",
};

export const FAVORITE_MURDER_GORE_THREAD_SUMMARY: ThreadSummaryType = {
  id: "a5c903df-35e8-43b2-a41a-208c43154671",
  parentBoardSlug: "gore",
  parentBoardId: GORE_BOARD_ID,
  starter: FAVORITE_MURDER_CONTRIBUTION,
  defaultView: "thread",
  new: false,
  muted: false,
  hidden: false,
  newPostsAmount: 0,
  newCommentsAmount: 0,
  totalPostsAmount: 3,
  totalCommentsAmount: 0,
  directThreadsAmount: 2,
  lastActivityAt: "2020-05-03T09:47:00.00Z",
};

export const STUFF_WILL_BE_INSERTED_ANIME: ThreadSummaryType = {
  id: "b27710a8-0a9f-4c09-b3a5-54668bab7051",
  parentBoardSlug: "anime",
  parentBoardId: GORE_BOARD_ID,
  starter: STUFF_WILL_BE_INSERTED_CONTRIBUTION,
  defaultView: "thread",
  new: false,
  muted: false,
  hidden: false,
  newPostsAmount: 0,
  newCommentsAmount: 0,
  totalPostsAmount: 1,
  totalCommentsAmount: 2,
  directThreadsAmount: 0,
  lastActivityAt: "2020-04-24T05:44:00.00Z",
};
