// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import assert from 'node:assert/strict';
import { RedBlackTree } from './red_black_tree.ts';
import { ascend, descend } from './comparators.ts';
import { type Container, MyMath } from './_test_utils.ts';

test('RedBlackTree throws if compare is not a function', () => {
  assert.throws(
    () => new RedBlackTree({} as (a: number, b: number) => number),
    {
      name: 'TypeError',
      message:
        "Cannot construct a RedBlackTree: the 'compare' parameter is not a function, did you mean to call RedBlackTree.from?",
    },
  );
});

test('RedBlackTree works as expected with default ascend comparator', () => {
  const trees = [new RedBlackTree(), new RedBlackTree()] as const;
  const values: number[] = [-10, 9, -1, 100, 1, 0, -100, 10, -9];

  const expectedMin: number[][] = [
    [-10, -10, -10, -10, -10, -10, -100, -100, -100],
    [-9, -9, -100, -100, -100, -100, -100, -100, -100],
  ];
  const expectedMax: number[][] = [
    [-10, 9, 9, 100, 100, 100, 100, 100, 100],
    [-9, 10, 10, 10, 10, 100, 100, 100, 100],
  ];
  for (const [i, tree] of trees.entries()) {
    assert.deepStrictEqual(tree.size, 0);
    assert.deepStrictEqual(tree.isEmpty(), true);
    for (const [j, value] of values.entries()) {
      assert.deepStrictEqual(tree.find(value), null);
      assert.deepStrictEqual(tree.insert(value), true);
      assert.deepStrictEqual(tree.find(value), value);
      assert.deepStrictEqual(tree.size, j + 1);
      assert.deepStrictEqual(tree.isEmpty(), false);
      assert.deepStrictEqual(tree.min(), expectedMin?.[i]?.[j]);
      assert.deepStrictEqual(tree.max(), expectedMax?.[i]?.[j]);
    }
    for (const value of values) {
      assert.deepStrictEqual(tree.insert(value), false);
      assert.deepStrictEqual(tree.size, values.length);
      assert.deepStrictEqual(tree.isEmpty(), false);
      assert.deepStrictEqual(tree.min(), -100);
      assert.deepStrictEqual(tree.max(), 100);
    }
    values.reverse();
  }

  for (const tree of trees) {
    assert.deepStrictEqual(
      [...tree.lnrValues()],
      [-100, -10, -9, -1, 0, 1, 9, 10, 100],
    );
    assert.deepStrictEqual(tree.size, values.length);
    assert.deepStrictEqual(tree.isEmpty(), false);

    assert.deepStrictEqual([...tree], [-100, -10, -9, -1, 0, 1, 9, 10, 100]);
    assert.deepStrictEqual(tree.size, values.length);
    assert.deepStrictEqual(tree.isEmpty(), false);

    assert.deepStrictEqual(
      [...tree.rnlValues()],
      [100, 10, 9, 1, 0, -1, -9, -10, -100],
    );
    assert.deepStrictEqual(tree.size, values.length);
    assert.deepStrictEqual(tree.isEmpty(), false);
  }

  assert.deepStrictEqual(
    [...trees[0].nlrValues()],
    [-1, -10, -100, -9, 9, 1, 0, 100, 10],
  );
  assert.deepStrictEqual(
    [...trees[1].nlrValues()],
    [-9, -100, -10, 1, 0, -1, 10, 9, 100],
  );
  for (const tree of trees) {
    assert.deepStrictEqual(tree.size, values.length);
    assert.deepStrictEqual(tree.isEmpty(), false);
  }

  assert.deepStrictEqual(
    [...trees[0].lrnValues()],
    [-100, -9, -10, 0, 1, 10, 100, 9, -1],
  );
  assert.deepStrictEqual(
    [...trees[1].lrnValues()],
    [-10, -100, -1, 0, 9, 100, 10, 1, -9],
  );
  for (const tree of trees) {
    assert.deepStrictEqual(tree.size, values.length);
    assert.deepStrictEqual(tree.isEmpty(), false);
  }

  assert.deepStrictEqual(
    [...trees[0].lvlValues()],
    [-1, -10, 9, -100, -9, 1, 100, 0, 10],
  );
  assert.deepStrictEqual(
    [...trees[1].lvlValues()],
    [-9, -100, 1, -10, 0, 10, -1, 9, 100],
  );
  for (const tree of trees) {
    assert.deepStrictEqual(tree.size, values.length);
    assert.deepStrictEqual(tree.isEmpty(), false);
  }

  for (const tree of trees) {
    const expected: number[] = [-100, -10, -9, -1, 0, 1, 9, 10, 100];
    for (const [j, value] of values.entries()) {
      assert.deepStrictEqual(tree.size, values.length - j);
      assert.deepStrictEqual(tree.isEmpty(), false);
      assert.deepStrictEqual(tree.find(value), value);

      assert.deepStrictEqual(tree.remove(value), true);
      expected.splice(expected.indexOf(value), 1);
      assert.deepStrictEqual([...tree], expected);
      assert.deepStrictEqual(tree.find(value), null);

      assert.deepStrictEqual(tree.remove(value), false);
      assert.deepStrictEqual([...tree], expected);
      assert.deepStrictEqual(tree.find(value), null);
    }
    assert.deepStrictEqual(tree.size, 0);
    assert.deepStrictEqual(tree.isEmpty(), true);
  }
});

