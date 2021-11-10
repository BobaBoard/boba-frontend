import { expect, test } from "@jest/globals";
// TODO: figure out absolute import paths
import {
  extractNewRepliesSequence,
  extractRepliesSequence,
} from "utils/thread-utils";
import { makeComment, makePost } from "../utils";

// #######################################################
// #####
// ##### NEW REPLIES SEQUENCE
// #####
// #######################################################
test("extract new replies sequence (single post)", () => {
  const repliesSequence = extractNewRepliesSequence(
    [makePost({ postId: "p1", isNew: true })],
    new Map()
  );
  expect(repliesSequence).toStrictEqual([
    expect.objectContaining({ postId: "p1" }),
  ]);
});

test("extract new replies sequence (multiple new posts)", () => {
  const repliesSequence = extractNewRepliesSequence(
    [
      makePost({ postId: "p1", isNew: true }),
      makePost({ postId: "p2", isNew: false }),
      makePost({ postId: "p3", isNew: true }),
      makePost({ postId: "p4", isNew: false }),
    ],
    new Map()
  );
  expect(repliesSequence).toStrictEqual([
    expect.objectContaining({ postId: "p1" }),
    expect.objectContaining({ postId: "p3" }),
  ]);
});

test("extract new replies sequence (all old posts)", () => {
  const repliesSequence = extractNewRepliesSequence(
    [
      makePost({ postId: "p1", isNew: false }),
      makePost({ postId: "p2", isNew: false }),
      makePost({ postId: "p3", isNew: false }),
      makePost({ postId: "p4", isNew: false }),
    ],
    new Map()
  );
  expect(repliesSequence).toStrictEqual([]);
});

test("extract new replies sequence (posts with comments)", () => {
  const repliesSequence = extractNewRepliesSequence(
    [makePost({ postId: "p1", isNew: true })],
    new Map([
      [
        "p1",
        {
          roots: [makeComment({ commentId: "c1", isNew: true })],
          parentChainMap: new Map(),
          parentChildrenMap: new Map(),
          total: 1,
          new: 1,
        },
      ],
    ])
  );
  expect(repliesSequence).toStrictEqual([
    expect.objectContaining({ postId: "p1" }),
    expect.objectContaining({ commentId: "c1" }),
  ]);
});

test("extract new replies sequence (old post with new comments)", () => {
  const repliesSequence = extractNewRepliesSequence(
    [makePost({ postId: "p1", isNew: false })],
    new Map([
      [
        "p1",
        {
          roots: [makeComment({ commentId: "c1", isNew: true })],
          parentChainMap: new Map(),
          parentChildrenMap: new Map(),
          total: 1,
          new: 1,
        },
      ],
    ])
  );
  expect(repliesSequence).toStrictEqual([
    expect.objectContaining({ commentId: "c1" }),
  ]);
});

test("extract new replies sequence (old post with staggered comment replies)", () => {
  const repliesSequence = extractNewRepliesSequence(
    [makePost({ postId: "p1", isNew: false })],
    new Map([
      [
        "p1",
        {
          roots: [
            makeComment({ commentId: "c1", isNew: true }),
            makeComment({ commentId: "c2", isNew: true }),
          ],
          parentChainMap: new Map(),
          parentChildrenMap: new Map([
            ["c1", [makeComment({ commentId: "c3", isNew: true })]],
          ]),
          total: 3,
          new: 3,
        },
      ],
    ])
  );
  expect(repliesSequence).toStrictEqual([
    expect.objectContaining({ commentId: "c1" }),
    expect.objectContaining({ commentId: "c3" }),
    expect.objectContaining({ commentId: "c2" }),
  ]);
});

