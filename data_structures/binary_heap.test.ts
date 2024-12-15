import assert from 'node:assert/strict';
import { BinaryHeap } from './binary_heap.ts';
import { ascend, descend } from './comparators.ts';
import { type Container, MyMath } from './_test_utils.ts';

test('BinaryHeap throws if compare is not a function', () => {
  assert.throws(() => new BinaryHeap({} as (a: number, b: number) => number), {
    name: 'TypeError',
    message:
      "Cannot construct a BinaryHeap: the 'compare' parameter is not a function, did you mean to call BinaryHeap.from?",
  });
});

test('BinaryHeap works with default descend comparator', () => {
  const maxHeap = new BinaryHeap<number>();
  const values: number[] = [-10, 9, -1, 100, 9, 1, 0, 9, -100, 10, -9];
  const expected: number[] = [100, 10, 9, 9, 9, 1, 0, -1, -9, -10, -100];
  let actual: number[] = [];

  assert.strictEqual(maxHeap.length, 0);
  assert.strictEqual(maxHeap.isEmpty(), true);
  assert.strictEqual(maxHeap.peek(), undefined);
  for (const [i, value] of values.entries()) {
    assert.strictEqual(maxHeap.push(value), i + 1);
  }
  assert.strictEqual(maxHeap.length, values.length);
  assert.strictEqual(maxHeap.isEmpty(), false);
  while (!maxHeap.isEmpty()) {
    assert.strictEqual(maxHeap.peek(), expected[actual.length]);
    actual.push(maxHeap.pop() as number);
    assert.strictEqual(maxHeap.length, expected.length - actual.length);
    assert.strictEqual(maxHeap.isEmpty(), actual.length === expected.length);
  }
  assert.strictEqual(maxHeap.peek(), undefined);
  assert.deepStrictEqual(actual, expected);

  actual = [];
  assert.strictEqual(maxHeap.push(...values), values.length);
  assert.strictEqual(maxHeap.length, values.length);
  assert.strictEqual(maxHeap.isEmpty(), false);
  assert.strictEqual(maxHeap.peek(), expected[0]);
  for (const value of maxHeap) {
    actual.push(value);
    assert.strictEqual(maxHeap.length, expected.length - actual.length);
    assert.strictEqual(maxHeap.isEmpty(), actual.length === expected.length);
    assert.strictEqual(maxHeap.peek(), expected[actual.length]);
  }
  assert.deepStrictEqual(actual, expected);
});

test('BinaryHeap works with ascend comparator', () => {
  const minHeap = new BinaryHeap<number>(ascend);
  const values: number[] = [-10, 9, -1, 100, 9, 1, 0, 9, -100, 10, -9];
  const expected: number[] = [-100, -10, -9, -1, 0, 1, 9, 9, 9, 10, 100];
  let actual: number[] = [];

  assert.strictEqual(minHeap.length, 0);
  assert.strictEqual(minHeap.isEmpty(), true);
  assert.strictEqual(minHeap.peek(), undefined);
  for (const [i, value] of values.entries()) {
    assert.strictEqual(minHeap.push(value), i + 1);
  }
  assert.strictEqual(minHeap.length, values.length);
  assert.strictEqual(minHeap.isEmpty(), false);
  while (!minHeap.isEmpty()) {
    assert.strictEqual(minHeap.peek(), expected[actual.length]);
    actual.push(minHeap.pop() as number);
    assert.strictEqual(minHeap.length, expected.length - actual.length);
    assert.strictEqual(minHeap.isEmpty(), actual.length === expected.length);
  }
  assert.strictEqual(minHeap.peek(), undefined);
  assert.deepStrictEqual(actual, expected);

  actual = [];
  assert.strictEqual(minHeap.push(...values), values.length);
  assert.strictEqual(minHeap.length, values.length);
  assert.strictEqual(minHeap.isEmpty(), false);
  assert.strictEqual(minHeap.peek(), expected[0]);
  for (const value of minHeap) {
    actual.push(value);
    assert.strictEqual(minHeap.length, expected.length - actual.length);
    assert.strictEqual(minHeap.isEmpty(), actual.length === expected.length);
    assert.strictEqual(minHeap.peek(), expected[actual.length]);
  }
  assert.deepStrictEqual(actual, expected);
});