test('RedBlackTree works as exepcted with descend comparator', () => {
  const trees = [new RedBlackTree(descend), new RedBlackTree(descend)] as const;
  const values: number[] = [-10, 9, -1, 100, 1, 0, -100, 10, -9];

  const expectedMin: number[][] = [
    [-10, 9, 9, 100, 100, 100, 100, 100, 100],
    [-9, 10, 10, 10, 10, 100, 100, 100, 100, 100],
  ];
  const expectedMax: number[][] = [
    [-10, -10, -10, -10, -10, -10, -100, -100, -100],
    [-9, -9, -100, -100, -100, -100, -100, -100, -100],
  ];
  for (const [i, tree] of trees.entries()) {
    assert.deepStrictEqual(tree.size, 0);
    assert.deepStrictEqual(tree.isEmpty(), true);
    for (const [j, value] of values.entries()) {
      assert.deepStrictEqual(tree.find(value), null);
      assert.deepStrictEqual(tree.insert(value), true);
      assert.deepStrictEqual(tree.find(value), value);
      assert.deepStrictEqual(tree.size, j + 1);
      assert.deepStrictEqual(tree.isEmpty(), false);
      assert.deepStrictEqual(tree.min(), expectedMin?.[i]?.[j]);
      assert.deepStrictEqual(tree.max(), expectedMax?.[i]?.[j]);
    }
    for (const value of values) {
      assert.deepStrictEqual(tree.insert(value), false);
      assert.deepStrictEqual(tree.size, values.length);
      assert.deepStrictEqual(tree.isEmpty(), false);
      assert.deepStrictEqual(tree.min(), 100);
      assert.deepStrictEqual(tree.max(), -100);
    }
    values.reverse();
  }

  for (const tree of trees) {
    assert.deepStrictEqual(
      [...tree.lnrValues()],
      [100, 10, 9, 1, 0, -1, -9, -10, -100],
    );
    assert.deepStrictEqual(tree.size, values.length);
    assert.deepStrictEqual(tree.isEmpty(), false);

    assert.deepStrictEqual([...tree], [100, 10, 9, 1, 0, -1, -9, -10, -100]);
    assert.deepStrictEqual(tree.size, values.length);
    assert.deepStrictEqual(tree.isEmpty(), false);

    assert.deepStrictEqual(
      [...tree.rnlValues()],
      [-100, -10, -9, -1, 0, 1, 9, 10, 100],
    );
    assert.deepStrictEqual(tree.size, values.length);
    assert.deepStrictEqual(tree.isEmpty(), false);
  }

  assert.deepStrictEqual(
    [...trees[0].nlrValues()],
    [-1, 9, 100, 10, 1, 0, -10, -9, -100],
  );
  assert.deepStrictEqual(
    [...trees[1].nlrValues()],
    [-9, 1, 10, 100, 9, 0, -1, -100, -10],
  );
  for (const tree of trees) {
    assert.deepStrictEqual(tree.size, values.length);
    assert.deepStrictEqual(tree.isEmpty(), false);
  }

  assert.deepStrictEqual(
    [...trees[0].lrnValues()],
    [10, 100, 0, 1, 9, -9, -100, -10, -1],
  );
  assert.deepStrictEqual(
    [...trees[1].lrnValues()],
    [100, 9, 10, -1, 0, 1, -10, -100, -9],
  );
  for (const tree of trees) {
    assert.deepStrictEqual(tree.size, values.length);
    assert.deepStrictEqual(tree.isEmpty(), false);
  }

  assert.deepStrictEqual(
    [...trees[0].lvlValues()],
    [-1, 9, -10, 100, 1, -9, -100, 10, 0],
  );
  assert.deepStrictEqual(
    [...trees[1].lvlValues()],
    [-9, 1, -100, 10, 0, -10, 100, 9, -1],
  );
  for (const tree of trees) {
    assert.deepStrictEqual(tree.size, values.length);
    assert.deepStrictEqual(tree.isEmpty(), false);
  }

  for (const tree of trees) {
    const expected: number[] = [100, 10, 9, 1, 0, -1, -9, -10, -100];
    for (const [j, value] of values.entries()) {
      assert.deepStrictEqual(tree.size, values.length - j);
      assert.deepStrictEqual(tree.isEmpty(), false);
      assert.deepStrictEqual(tree.find(value), value);

      assert.deepStrictEqual(tree.remove(value), true);
      expected.splice(expected.indexOf(value), 1);
      assert.deepStrictEqual([...tree], expected);
      assert.deepStrictEqual(tree.find(value), null);

      assert.deepStrictEqual(tree.remove(value), false);
      assert.deepStrictEqual([...tree], expected);
      assert.deepStrictEqual(tree.find(value), null);
    }
    assert.deepStrictEqual(tree.size, 0);
    assert.deepStrictEqual(tree.isEmpty(), true);
  }
});

