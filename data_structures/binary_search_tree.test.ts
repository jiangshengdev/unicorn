// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import assert from 'node:assert/strict';
import { BinarySearchTree } from './binary_search_tree.ts';
import { ascend, descend } from './comparators.ts';

class MyMath {
  multiply(a: number, b: number): number {
    return a * b;
  }
}

interface Container {
  id: number;
  values: number[];
}

test('BinarySearchTree throws if compare is not a function', () => {
  assert.throws(
    () => new BinarySearchTree({} as (a: number, b: number) => number),
    {
      name: 'TypeError',
      message:
        "Cannot construct a BinarySearchTree: the 'compare' parameter is not a function, did you mean to call BinarySearchTree.from?",
    },
  );
});

test('BinarySearchTree handles default ascend comparator', () => {
  const trees = [new BinarySearchTree(), new BinarySearchTree()] as const;
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
    assert.strictEqual(tree.size, 0);
    assert.strictEqual(tree.isEmpty(), true);
    for (const [j, value] of values.entries()) {
      assert.strictEqual(tree.find(value), null);
      assert.strictEqual(tree.insert(value), true);
      assert.strictEqual(tree.find(value), value);
      assert.strictEqual(tree.size, j + 1);
      assert.strictEqual(tree.isEmpty(), false);
      assert.strictEqual(tree.min(), expectedMin?.[i]?.[j]);
      assert.strictEqual(tree.max(), expectedMax?.[i]?.[j]);
    }
    for (const value of values) {
      assert.strictEqual(tree.insert(value), false);
      assert.strictEqual(tree.size, values.length);
      assert.strictEqual(tree.isEmpty(), false);
      assert.strictEqual(tree.min(), -100);
      assert.strictEqual(tree.max(), 100);
    }
    values.reverse();
  }

  for (const tree of trees) {
    assert.deepStrictEqual(
      [...tree.lnrValues()],
      [-100, -10, -9, -1, 0, 1, 9, 10, 100],
    );
    assert.strictEqual(tree.size, values.length);
    assert.strictEqual(tree.isEmpty(), false);

    assert.deepStrictEqual([...tree], [-100, -10, -9, -1, 0, 1, 9, 10, 100]);
    assert.strictEqual(tree.size, values.length);
    assert.strictEqual(tree.isEmpty(), false);

    assert.deepStrictEqual(
      [...tree.rnlValues()],
      [100, 10, 9, 1, 0, -1, -9, -10, -100],
    );
    assert.strictEqual(tree.size, values.length);
    assert.strictEqual(tree.isEmpty(), false);
  }

  assert.deepStrictEqual(
    [...trees[0].nlrValues()],
    [-10, -100, 9, -1, -9, 1, 0, 100, 10],
  );
  assert.deepStrictEqual(
    [...trees[1].nlrValues()],
    [-9, -100, -10, 10, 0, -1, 1, 9, 100],
  );
  for (const tree of trees) {
    assert.strictEqual(tree.size, values.length);
    assert.strictEqual(tree.isEmpty(), false);
  }

  assert.deepStrictEqual(
    [...trees[0].lrnValues()],
    [-100, -9, 0, 1, -1, 10, 100, 9, -10],
  );
  assert.deepStrictEqual(
    [...trees[1].lrnValues()],
    [-10, -100, -1, 9, 1, 0, 100, 10, -9],
  );
  for (const tree of trees) {
    assert.strictEqual(tree.size, values.length);
    assert.strictEqual(tree.isEmpty(), false);
  }

  assert.deepStrictEqual(
    [...trees[0].lvlValues()],
    [-10, -100, 9, -1, 100, -9, 1, 10, 0],
  );
  assert.deepStrictEqual(
    [...trees[1].lvlValues()],
    [-9, -100, 10, -10, 0, 100, -1, 1, 9],
  );
  for (const tree of trees) {
    assert.strictEqual(tree.size, values.length);
    assert.strictEqual(tree.isEmpty(), false);
  }

  for (const tree of trees) {
    const expected: number[] = [-100, -10, -9, -1, 0, 1, 9, 10, 100];
    for (const [j, value] of values.entries()) {
      assert.strictEqual(tree.size, values.length - j);
      assert.strictEqual(tree.isEmpty(), false);
      assert.strictEqual(tree.find(value), value);

      assert.strictEqual(tree.remove(value), true);
      expected.splice(expected.indexOf(value), 1);
      assert.deepStrictEqual([...tree], expected);
      assert.strictEqual(tree.find(value), null);

      assert.strictEqual(tree.remove(value), false);
      assert.deepStrictEqual([...tree], expected);
      assert.strictEqual(tree.find(value), null);
    }
    assert.strictEqual(tree.size, 0);
    assert.strictEqual(tree.isEmpty(), true);
  }
});