test('BinaryHeap contains objects', () => {
  const heap = new BinaryHeap((a: Container, b: Container) =>
    ascend(a.id, b.id),
  );
  const ids: number[] = [-10, 9, -1, 100, 1, 0, -100, 10, -9];

  for (const [i, id] of ids.entries()) {
    const newContainer: Container = { id, values: [] };
    assert.strictEqual(heap.push(newContainer), i + 1);
    newContainer.values.push(i - 1, i, i + 1);
    assert.strictEqual(heap.length, i + 1);
    assert.strictEqual(heap.isEmpty(), false);
  }

  const expected: number[] = [-100, -10, -9, -1, 0, 1, 9, 10, 100];
  const expectedValue: number[] = [6, 0, 8, 2, 5, 4, 1, 7, 3];
  for (const [i, value] of expectedValue.entries()) {
    assert.strictEqual(heap.length, ids.length - i);
    assert.strictEqual(heap.isEmpty(), false);

    const expectedContainer = {
      id: expected[i],
      values: [value - 1, value, value + 1],
    };
    assert.deepStrictEqual(heap.peek(), expectedContainer);
    assert.deepStrictEqual(heap.pop(), expectedContainer);
  }
  assert.strictEqual(heap.length, 0);
  assert.strictEqual(heap.isEmpty(), true);
});

test('BinaryHeap.from() handles iterable', () => {
  const values: number[] = [-10, 9, -1, 100, 9, 1, 0, 9, -100, 10, -9];
  const originalValues: number[] = Array.from(values);
  const expected: number[] = [100, 10, 9, 9, 9, 1, 0, -1, -9, -10, -100];
  let heap = BinaryHeap.from(values);
  assert.deepStrictEqual(values, originalValues);
  assert.deepStrictEqual([...heap], expected);

  heap = BinaryHeap.from(values, { compare: ascend });
  assert.deepStrictEqual(values, originalValues);
  assert.deepStrictEqual([...heap].reverse(), expected);

  heap = BinaryHeap.from(values, {
    map: (v: number) => 2 * v,
  });
  assert.deepStrictEqual(
    [...heap],
    expected.map((v: number) => 2 * v),
  );

  const math = new MyMath();
  heap = BinaryHeap.from(values, {
    map: function (this: MyMath, v: number) {
      return this.multiply(3, v);
    },
    thisArg: math,
  });
  assert.deepStrictEqual(values, originalValues);
  assert.deepStrictEqual(
    [...heap],
    expected.map((v: number) => 3 * v),
  );

  heap = BinaryHeap.from(values, {
    compare: ascend,
    map: (v: number) => 2 * v,
  });
  assert.deepStrictEqual(values, originalValues);
  assert.deepStrictEqual(
    [...heap].reverse(),
    expected.map((v: number) => 2 * v),
  );

  heap = BinaryHeap.from(values, {
    compare: ascend,
    map: function (this: MyMath, v: number) {
      return this.multiply(3, v);
    },
    thisArg: math,
  });
  assert.deepStrictEqual(values, originalValues);
  assert.deepStrictEqual(
    [...heap].reverse(),
    expected.map((v: number) => 3 * v),
  );
});