test('RedBlackTree works with object items', () => {
  const tree: RedBlackTree<Container> = new RedBlackTree(
    (a: Container, b: Container) => ascend(a.id, b.id),
  );
  const ids: number[] = [-10, 9, -1, 100, 1, 0, -100, 10, -9];

  for (const [i, id] of ids.entries()) {
    const newContainer: Container = { id, values: [] };
    assert.deepStrictEqual(tree.find(newContainer), null);
    assert.deepStrictEqual(tree.insert(newContainer), true);
    newContainer.values.push(i - 1, i, i + 1);
    assert.strictEqual(tree.find({ id, values: [] }), newContainer);
    assert.deepStrictEqual(tree.size, i + 1);
    assert.deepStrictEqual(tree.isEmpty(), false);
  }
  for (const [i, id] of ids.entries()) {
    const newContainer: Container = { id, values: [] };
    assert.deepStrictEqual(tree.find({ id } as Container), {
      id,
      values: [i - 1, i, i + 1],
    });
    assert.deepStrictEqual(tree.insert(newContainer), false);
    assert.deepStrictEqual(tree.find({ id, values: [] }), {
      id,
      values: [i - 1, i, i + 1],
    });
    assert.deepStrictEqual(tree.size, ids.length);
    assert.deepStrictEqual(tree.isEmpty(), false);
  }

  assert.deepStrictEqual(
    [...tree].map((container) => container.id),
    [-100, -10, -9, -1, 0, 1, 9, 10, 100],
  );
  assert.deepStrictEqual(tree.size, ids.length);
  assert.deepStrictEqual(tree.isEmpty(), false);

  const expected: number[] = [-100, -10, -9, -1, 0, 1, 9, 10, 100];
  for (const [i, id] of ids.entries()) {
    assert.deepStrictEqual(tree.size, ids.length - i);
    assert.deepStrictEqual(tree.isEmpty(), false);
    assert.deepStrictEqual(tree.find({ id, values: [] }), {
      id,
      values: [i - 1, i, i + 1],
    });

    assert.deepStrictEqual(tree.remove({ id, values: [] }), true);
    expected.splice(expected.indexOf(id), 1);
    assert.deepStrictEqual(
      [...tree].map((container) => container.id),
      expected,
    );
    assert.deepStrictEqual(tree.find({ id, values: [] }), null);

    assert.deepStrictEqual(tree.remove({ id, values: [] }), false);
    assert.deepStrictEqual(
      [...tree].map((container) => container.id),
      expected,
    );
    assert.deepStrictEqual(tree.find({ id, values: [] }), null);
  }
  assert.deepStrictEqual(tree.size, 0);
  assert.deepStrictEqual(tree.isEmpty(), true);
});

test('RedBlackTree.from() handles Iterable', () => {
  const values: number[] = [-10, 9, -1, 100, 9, 1, 0, 9, -100, 10, -9];
  const originalValues: number[] = Array.from(values);
  const expected: number[] = [-100, -10, -9, -1, 0, 1, 9, 10, 100];
  let tree: RedBlackTree<number> = RedBlackTree.from(values);
  assert.deepStrictEqual(values, originalValues);
  assert.deepStrictEqual([...tree], expected);
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [-1, -10, -100, -9, 9, 1, 0, 100, 10],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [-1, -10, 9, -100, -9, 1, 100, 0, 10],
  );

  tree = RedBlackTree.from(values, { compare: descend });
  assert.deepStrictEqual(values, originalValues);
  assert.deepStrictEqual([...tree].reverse(), expected);
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [-1, 9, 100, 10, 1, 0, -10, -9, -100],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [-1, 9, -10, 100, 1, -9, -100, 10, 0],
  );

  tree = RedBlackTree.from(values, {
    map: (v: number) => 2 * v,
  });
  assert.deepStrictEqual(
    [...tree],
    expected.map((v: number) => 2 * v),
  );
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [-2, -20, -200, -18, 18, 2, 0, 200, 20],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [-2, -20, 18, -200, -18, 2, 200, 0, 20],
  );

  const math = new MyMath();
  tree = RedBlackTree.from(values, {
    map: function (this: MyMath, v: number) {
      return this.multiply(3, v);
    },
    thisArg: math,
  });
  assert.deepStrictEqual(values, originalValues);
  assert.deepStrictEqual(
    [...tree],
    expected.map((v: number) => 3 * v),
  );
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [-3, -30, -300, -27, 27, 3, 0, 300, 30],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [-3, -30, 27, -300, -27, 3, 300, 0, 30],
  );

  tree = RedBlackTree.from(values, {
    compare: descend,
    map: (v: number) => 2 * v,
  });
  assert.deepStrictEqual(values, originalValues);
  assert.deepStrictEqual(
    [...tree].reverse(),
    expected.map((v: number) => 2 * v),
  );
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [-2, 18, 200, 20, 2, 0, -20, -18, -200],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [-2, 18, -20, 200, 2, -18, -200, 20, 0],
  );

  tree = RedBlackTree.from(values, {
    compare: descend,
    map: function (this: MyMath, v: number) {
      return this.multiply(3, v);
    },
    thisArg: math,
  });
  assert.deepStrictEqual(values, originalValues);
  assert.deepStrictEqual(
    [...tree].reverse(),
    expected.map((v: number) => 3 * v),
  );
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [-3, 27, 300, 30, 3, 0, -30, -27, -300],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [-3, 27, -30, 300, 3, -27, -300, 30, 0],
  );
});