test('BinarySearchTree handles descend comparator', () => {
  const trees = [
    new BinarySearchTree(descend),
    new BinarySearchTree(descend),
  ] as const;
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
    assert.strictEqual(tree.size, 0);
    assert.strictEqual(tree.isEmpty(), true);
    for (const [j, value] of values.entries()) {
      assert.strictEqual(tree.find(value), null);
      assert.strictEqual(tree.insert(value), true);
      assert.strictEqual(tree.find(value), value);
      assert.strictEqual(tree.size, j + 1);
      assert.strictEqual(tree.isEmpty(), false);
      assert.strictEqual(tree.min(), expectedMin?.[i]?.[j]);
      assert.strictEqual(tree.max(), expectedMax?.[i]?.[j]);
    }
    for (const value of values) {
      assert.strictEqual(tree.insert(value), false);
      assert.strictEqual(tree.size, values.length);
      assert.strictEqual(tree.isEmpty(), false);
      assert.strictEqual(tree.min(), 100);
      assert.strictEqual(tree.max(), -100);
    }
    values.reverse();
  }

  for (const tree of trees) {
    assert.deepStrictEqual(
      [...tree.lnrValues()],
      [100, 10, 9, 1, 0, -1, -9, -10, -100],
    );
    assert.strictEqual(tree.size, values.length);
    assert.strictEqual(tree.isEmpty(), false);

    assert.deepStrictEqual([...tree], [100, 10, 9, 1, 0, -1, -9, -10, -100]);
    assert.strictEqual(tree.size, values.length);
    assert.strictEqual(tree.isEmpty(), false);

    assert.deepStrictEqual(
      [...tree.rnlValues()],
      [-100, -10, -9, -1, 0, 1, 9, 10, 100],
    );
    assert.strictEqual(tree.size, values.length);
    assert.strictEqual(tree.isEmpty(), false);
  }

  assert.deepStrictEqual(
    [...trees[0].nlrValues()],
    [-10, 9, 100, 10, -1, 1, 0, -9, -100],
  );
  assert.deepStrictEqual(
    [...trees[1].nlrValues()],
    [-9, 10, 100, 0, 1, 9, -1, -100, -10],
  );
  for (const tree of trees) {
    assert.strictEqual(tree.size, values.length);
    assert.strictEqual(tree.isEmpty(), false);
  }

  assert.deepStrictEqual(
    [...trees[0].lrnValues()],
    [10, 100, 0, 1, -9, -1, 9, -100, -10],
  );
  assert.deepStrictEqual(
    [...trees[1].lrnValues()],
    [100, 9, 1, -1, 0, 10, -10, -100, -9],
  );
  for (const tree of trees) {
    assert.strictEqual(tree.size, values.length);
    assert.strictEqual(tree.isEmpty(), false);
  }

  assert.deepStrictEqual(
    [...trees[0].lvlValues()],
    [-10, 9, -100, 100, -1, 10, 1, -9, 0],
  );
  assert.deepStrictEqual(
    [...trees[1].lvlValues()],
    [-9, 10, -100, 100, 0, -10, 1, -1, 9],
  );
  for (const tree of trees) {
    assert.strictEqual(tree.size, values.length);
    assert.strictEqual(tree.isEmpty(), false);
  }

  for (const tree of trees) {
    const expected: number[] = [100, 10, 9, 1, 0, -1, -9, -10, -100];
    for (const [j, value] of values.entries()) {
      assert.strictEqual(tree.size, values.length - j);
      assert.strictEqual(tree.isEmpty(), false);
      assert.strictEqual(tree.find(value), value);

      assert.strictEqual(tree.remove(value), true);
      expected.splice(expected.indexOf(value), 1);
      assert.deepStrictEqual([...tree], expected);
      assert.strictEqual(tree.find(value), null);

      assert.strictEqual(tree.remove(value), false);
      assert.deepStrictEqual([...tree], expected);
      assert.strictEqual(tree.find(value), null);
    }
    assert.strictEqual(tree.size, 0);
    assert.strictEqual(tree.isEmpty(), true);
  }
});

