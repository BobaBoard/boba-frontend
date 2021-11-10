import { expect, test } from "@jest/globals";
import {
  findFirstLevelParent,
  findNextSibling,
  findPreviousSibling,
} from "utils/thread-utils";

import { makePost } from "../utils";

/**
 * TEST STRUCTURE
 * 1 -> 2
 *   -> 3 -> 6 -> 7
 *   -> 4      -> 8
 *   -> 5
 *
 *
 */

const POST_1 = makePost({
  postId: "1",
});
const POST_2 = makePost({
  postId: "2",
  parentPostId: "1",
});
const POST_3 = makePost({
  postId: "3",
  parentPostId: "1",
});
const POST_4 = makePost({
  postId: "4",
  parentPostId: "1",
});
const POST_5 = makePost({
  postId: "5",
  parentPostId: "1",
});
const POST_6 = makePost({
  postId: "6",
  parentPostId: "3",
});
const POST_7 = makePost({
  postId: "7",
  parentPostId: "6",
});
const POST_8 = makePost({
  postId: "8",
  parentPostId: "6",
});

const POSTS_INFO_MAP = new Map([
  [
    "1",
    {
      parent: null,
      post: POST_1,
      children: [POST_2, POST_3, POST_4, POST_5],
    },
  ],
  [
    "2",
    {
      parent: POST_1,
      post: POST_2,
      children: [],
    },
  ],
  [
    "3",
    {
      parent: POST_1,
      post: POST_3,
      children: [POST_6],
    },
  ],
  [
    "4",
    {
      parent: POST_1,
      post: POST_4,
      children: [],
    },
  ],
  [
    "5",
    {
      parent: POST_1,
      post: POST_5,
      children: [],
    },
  ],
  [
    "6",
    {
      parent: POST_3,
      post: POST_6,
      children: [POST_7, POST_8],
    },
  ],
  [
    "7",
    {
      parent: POST_6,
      post: POST_7,
      children: [],
    },
  ],
  [
    "8",
    {
      parent: POST_6,
      post: POST_8,
      children: [],
    },
  ],
]);

test("get first level post (self)", () => {
  const firstLevelParent = findFirstLevelParent(POST_2, POSTS_INFO_MAP);
  expect(firstLevelParent).toStrictEqual(POST_2);
});

test("get first level post (deep)", () => {
  const firstLevelParent = findFirstLevelParent(POST_7, POSTS_INFO_MAP);
  expect(firstLevelParent).toStrictEqual(POST_3);
});

test("find next sibling (simple)", () => {
  const sibling = findNextSibling(POST_3, POSTS_INFO_MAP);
  expect(sibling).toStrictEqual(POST_4);
});

test("find next sibling (last)", () => {
  const sibling = findNextSibling(POST_5, POSTS_INFO_MAP);
  expect(sibling).toStrictEqual(null);
});

test("find next sibling (deep)", () => {
  const sibling = findNextSibling(POST_7, POSTS_INFO_MAP);
  expect(sibling).toStrictEqual(POST_8);
});

test("find previous sibling (simple)", () => {
  const sibling = findPreviousSibling(POST_3, POSTS_INFO_MAP);
  expect(sibling).toStrictEqual(POST_2);
});

test("find previous sibling (first)", () => {
  const sibling = findPreviousSibling(POST_2, POSTS_INFO_MAP);
  expect(sibling).toStrictEqual(null);
});

test("find previous sibling (deep)", () => {
  const sibling = findPreviousSibling(POST_8, POSTS_INFO_MAP);
  expect(sibling).toStrictEqual(POST_7);
});