test('RedBlackTree.from() handles default ascend comparator', () => {
  const values: number[] = [-10, 9, -1, 100, 9, 1, 0, 9, -100, 10, -9];
  const expected: number[] = [-100, -10, -9, -1, 0, 1, 9, 10, 100];
  const originalTree: RedBlackTree<number> = new RedBlackTree();
  for (const value of values) originalTree.insert(value);
  let tree: RedBlackTree<number> = RedBlackTree.from(originalTree);
  assert.deepStrictEqual([...originalTree], expected);
  assert.deepStrictEqual([...tree], expected);
  assert.deepStrictEqual([...tree.nlrValues()], [...originalTree.nlrValues()]);
  assert.deepStrictEqual([...tree.lvlValues()], [...originalTree.lvlValues()]);

  tree = RedBlackTree.from(originalTree, { compare: descend });
  assert.deepStrictEqual([...originalTree], expected);
  assert.deepStrictEqual([...tree].reverse(), expected);
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [-1, 1, 10, 100, 9, 0, -10, -9, -100],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [-1, 1, -10, 10, 0, -9, -100, 100, 9],
  );

  tree = RedBlackTree.from(originalTree, {
    map: (v: number) => 2 * v,
  });
  assert.deepStrictEqual([...originalTree], expected);
  assert.deepStrictEqual(
    [...tree],
    expected.map((v: number) => 2 * v),
  );
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [-2, -20, -200, -18, 2, 0, 20, 18, 200],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [-2, -20, 2, -200, -18, 0, 20, 18, 200],
  );

  const math = new MyMath();
  tree = RedBlackTree.from(originalTree, {
    map: function (this: MyMath, v: number) {
      return this.multiply(3, v);
    },
    thisArg: math,
  });
  assert.deepStrictEqual([...originalTree], expected);
  assert.deepStrictEqual(
    [...tree],
    expected.map((v: number) => 3 * v),
  );
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [-3, -30, -300, -27, 3, 0, 30, 27, 300],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [-3, -30, 3, -300, -27, 0, 30, 27, 300],
  );

  tree = RedBlackTree.from(originalTree, {
    compare: descend,
    map: (v: number) => 2 * v,
  });
  assert.deepStrictEqual([...originalTree], expected);
  assert.deepStrictEqual(
    [...tree].reverse(),
    expected.map((v: number) => 2 * v),
  );
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [-2, 2, 20, 200, 18, 0, -20, -18, -200],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [-2, 2, -20, 20, 0, -18, -200, 200, 18],
  );

  tree = RedBlackTree.from(originalTree, {
    compare: descend,
    map: function (this: MyMath, v: number) {
      return this.multiply(3, v);
    },
    thisArg: math,
  });
  assert.deepStrictEqual([...originalTree], expected);
  assert.deepStrictEqual(
    [...tree].reverse(),
    expected.map((v: number) => 3 * v),
  );
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [-3, 3, 30, 300, 27, 0, -30, -27, -300],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [-3, 3, -30, 30, 0, -27, -300, 300, 27],
  );
});

test('RedBlackTree.from() handles descend comparator', () => {
  const values: number[] = [-10, 9, -1, 100, 9, 1, 0, 9, -100, 10, -9];
  const expected: number[] = [100, 10, 9, 1, 0, -1, -9, -10, -100];
  const originalTree: RedBlackTree<number> = new RedBlackTree(descend);
  for (const value of values) originalTree.insert(value);
  let tree: RedBlackTree<number> = RedBlackTree.from(originalTree);
  assert.deepStrictEqual([...originalTree], expected);
  assert.deepStrictEqual([...tree], expected);
  assert.deepStrictEqual([...tree.nlrValues()], [...originalTree.nlrValues()]);
  assert.deepStrictEqual([...tree.lvlValues()], [...originalTree.lvlValues()]);

  tree = RedBlackTree.from(originalTree, { compare: ascend });
  assert.deepStrictEqual([...originalTree], expected);
  assert.deepStrictEqual([...tree].reverse(), expected);
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [1, -1, -10, -100, -9, 0, 10, 9, 100],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [1, -1, 10, -10, 0, 9, 100, -100, -9],
  );

  tree = RedBlackTree.from(originalTree, {
    map: (v: number) => 2 * v,
  });
  assert.deepStrictEqual([...originalTree], expected);
  assert.deepStrictEqual(
    [...tree],
    expected.map((v: number) => 2 * v),
  );
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [2, 20, 200, 18, -2, 0, -20, -18, -200],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [2, 20, -2, 200, 18, 0, -20, -18, -200],
  );

  const math = new MyMath();
  tree = RedBlackTree.from(originalTree, {
    map: function (this: MyMath, v: number) {
      return this.multiply(3, v);
    },
    thisArg: math,
  });
  assert.deepStrictEqual([...originalTree], expected);
  assert.deepStrictEqual(
    [...tree],
    expected.map((v: number) => 3 * v),
  );
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [3, 30, 300, 27, -3, 0, -30, -27, -300],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [3, 30, -3, 300, 27, 0, -30, -27, -300],
  );

  tree = RedBlackTree.from(originalTree, {
    compare: ascend,
    map: (v: number) => 2 * v,
  });
  assert.deepStrictEqual([...originalTree], expected);
  assert.deepStrictEqual(
    [...tree].reverse(),
    expected.map((v: number) => 2 * v),
  );
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [2, -2, -20, -200, -18, 0, 20, 18, 200],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [2, -2, 20, -20, 0, 18, 200, -200, -18],
  );

  tree = RedBlackTree.from(originalTree, {
    compare: ascend,
    map: function (this: MyMath, v: number) {
      return this.multiply(3, v);
    },
    thisArg: math,
  });
  assert.deepStrictEqual([...originalTree], expected);
  assert.deepStrictEqual(
    [...tree].reverse(),
    expected.map((v: number) => 3 * v),
  );
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [3, -3, -30, -300, -27, 0, 30, 27, 300],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [3, -3, 30, -30, 0, 27, 300, -300, -27],
  );
});