test('BinaryHeap.from() handles default descend comparator', () => {
  const values: number[] = [-10, 9, -1, 100, 9, 1, 0, 9, -100, 10, -9];
  const expected: number[] = [100, 10, 9, 9, 9, 1, 0, -1, -9, -10, -100];
  const maxHeap = new BinaryHeap<number>();
  maxHeap.push(...values);
  let heap = BinaryHeap.from(maxHeap);
  assert.deepStrictEqual([...maxHeap], expected);
  assert.deepStrictEqual([...heap], expected);

  maxHeap.push(...values);
  heap = BinaryHeap.from(maxHeap, { compare: ascend });
  assert.deepStrictEqual([...maxHeap], expected);
  assert.deepStrictEqual([...heap].reverse(), expected);

  maxHeap.push(...values);
  heap = BinaryHeap.from(maxHeap, {
    map: (v: number) => 2 * v,
  });
  assert.deepStrictEqual([...maxHeap], expected);
  assert.deepStrictEqual(
    [...heap],
    expected.map((v: number) => 2 * v),
  );

  const math = new MyMath();
  maxHeap.push(...values);
  heap = BinaryHeap.from(maxHeap, {
    map: function (this: MyMath, v: number) {
      return this.multiply(3, v);
    },
    thisArg: math,
  });
  assert.deepStrictEqual([...maxHeap], expected);
  assert.deepStrictEqual(
    [...heap],
    expected.map((v: number) => 3 * v),
  );

  maxHeap.push(...values);
  heap = BinaryHeap.from(maxHeap, {
    compare: ascend,
    map: (v: number) => 2 * v,
  });
  assert.deepStrictEqual([...maxHeap], expected);
  assert.deepStrictEqual(
    [...heap].reverse(),
    expected.map((v: number) => 2 * v),
  );

  maxHeap.push(...values);
  heap = BinaryHeap.from(maxHeap, {
    compare: ascend,
    map: function (this: MyMath, v: number) {
      return this.multiply(3, v);
    },
    thisArg: math,
  });
  assert.deepStrictEqual([...maxHeap], expected);
  assert.deepStrictEqual(
    [...heap].reverse(),
    expected.map((v: number) => 3 * v),
  );
});

test('BinaryHeap.from() handles ascend comparator', () => {
  const values: number[] = [-10, 9, -1, 100, 9, 1, 0, 9, -100, 10, -9];
  const expected: number[] = [-100, -10, -9, -1, 0, 1, 9, 9, 9, 10, 100];
  const minHeap = new BinaryHeap<number>(ascend);
  minHeap.push(...values);
  let heap = BinaryHeap.from(minHeap);
  assert.deepStrictEqual([...minHeap], expected);
  assert.deepStrictEqual([...heap], expected);

  minHeap.push(...values);
  heap = BinaryHeap.from(minHeap, { compare: descend });
  assert.deepStrictEqual([...minHeap], expected);
  assert.deepStrictEqual([...heap].reverse(), expected);

  minHeap.push(...values);
  heap = BinaryHeap.from(minHeap, {
    map: (v: number) => 2 * v,
  });
  assert.deepStrictEqual([...minHeap], expected);
  assert.deepStrictEqual(
    [...heap],
    expected.map((v: number) => 2 * v),
  );

  const math = new MyMath();
  minHeap.push(...values);
  heap = BinaryHeap.from(minHeap, {
    map: function (this: MyMath, v: number) {
      return this.multiply(3, v);
    },
    thisArg: math,
  });
  assert.deepStrictEqual([...minHeap], expected);
  assert.deepStrictEqual(
    [...heap],
    expected.map((v: number) => 3 * v),
  );

  minHeap.push(...values);
  heap = BinaryHeap.from(minHeap, {
    compare: descend,
    map: (v: number) => 2 * v,
  });
  assert.deepStrictEqual([...minHeap], expected);
  assert.deepStrictEqual(
    [...heap].reverse(),
    expected.map((v: number) => 2 * v),
  );

  minHeap.push(...values);
  heap = BinaryHeap.from(minHeap, {
    compare: descend,
    map: function (this: MyMath, v: number) {
      return this.multiply(3, v);
    },
    thisArg: math,
  });
  assert.deepStrictEqual([...minHeap], expected);
  assert.deepStrictEqual(
    [...heap].reverse(),
    expected.map((v: number) => 3 * v),
  );
});

test('BinaryHeap handles edge case 1', () => {
  const minHeap = new BinaryHeap<number>(ascend);
  minHeap.push(4, 2, 8, 1, 10, 7, 3, 6, 5);
  assert.strictEqual(minHeap.pop(), 1);
  minHeap.push(9);

  const expected = [2, 3, 4, 5, 6, 7, 8, 9, 10];
  assert.deepStrictEqual([...minHeap], expected);
});