test('BinarySearchTree contains objects', () => {
  const tree: BinarySearchTree<Container> = new BinarySearchTree(
    (a: Container, b: Container) => ascend(a.id, b.id),
  );
  const ids = [-10, 9, -1, 100, 1, 0, -100, 10, -9];

  for (const [i, id] of ids.entries()) {
    const newContainer: Container = { id, values: [] };
    assert.strictEqual(tree.find(newContainer), null);
    assert.strictEqual(tree.insert(newContainer), true);
    newContainer.values.push(i - 1, i, i + 1);
    assert.strictEqual(tree.find({ id, values: [] }), newContainer);
    assert.strictEqual(tree.size, i + 1);
    assert.strictEqual(tree.isEmpty(), false);
  }
  for (const [i, id] of ids.entries()) {
    const newContainer: Container = { id, values: [] };
    assert.deepStrictEqual(tree.find({ id } as Container), {
      id,
      values: [i - 1, i, i + 1],
    });
    assert.strictEqual(tree.insert(newContainer), false);
    assert.deepStrictEqual(tree.find({ id, values: [] }), {
      id,
      values: [i - 1, i, i + 1],
    });
    assert.strictEqual(tree.size, ids.length);
    assert.strictEqual(tree.isEmpty(), false);
  }

  assert.deepStrictEqual(
    [...tree].map((container) => container.id),
    [-100, -10, -9, -1, 0, 1, 9, 10, 100],
  );
  assert.strictEqual(tree.size, ids.length);
  assert.strictEqual(tree.isEmpty(), false);

  const expected: number[] = [-100, -10, -9, -1, 0, 1, 9, 10, 100];
  for (const [i, id] of ids.entries()) {
    assert.strictEqual(tree.size, ids.length - i);
    assert.strictEqual(tree.isEmpty(), false);
    assert.deepStrictEqual(tree.find({ id, values: [] }), {
      id,
      values: [i - 1, i, i + 1],
    });

    assert.strictEqual(tree.remove({ id, values: [] }), true);
    expected.splice(expected.indexOf(id), 1);
    assert.deepStrictEqual(
      [...tree].map((container) => container.id),
      expected,
    );
    assert.strictEqual(tree.find({ id, values: [] }), null);

    assert.strictEqual(tree.remove({ id, values: [] }), false);
    assert.deepStrictEqual(
      [...tree].map((container) => container.id),
      expected,
    );
    assert.strictEqual(tree.find({ id, values: [] }), null);
  }
  assert.strictEqual(tree.size, 0);
  assert.strictEqual(tree.isEmpty(), true);
});