test('RedBlackTree() inserts rebalance left', () => {
  let values: number[] = [8, 4, 10, 0, 6, 11, -2, 2];
  let tree: RedBlackTree<number> = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [8, 4, 0, -2, 2, 6, 10, 11]);
  assert.deepStrictEqual([...tree.lvlValues()], [8, 4, 10, 0, 6, 11, -2, 2]);
  assert.deepStrictEqual(tree.insert(-3), true);
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [4, 0, -2, -3, 2, 8, 6, 10, 11],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [4, 0, 8, -2, 2, 6, 10, -3, 11],
  );

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.insert(-1), true);
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [4, 0, -2, -1, 2, 8, 6, 10, 11],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [4, 0, 8, -2, 2, 6, 10, -1, 11],
  );

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.insert(1), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, 2, 1, 8, 6, 10, 11]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 8, -2, 2, 6, 10, 1, 11]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.insert(3), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, 2, 3, 8, 6, 10, 11]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 8, -2, 2, 6, 10, 3, 11]);

  values = [4, -4, 6, -5, 0, 7, -2, 2];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [4, -4, -5, 0, -2, 2, 6, 7]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, -4, 6, -5, 0, 7, -2, 2]);
  assert.deepStrictEqual(tree.insert(-3), true);
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [0, -4, -5, -2, -3, 4, 2, 6, 7],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [0, -4, 4, -5, -2, 2, 6, -3, 7],
  );

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.insert(-1), true);
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [0, -4, -5, -2, -1, 4, 2, 6, 7],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [0, -4, 4, -5, -2, 2, 6, -1, 7],
  );

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.insert(1), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -4, -5, -2, 4, 2, 1, 6, 7]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -4, 4, -5, -2, 2, 6, 1, 7]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.insert(3), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -4, -5, -2, 4, 2, 3, 6, 7]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -4, 4, -5, -2, 2, 6, 3, 7]);
});

test('RedBlackTree() inserts rebalance right', () => {
  let values: number[] = [-4, -6, 4, 0, 6, -7, -2, 2];
  let tree: RedBlackTree<number> = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -6, -7, 4, 0, -2, 2, 6]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -6, 4, -7, 0, 6, -2, 2]);
  assert.deepStrictEqual(tree.insert(-3), true);
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [0, -4, -6, -7, -2, -3, 4, 2, 6],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [0, -4, 4, -6, -2, 2, 6, -7, -3],
  );

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.insert(-1), true);
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [0, -4, -6, -7, -2, -1, 4, 2, 6],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [0, -4, 4, -6, -2, 2, 6, -7, -1],
  );

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.insert(1), true);
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [0, -4, -6, -7, -2, 4, 2, 1, 6],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [0, -4, 4, -6, -2, 2, 6, -7, 1],
  );

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.insert(3), true);
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [0, -4, -6, -7, -2, 4, 2, 3, 6],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [0, -4, 4, -6, -2, 2, 6, -7, 3],
  );

  values = [-8, -10, -4, -11, -6, 0, -2, 2];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [-8, -10, -11, -4, -6, 0, -2, 2],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [-8, -10, -4, -11, -6, 0, -2, 2],
  );
  assert.deepStrictEqual(tree.insert(-3), true);
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [-4, -8, -10, -11, -6, 0, -2, -3, 2],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [-4, -8, 0, -10, -6, -2, 2, -11, -3],
  );

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.insert(-1), true);
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [-4, -8, -10, -11, -6, 0, -2, -1, 2],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [-4, -8, 0, -10, -6, -2, 2, -11, -1],
  );

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.insert(1), true);
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [-4, -8, -10, -11, -6, 0, -2, 2, 1],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [-4, -8, 0, -10, -6, -2, 2, -11, 1],
  );

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.insert(3), true);
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [-4, -8, -10, -11, -6, 0, -2, 2, 3],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [-4, -8, 0, -10, -6, -2, 2, -11, 3],
  );
});