test("extract new replies sequence (multiple poss with staggered comment replies)", () => {
  const repliesSequence = extractNewRepliesSequence(
    [
      makePost({ postId: "p1", isNew: true }),
      makePost({ postId: "p2", isNew: true }),
    ],
    new Map([
      [
        "p1",
        {
          roots: [
            makeComment({ commentId: "c1", isNew: true }),
            makeComment({ commentId: "c2", isNew: true }),
          ],
          parentChainMap: new Map(),
          parentChildrenMap: new Map([
            ["c2", [makeComment({ commentId: "c3", isNew: true })]],
          ]),
          total: 3,
          new: 3,
        },
      ],
      [
        "p2",
        {
          roots: [makeComment({ commentId: "c4", isNew: true })],
          parentChainMap: new Map(),
          parentChildrenMap: new Map(),
          total: 1,
          new: 1,
        },
      ],
    ])
  );
  expect(repliesSequence).toStrictEqual([
    expect.objectContaining({ postId: "p1" }),
    expect.objectContaining({ commentId: "c1" }),
    expect.objectContaining({ commentId: "c2" }),
    expect.objectContaining({ commentId: "c3" }),
    expect.objectContaining({ postId: "p2" }),
    expect.objectContaining({ commentId: "c4" }),
  ]);
});

test("extract new replies sequence (chained comments)", () => {
  const repliesSequence = extractNewRepliesSequence(
    [makePost({ postId: "p1", isNew: false })],
    new Map([
      [
        "p1",
        {
          roots: [makeComment({ commentId: "c1", isNew: false })],
          parentChainMap: new Map([
            ["c1", makeComment({ commentId: "c2", isNew: false })],
            ["c2", makeComment({ commentId: "c3", isNew: false })],
            ["c3", makeComment({ commentId: "c4", isNew: false })],
            ["c5", makeComment({ commentId: "c6", isNew: true })],
          ]),
          parentChildrenMap: new Map([
            ["c4", [makeComment({ commentId: "c5", isNew: true })]],
          ]),
          total: 5,
          new: 2,
        },
      ],
    ])
  );
  expect(repliesSequence).toStrictEqual([
    expect.objectContaining({ commentId: "c5" }),
  ]);
});

// #######################################################
// #####
// ##### REPLIES SEQUENCE
// #####
// #######################################################
test("extract replies sequence (single post)", () => {
  const repliesSequence = extractRepliesSequence(
    [makePost({ postId: "p1", isNew: true })],
    new Map()
  );
  expect(repliesSequence).toStrictEqual([
    expect.objectContaining({ postId: "p1" }),
  ]);
});

test("extract replies sequence (multiple new posts)", () => {
  const repliesSequence = extractRepliesSequence(
    [
      makePost({ postId: "p1", isNew: true }),
      makePost({ postId: "p2", isNew: false }),
      makePost({ postId: "p3", isNew: true }),
      makePost({ postId: "p4", isNew: false }),
    ],
    new Map()
  );
  expect(repliesSequence).toStrictEqual([
    expect.objectContaining({ postId: "p1" }),
    expect.objectContaining({ postId: "p2" }),
    expect.objectContaining({ postId: "p3" }),
    expect.objectContaining({ postId: "p4" }),
  ]);
});

test("extract replies sequence (all old posts)", () => {
  const repliesSequence = extractRepliesSequence(
    [
      makePost({ postId: "p1", isNew: false }),
      makePost({ postId: "p2", isNew: false }),
      makePost({ postId: "p3", isNew: false }),
      makePost({ postId: "p4", isNew: false }),
    ],
    new Map()
  );
  expect(repliesSequence).toStrictEqual([
    expect.objectContaining({ postId: "p1" }),
    expect.objectContaining({ postId: "p2" }),
    expect.objectContaining({ postId: "p3" }),
    expect.objectContaining({ postId: "p4" }),
  ]);
});

test("extract replies sequence (posts with comments)", () => {
  const repliesSequence = extractRepliesSequence(
    [makePost({ postId: "p1", isNew: true })],
    new Map([
      [
        "p1",
        {
          roots: [makeComment({ commentId: "c1", isNew: true })],
          parentChainMap: new Map(),
          parentChildrenMap: new Map(),
          total: 1,
          new: 1,
        },
      ],
    ])
  );
  expect(repliesSequence).toStrictEqual([
    expect.objectContaining({ postId: "p1" }),
    expect.objectContaining({ commentId: "c1" }),
  ]);
});