test('BinarySearchTree.from() handles iterable', () => {
  const values: number[] = [-10, 9, -1, 100, 9, 1, 0, 9, -100, 10, -9];
  const originalValues: number[] = Array.from(values);
  const expected: number[] = [-100, -10, -9, -1, 0, 1, 9, 10, 100];
  let tree: BinarySearchTree<number> = BinarySearchTree.from(values);
  assert.deepStrictEqual(values, originalValues);
  assert.deepStrictEqual([...tree], expected);
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [-10, -100, 9, -1, -9, 1, 0, 100, 10],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [-10, -100, 9, -1, 100, -9, 1, 10, 0],
  );

  tree = BinarySearchTree.from(values, { compare: descend });
  assert.deepStrictEqual(values, originalValues);
  assert.deepStrictEqual([...tree].reverse(), expected);
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [-10, 9, 100, 10, -1, 1, 0, -9, -100],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [-10, 9, -100, 100, -1, 10, 1, -9, 0],
  );

  tree = BinarySearchTree.from(values, {
    map: (v: number) => 2 * v,
  });
  assert.deepStrictEqual(
    [...tree],
    expected.map((v: number) => 2 * v),
  );
  assert.deepStrictEqual(
    [...tree.nlrValues()],
    [-20, -200, 18, -2, -18, 2, 0, 200, 20],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [-20, -200, 18, -2, 200, -18, 2, 20, 0],
  );

  const math = new MyMath();
  tree = BinarySearchTree.from(values, {
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
    [-30, -300, 27, -3, -27, 3, 0, 300, 30],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [-30, -300, 27, -3, 300, -27, 3, 30, 0],
  );

  tree = BinarySearchTree.from(values, {
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
    [-20, 18, 200, 20, -2, 2, 0, -18, -200],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [-20, 18, -200, 200, -2, 20, 2, -18, 0],
  );

  tree = BinarySearchTree.from(values, {
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
    [-30, 27, 300, 30, -3, 3, 0, -27, -300],
  );
  assert.deepStrictEqual(
    [...tree.lvlValues()],
    [-30, 27, -300, 300, -3, 30, 3, -27, 0],
  );
});

test('BinarySearchTree.from() handles default ascend comparator', () => {
  const values: number[] = [-10, 9, -1, 100, 9, 1, 0, 9, -100, 10, -9];
  const expected: number[] = [-100, -10, -9, -1, 0, 1, 9, 10, 100];
  const originalTree: BinarySearchTree<number> = new BinarySearchTree();
  for (const value of values) originalTree.insert(value);
  let tree: BinarySearchTree<number> = BinarySearchTree.from(originalTree);
  assert.deepStrictEqual([...originalTree], expected);
  assert.deepStrictEqual([...tree], expected);
  assert.deepStrictEqual(tree.size, originalTree.size);
  assert.deepStrictEqual([...tree.nlrValues()], [...originalTree.nlrValues()]);
  assert.deepStrictEqual([...tree.lvlValues()], [...originalTree.lvlValues()]);

  tree = BinarySearchTree.from(originalTree, { compare: descend });
  assert.deepStrictEqual([...originalTree], expected);
  assert.deepStrictEqual([...tree].reverse(), expected);
  assert.deepStrictEqual([...tree.nlrValues()], expected);
  assert.deepStrictEqual([...tree.lvlValues()], expected);

  tree = BinarySearchTree.from(originalTree, {
    map: (v: number) => 2 * v,
  });
  assert.deepStrictEqual([...originalTree], expected);
  assert.deepStrictEqual(
    [...tree],
    expected.map((v: number) => 2 * v),
  );

  const math = new MyMath();
  tree = BinarySearchTree.from(originalTree, {
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

  tree = BinarySearchTree.from(originalTree, {
    compare: descend,
    map: (v: number) => 2 * v,
  });
  assert.deepStrictEqual([...originalTree], expected);
  assert.deepStrictEqual(
    [...tree].reverse(),
    expected.map((v: number) => 2 * v),
  );

  tree = BinarySearchTree.from(originalTree, {
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
});

test('BinarySearchTree.from() handles descend comparator', () => {
  const values: number[] = [-10, 9, -1, 100, 9, 1, 0, 9, -100, 10, -9];
  const expected: number[] = [100, 10, 9, 1, 0, -1, -9, -10, -100];
  const originalTree = new BinarySearchTree<number>(descend);
  for (const value of values) originalTree.insert(value);
  let tree: BinarySearchTree<number> = BinarySearchTree.from(originalTree);
  assert.deepStrictEqual([...originalTree], expected);
  assert.deepStrictEqual([...tree], expected);
  assert.deepStrictEqual(tree.size, originalTree.size);
  assert.deepStrictEqual([...tree.nlrValues()], [...originalTree.nlrValues()]);
  assert.deepStrictEqual([...tree.lvlValues()], [...originalTree.lvlValues()]);

  tree = BinarySearchTree.from(originalTree, { compare: ascend });
  assert.deepStrictEqual([...originalTree], expected);
  assert.deepStrictEqual([...tree].reverse(), expected);
  assert.deepStrictEqual([...tree.nlrValues()], expected);
  assert.deepStrictEqual([...tree.lvlValues()], expected);

  tree = BinarySearchTree.from(originalTree, {
    map: (v: number) => 2 * v,
  });
  assert.deepStrictEqual([...originalTree], expected);
  assert.deepStrictEqual(
    [...tree],
    expected.map((v: number) => 2 * v),
  );

  const math = new MyMath();
  tree = BinarySearchTree.from(originalTree, {
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

  tree = BinarySearchTree.from(originalTree, {
    compare: ascend,
    map: (v: number) => 2 * v,
  });
  assert.deepStrictEqual([...originalTree], expected);
  assert.deepStrictEqual(
    [...tree].reverse(),
    expected.map((v: number) => 2 * v),
  );

  tree = BinarySearchTree.from(originalTree, {
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
});

test('BinarySearchTree handles README example', () => {
  const values = [3, 10, 13, 4, 6, 7, 1, 14];
  const tree = new BinarySearchTree<number>();
  values.forEach((value) => tree.insert(value));
  assert.deepStrictEqual([...tree], [1, 3, 4, 6, 7, 10, 13, 14]);
  assert.strictEqual(tree.min(), 1);
  assert.strictEqual(tree.max(), 14);
  assert.strictEqual(tree.find(42), null);
  assert.strictEqual(tree.find(7), 7);
  assert.strictEqual(tree.remove(42), false);
  assert.strictEqual(tree.remove(7), true);
  assert.deepStrictEqual([...tree], [1, 3, 4, 6, 10, 13, 14]);

  const invertedTree = new BinarySearchTree<number>(descend);
  values.forEach((value) => invertedTree.insert(value));
  assert.deepStrictEqual([...invertedTree], [14, 13, 10, 7, 6, 4, 3, 1]);
  assert.strictEqual(invertedTree.min(), 14);
  assert.strictEqual(invertedTree.max(), 1);
  assert.strictEqual(invertedTree.find(42), null);
  assert.strictEqual(invertedTree.find(7), 7);
  assert.strictEqual(invertedTree.remove(42), false);
  assert.strictEqual(invertedTree.remove(7), true);
  assert.deepStrictEqual([...invertedTree], [14, 13, 10, 6, 4, 3, 1]);

  const words = new BinarySearchTree<string>(
    (a, b) => ascend(a.length, b.length) || ascend(a, b),
  );
  ['truck', 'car', 'helicopter', 'tank', 'train', 'suv', 'semi', 'van'].forEach(
    (value) => words.insert(value),
  );
  assert.deepStrictEqual(
    [...words],
    ['car', 'suv', 'van', 'semi', 'tank', 'train', 'truck', 'helicopter'],
  );
  assert.strictEqual(words.min(), 'car');
  assert.strictEqual(words.max(), 'helicopter');
  assert.strictEqual(words.find('scooter'), null);
  assert.strictEqual(words.find('tank'), 'tank');
  assert.strictEqual(words.remove('scooter'), false);
  assert.strictEqual(words.remove('tank'), true);
  assert.deepStrictEqual(
    [...words],
    ['car', 'suv', 'van', 'semi', 'train', 'truck', 'helicopter'],
  );
});

test('BinarySearchTree.max() handles null ', () => {
  const tree = BinarySearchTree.from([1]);
  assert(!tree.isEmpty());
  tree.clear();
  assert.strictEqual(tree.max(), null);
});

test('BinarySearchTree.clear()', () => {
  const tree = BinarySearchTree.from([1]);
  tree.clear();
  assert(tree.isEmpty());
});