test('RedBlackTree removes rebalance root', () => {
  let values: number[] = [0];
  let tree: RedBlackTree<number> = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [0]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], []);

  values = [0, -1, 1];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -1, 1]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -1, 1]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [1, -1]);
  assert.deepStrictEqual([...tree.lvlValues()], [1, -1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-1), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, 1]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, 1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(1), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -1]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -1]);

  values = [0, -2, 2, -3, -1, 1, 3];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, -3, -1, 2, 1, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2, -3, -1, 1, 3]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [1, -2, -3, -1, 2, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [1, -2, 2, -3, -1, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -1, -3, 2, 1, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -1, 2, -3, 1, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, -3, -1, 3, 1]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 3, -3, -1, 1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-3), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, -1, 2, 1, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2, -1, 1, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-1), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, -3, 2, 1, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2, -3, 1, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(1), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, -3, -1, 2, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2, -3, -1, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(3), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, -3, -1, 2, 1]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2, -3, -1, 1]);

  values = [0, -2, 2, -3, -1];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, -3, -1, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2, -3, -1]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-2, -3, 2, -1]);
  assert.deepStrictEqual([...tree.lvlValues()], [-2, -3, 2, -1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -1, -3, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -1, 2, -3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-2, -3, 0, -1]);
  assert.deepStrictEqual([...tree.lvlValues()], [-2, -3, 0, -1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-3), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, -1, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2, -1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-1), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, -3, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2, -3]);

  values = [0, -2, 2, 1, 3];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, 2, 1, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2, 1, 3]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [1, -2, 2, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [1, -2, 2, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [2, 0, 1, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [2, 0, 3, 1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, 3, 1]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 3, 1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(1), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, 2, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(3), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, 2, 1]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2, 1]);

  values = [0, -2, 2, -3];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, -3, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2, -3]);
  assert.deepStrictEqual(tree.remove(-3), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [2, -2]);
  assert.deepStrictEqual([...tree.lvlValues()], [2, -2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-3), true);
  assert.deepStrictEqual(tree.remove(-2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-3), true);
  assert.deepStrictEqual(tree.remove(2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2]);

  values = [0, -2, 2, 3];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, 2, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2, 3]);
  assert.deepStrictEqual(tree.remove(3), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [2, -2]);
  assert.deepStrictEqual([...tree.lvlValues()], [2, -2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(3), true);
  assert.deepStrictEqual(tree.remove(-2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(3), true);
  assert.deepStrictEqual(tree.remove(2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2]);

  values = [0, -2, 2, -3];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, -3, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2, -3]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-2, -3, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-2, -3, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -3, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -3, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-2, -3, 0]);
  assert.deepStrictEqual([...tree.lvlValues()], [-2, -3, 0]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-3), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2]);

  values = [0, -2, 2, -1];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, -1, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2, -1]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-1, -2, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-1, -2, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -1, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -1, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-1, -2, 0]);
  assert.deepStrictEqual([...tree.lvlValues()], [-1, -2, 0]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-1), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2]);

  values = [0, -2, 2, 1];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, 2, 1]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2, 1]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [1, -2, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [1, -2, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [1, 0, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [1, 0, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, 1]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(1), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2]);

  values = [0, -2, 2, 3];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, 2, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2, 3]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [2, -2, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [2, -2, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [2, 0, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [2, 0, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(3), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2]);
});