test('BinaryHeap handles edge case 2', () => {
  interface Point {
    x: number;
    y: number;
  }
  const minHeap = new BinaryHeap<Point>((a, b) => ascend(a.x, b.x));
  minHeap.push({ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 });

  const expected = [
    { x: 0, y: 1 },
    { x: 0, y: 3 },
    { x: 0, y: 2 },
  ];
  assert.deepStrictEqual([...minHeap], expected);
});

test('BinaryHeap handles edge case 3', () => {
  interface Point {
    x: number;
    y: number;
  }
  const minHeap = new BinaryHeap<Point>((a, b) => ascend(a.x, b.x));
  minHeap.push(
    { x: 0, y: 1 },
    { x: 1, y: 2 },
    { x: 1, y: 3 },
    { x: 2, y: 4 },
    { x: 2, y: 5 },
    { x: 2, y: 6 },
    { x: 2, y: 7 },
  );

  const expected = [
    { x: 0, y: 1 },
    { x: 1, y: 2 },
    { x: 1, y: 3 },
    { x: 2, y: 5 },
    { x: 2, y: 4 },
    { x: 2, y: 6 },
    { x: 2, y: 7 },
  ];
  assert.deepStrictEqual([...minHeap], expected);
});

test('BinaryHeap handles README example', () => {
  const maxHeap = new BinaryHeap<number>();
  maxHeap.push(4, 1, 3, 5, 2);
  assert.strictEqual(maxHeap.peek(), 5);
  assert.strictEqual(maxHeap.pop(), 5);
  assert.deepStrictEqual([...maxHeap], [4, 3, 2, 1]);
  assert.deepStrictEqual([...maxHeap], []);

  const minHeap = new BinaryHeap<number>(ascend);
  minHeap.push(4, 1, 3, 5, 2);
  assert.strictEqual(minHeap.peek(), 1);
  assert.strictEqual(minHeap.pop(), 1);
  assert.deepStrictEqual([...minHeap], [2, 3, 4, 5]);
  assert.deepStrictEqual([...minHeap], []);

  const words = new BinaryHeap<string>((a, b) => descend(a.length, b.length));
  words.push('truck', 'car', 'helicopter', 'tank');
  assert.strictEqual(words.peek(), 'helicopter');
  assert.strictEqual(words.pop(), 'helicopter');
  assert.deepStrictEqual([...words], ['truck', 'tank', 'car']);
  assert.deepStrictEqual([...words], []);
});

test('BinaryHeap.toArray()', () => {
  const values = [-10, 9, -1, 100, 9, 1, 0, 9, -100, 10, -9];
  const maxHeap = new BinaryHeap<number>();
  maxHeap.push(...values);
  assert(maxHeap.toArray().every((value) => values.includes(value)));
});

test('BinaryHeap.drain()', () => {
  const values = [2, 4, 3, 5, 1];
  const expected = [5, 4, 3, 2, 1];
  const heap = new BinaryHeap<number>();
  heap.push(...values);
  assert.deepStrictEqual([...heap.drain()], expected);
  assert.strictEqual(heap.length, 0);
});

test('BinaryHeap drain copy', () => {
  const values = [2, 4, 3, 5, 1];
  const expected = [5, 4, 3, 2, 1];
  const heap = new BinaryHeap<number>();
  heap.push(...values);
  const copy = BinaryHeap.from(heap);
  assert.deepStrictEqual([...copy.drain()], expected);
  assert.strictEqual(heap.length, 5);
});

test('BinaryHeap.clear()', () => {
  const values = [-10, 9, -1, 100, 9, 1, 0, 9, -100, 10, -9];
  const maxHeap = new BinaryHeap<number>();
  maxHeap.push(...values);
  maxHeap.clear();
  assert.deepStrictEqual(maxHeap.toArray(), []);
});