test("extract replies sequence (old post with new comments)", () => {
  const repliesSequence = extractRepliesSequence(
    [makePost({ postId: "p1", isNew: false })],
    new Map([
      [
        "p1",
        {
          roots: [makeComment({ commentId: "c1", isNew: true })],
          parentChainMap: new Map(),
          parentChildrenMap: new Map(),
          total: 1,
          new: 1,
        },
      ],
    ])
  );
  expect(repliesSequence).toStrictEqual([
    expect.objectContaining({ postId: "p1" }),
    expect.objectContaining({ commentId: "c1" }),
  ]);
});

test("extract replies sequence (old post with staggered comment replies)", () => {
  const repliesSequence = extractRepliesSequence(
    [makePost({ postId: "p1", isNew: false })],
    new Map([
      [
        "p1",
        {
          roots: [
            makeComment({ commentId: "c1", isNew: true }),
            makeComment({ commentId: "c2", isNew: true }),
          ],
          parentChainMap: new Map(),
          parentChildrenMap: new Map([
            ["c1", [makeComment({ commentId: "c3", isNew: true })]],
          ]),
          total: 3,
          new: 3,
        },
      ],
    ])
  );
  expect(repliesSequence).toStrictEqual([
    expect.objectContaining({ postId: "p1" }),
    expect.objectContaining({ commentId: "c1" }),
    expect.objectContaining({ commentId: "c3" }),
    expect.objectContaining({ commentId: "c2" }),
  ]);
});

test("extract replies sequence (multiple poss with staggered comment replies)", () => {
  const repliesSequence = extractRepliesSequence(
    [
      makePost({ postId: "p1", isNew: true }),
      makePost({ postId: "p2", isNew: false }),
    ],
    new Map([
      [
        "p1",
        {
          roots: [
            makeComment({ commentId: "c1", isNew: true }),
            makeComment({ commentId: "c2", isNew: false }),
          ],
          parentChainMap: new Map(),
          parentChildrenMap: new Map([
            ["c2", [makeComment({ commentId: "c3", isNew: true })]],
          ]),
          total: 3,
          new: 2,
        },
      ],
      [
        "p2",
        {
          roots: [makeComment({ commentId: "c4", isNew: false })],
          parentChainMap: new Map(),
          parentChildrenMap: new Map(),
          total: 1,
          new: 0,
        },
      ],
    ])
  );
  expect(repliesSequence).toStrictEqual([
    expect.objectContaining({ postId: "p1" }),
    expect.objectContaining({ commentId: "c1" }),
    expect.objectContaining({ commentId: "c2" }),
    expect.objectContaining({ commentId: "c3" }),
    expect.objectContaining({ postId: "p2" }),
    expect.objectContaining({ commentId: "c4" }),
  ]);
});

test("extract replies sequence (chained comments)", () => {
  const repliesSequence = extractRepliesSequence(
    [makePost({ postId: "p1", isNew: false })],
    new Map([
      [
        "p1",
        {
          roots: [makeComment({ commentId: "c1", isNew: false })],
          parentChainMap: new Map([
            ["c1", makeComment({ commentId: "c2", isNew: false })],
            ["c2", makeComment({ commentId: "c3", isNew: false })],
            ["c3", makeComment({ commentId: "c4", isNew: false })],
            ["c5", makeComment({ commentId: "c6", isNew: true })],
          ]),
          parentChildrenMap: new Map([
            ["c4", [makeComment({ commentId: "c5", isNew: true })]],
          ]),
          total: 5,
          new: 2,
        },
      ],
    ])
  );
  expect(repliesSequence).toStrictEqual([
    expect.objectContaining({ postId: "p1" }),
    expect.objectContaining({ commentId: "c1" }),
    expect.objectContaining({ commentId: "c5" }),
  ]);
});