test('RedBlackTree removes rebalance left', () => {
  let values = [4, 5, 0];
  let tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, 5]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 5]);

  values = [4, 5, 0, -1, 1];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -1, 1, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -1, 1]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 1, -1, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 1, 5, -1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-1), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, 1, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, 1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(1), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -1, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -1]);

  values = [4, 5, 0, -2, 2, -3, -1];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, -3, -1, 2, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2, 2, -3, -1]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, -2, -3, 2, -1, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, -2, 5, -3, 2, -1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -1, -3, 2, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -1, 2, -3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, -2, -3, 0, -1, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, -2, 5, -3, 0, -1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-3), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, -1, 2, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2, 2, -1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-1), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, -3, 2, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2, 2, -3]);

  values = [4, 5, 0, -2, 2, 1, 3];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, 2, 1, 3, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2, 2, 1, 3]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 1, -2, 2, 3, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 1, 5, -2, 2, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 2, 0, 1, 3, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 2, 5, 0, 3, 1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, 3, 1, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2, 3, 1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(1), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, 2, 3, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2, 2, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(3), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, 2, 1, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2, 2, 1]);

  values = [4, 5, 0, -2, 2, -3];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, -3, 2, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2, 2, -3]);
  assert.deepStrictEqual(tree.remove(-3), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, 2, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2, 2]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 2, -2, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 2, 5, -2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-3), true);
  assert.deepStrictEqual(tree.remove(-2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, 2, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-3), true);
  assert.deepStrictEqual(tree.remove(2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-3), true);
  assert.deepStrictEqual(tree.remove(4), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, 5, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 5, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-3), true);
  assert.deepStrictEqual(tree.remove(5), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, 4, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 4, 2]);

  values = [4, 5, 0, -2, 2, 3];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, 2, 3, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2, 2, 3]);
  assert.deepStrictEqual(tree.remove(3), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, 2, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2, 2]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 2, -2, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 2, 5, -2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(3), true);
  assert.deepStrictEqual(tree.remove(-2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, 2, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(3), true);
  assert.deepStrictEqual(tree.remove(2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(3), true);
  assert.deepStrictEqual(tree.remove(4), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, 5, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 5, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(3), true);
  assert.deepStrictEqual(tree.remove(5), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, 4, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 4, 2]);

  values = [4, 5, 0, -2, 2, -3, -1, 1, 3];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, -3, -1, 2, 1, 3, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2, 2, -3, -1, 1, 3]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 1, -2, -3, -1, 2, 3, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 1, 5, -2, 2, -3, -1, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -1, -3, 2, 1, 3, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -1, 2, -3, 1, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, -3, -1, 3, 1, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2, 3, -3, -1, 1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-3), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, -1, 2, 1, 3, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2, 2, -1, 1, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-1), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, -3, 2, 1, 3, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2, 2, -3, 1, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(1), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, -3, -1, 2, 3, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2, 2, -3, -1, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(3), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, -3, -1, 2, 1, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2, 2, -3, -1, 1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(4), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, -3, -1, 2, 1, 5, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2, -3, -1, 1, 5, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(5), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, -3, -1, 2, 1, 4, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2, -3, -1, 1, 4, 3]);

  values = [4, 5, 0, -2, 2, -3];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, -3, 2, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2, 2, -3]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, -2, -3, 2, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, -2, 5, -3, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -3, 2, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -3, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, -2, -3, 0, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, -2, 5, -3, 0]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-3), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, 2, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(4), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, -3, 5, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 5, -3, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(5), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, -3, 4, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 4, -3, 2]);

  values = [4, 5, 0, -2, 2, -1];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, -1, 2, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2, 2, -1]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, -1, -2, 2, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, -1, 5, -2, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -1, 2, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -1, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, -1, -2, 0, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, -1, 5, -2, 0]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-1), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, 2, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(4), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, -1, 5, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 5, -1, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(5), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, -1, 4, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 4, -1, 2]);

  values = [4, 5, 0, -2, 2, 1];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, 2, 1, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2, 2, 1]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 1, -2, 2, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 1, 5, -2, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 1, 0, 2, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 1, 5, 0, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, 1, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2, 1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(1), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, 2, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(4), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, 2, 1, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2, 1, 5]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(5), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, 2, 1, 4]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2, 1, 4]);

  values = [4, 5, 0, -2, 2, 3];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, 2, 3, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2, 2, 3]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 2, -2, 3, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 2, 5, -2, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 2, 0, 3, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 2, 5, 0, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, 3, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(3), true);
  assert.deepStrictEqual([...tree.nlrValues()], [4, 0, -2, 2, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [4, 0, 5, -2, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(4), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, 3, 2, 5]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 3, 2, 5]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(5), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, 3, 2, 4]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 3, 2, 4]);
});

test('RedBlackTree removes rebalance right', () => {
  let values = [-4, -5, 0];
  let tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5]);

  values = [-4, -5, 0, -1, 1];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -1, 1]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -1, 1]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 1, -1]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 1, -1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-1), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, 1]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, 1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(1), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -1]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -1]);

  values = [-4, -5, 0, -2, 2, -3, -1];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2, -3, -1, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2, 2, -3, -1]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, -2, -3, 2, -1]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, -2, -3, 2, -1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -1, -3, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -1, 2, -3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, -2, -3, 0, -1]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, -2, -3, 0, -1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-3), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2, -1, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2, 2, -1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-1), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2, -3, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2, 2, -3]);

  values = [-4, -5, 0, -2, 2, 1, 3];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2, 2, 1, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2, 2, 1, 3]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 1, -2, 2, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 1, -2, 2, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 2, 0, 1, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 2, 0, 3, 1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2, 3, 1]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2, 3, 1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(1), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2, 2, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2, 2, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(3), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2, 2, 1]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2, 2, 1]);

  values = [-4, -5, 0, -2, 2, -3];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2, -3, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2, 2, -3]);
  assert.deepStrictEqual(tree.remove(-3), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2, 2]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 2, -2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 2, -2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-3), true);
  assert.deepStrictEqual(tree.remove(-2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-3), true);
  assert.deepStrictEqual(tree.remove(2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-3), true);
  assert.deepStrictEqual(tree.remove(-4), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-2, -5, 0, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-2, -5, 0, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-3), true);
  assert.deepStrictEqual(tree.remove(-5), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -4, -2, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -4, 2, -2]);

  values = [-4, -5, 0, -2, 2, 3];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2, 2, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2, 2, 3]);
  assert.deepStrictEqual(tree.remove(3), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2, 2]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 2, -2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 2, -2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(3), true);
  assert.deepStrictEqual(tree.remove(-2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(3), true);
  assert.deepStrictEqual(tree.remove(2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(3), true);
  assert.deepStrictEqual(tree.remove(-4), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-2, -5, 0, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-2, -5, 0, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(3), true);
  assert.deepStrictEqual(tree.remove(-5), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -4, -2, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -4, 2, -2]);

  values = [-4, -5, 0, -2, 2, -3, -1, 1, 3];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [-4, -5, 0, -2, -3, -1, 2, 1, 3],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [-4, -5, 0, -2, 2, -3, -1, 1, 3],
  );
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 1, -2, -3, -1, 2, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 1, -2, 2, -3, -1, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -1, -3, 2, 1, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -1, 2, -3, 1, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2, -3, -1, 3, 1]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2, 3, -3, -1, 1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-3), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2, -1, 2, 1, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2, 2, -1, 1, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-1), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2, -3, 2, 1, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2, 2, -3, 1, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(1), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2, -3, -1, 2, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2, 2, -3, -1, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(3), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2, -3, -1, 2, 1]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2, 2, -3, -1, 1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-4), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-3, -5, 0, -2, -1, 2, 1, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [-3, -5, 0, -2, 2, -1, 1, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-5), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, -4, -3, -1, 2, 1, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2, -4, -1, 1, 3, -3]);

  values = [-4, -5, 0, -2, 2, -3];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2, -3, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2, 2, -3]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, -2, -3, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, -2, -3, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -3, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -3, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, -2, -3, 0]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, -2, -3, 0]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-3), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-4), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-3, -5, 0, -2, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-3, -5, 0, -2, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-5), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -3, -4, -2, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -3, 2, -4, -2]);

  values = [-4, -5, 0, -2, 2, -1];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2, -1, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2, 2, -1]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, -1, -2, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, -1, -2, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -1, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -1, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, -1, -2, 0]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, -1, -2, 0]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-1), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-4), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-2, -5, 0, -1, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-2, -5, 0, -1, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-5), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -2, -4, -1, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -2, 2, -4, -1]);

  values = [-4, -5, 0, -2, 2, 1];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2, 2, 1]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2, 2, 1]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 1, -2, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 1, -2, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 1, 0, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 1, 0, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2, 1]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2, 1]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(1), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-4), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-2, -5, 1, 0, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-2, -5, 1, 0, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-5), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -4, -2, 2, 1]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -4, 2, -2, 1]);

  values = [-4, -5, 0, -2, 2, 3];
  tree = RedBlackTree.from(values);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2, 2, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2, 2, 3]);
  assert.deepStrictEqual(tree.remove(0), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 2, -2, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 2, -2, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 2, 0, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 2, 0, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(2), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(3), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-4, -5, 0, -2, 2]);
  assert.deepStrictEqual([...tree.lvlValues()], [-4, -5, 0, -2, 2]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-4), true);
  assert.deepStrictEqual([...tree.nlrValues()], [-2, -5, 2, 0, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [-2, -5, 2, 0, 3]);

  tree = RedBlackTree.from(values);
  assert.deepStrictEqual(tree.remove(-5), true);
  assert.deepStrictEqual([...tree.nlrValues()], [0, -4, -2, 2, 3]);
  assert.deepStrictEqual([...tree.lvlValues()], [0, -4, 2, -2, 3]);
});

test('RedBlackTree works with README example', () => {
  const values = [3, 10, 13, 4, 6, 7, 1, 14];
  const tree = new RedBlackTree<number>();
  values.forEach((value) => tree.insert(value));
  assert.deepStrictEqual([...tree], [1, 3, 4, 6, 7, 10, 13, 14]);
  assert.deepStrictEqual(tree.min(), 1);
  assert.deepStrictEqual(tree.max(), 14);
  assert.deepStrictEqual(tree.find(42), null);
  assert.deepStrictEqual(tree.find(7), 7);
  assert.deepStrictEqual(tree.remove(42), false);
  assert.deepStrictEqual(tree.remove(7), true);
  assert.deepStrictEqual([...tree], [1, 3, 4, 6, 10, 13, 14]);

  const invertedTree = new RedBlackTree<number>(descend);
  values.forEach((value) => invertedTree.insert(value));
  assert.deepStrictEqual([...invertedTree], [14, 13, 10, 7, 6, 4, 3, 1]);
  assert.deepStrictEqual(invertedTree.min(), 14);
  assert.deepStrictEqual(invertedTree.max(), 1);
  assert.deepStrictEqual(invertedTree.find(42), null);
  assert.deepStrictEqual(invertedTree.find(7), 7);
  assert.deepStrictEqual(invertedTree.remove(42), false);
  assert.deepStrictEqual(invertedTree.remove(7), true);
  assert.deepStrictEqual([...invertedTree], [14, 13, 10, 6, 4, 3, 1]);

  const words = new RedBlackTree<string>(
    (a, b) => ascend(a.length, b.length) || ascend(a, b),
  );
  ['truck', 'car', 'helicopter', 'tank', 'train', 'suv', 'semi', 'van'].forEach(
    (value) => words.insert(value),
  );
  assert.deepStrictEqual(
    [...words],
    ['car', 'suv', 'van', 'semi', 'tank', 'train', 'truck', 'helicopter'],
  );
  assert.deepStrictEqual(words.min(), 'car');
  assert.deepStrictEqual(words.max(), 'helicopter');
  assert.deepStrictEqual(words.find('scooter'), null);
  assert.deepStrictEqual(words.find('tank'), 'tank');
  assert.deepStrictEqual(words.remove('scooter'), false);
  assert.deepStrictEqual(words.remove('tank'), true);
  assert.deepStrictEqual(
    [...words],
    ['car', 'suv', 'van', 'semi', 'train', 'truck', 'helicopter'],
  );
});
