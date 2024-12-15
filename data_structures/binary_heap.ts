// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

import { descend } from './comparators.ts';

/** 交换数组中两个索引处的值。 */
function swap<T>(array: T[], a: number, b: number) {
  const temp = array[a];
  array[a] = array[b]!;
  array[b] = temp!;
}

/** 返回子索引的父索引。 */
function getParentIndex(index: number) {
  return Math.floor((index + 1) / 2) - 1;
}

/**
 * 使用二叉堆实现的优先队列。堆默认为降序，
 * 使用 JavaScript 的内置比较操作符对值进行排序。
 *
 * | 方法        | 平均情况 | 最坏情况 |
 * | ----------- | -------- | -------- |
 * | peek()      | O(1)     | O(1)     |
 * | pop()       | O(log n) | O(log n) |
 * | push(value) | O(1)     | O(log n) |
 *
 * @example 用法
 * ```ts
 * import {
 *   ascend,
 *   BinaryHeap,
 *   descend,
 * } from "@std/data-structures";
 * import { assertEquals } from "@std/assert";
 *
 * const maxHeap = new BinaryHeap<number>();
 * maxHeap.push(4, 1, 3, 5, 2);
 * assertEquals(maxHeap.peek(), 5);
 * assertEquals(maxHeap.pop(), 5);
 * assertEquals([...maxHeap], [4, 3, 2, 1]);
 * assertEquals([...maxHeap], []);
 *
 * const minHeap = new BinaryHeap<number>(ascend);
 * minHeap.push(4, 1, 3, 5, 2);
 * assertEquals(minHeap.peek(), 1);
 * assertEquals(minHeap.pop(), 1);
 * assertEquals([...minHeap], [2, 3, 4, 5]);
 * assertEquals([...minHeap], []);
 *
 * const words = new BinaryHeap<string>((a, b) => descend(a.length, b.length));
 * words.push("truck", "car", "helicopter", "tank");
 * assertEquals(words.peek(), "helicopter");
 * assertEquals(words.pop(), "helicopter");
 * assertEquals([...words], ["truck", "tank", "car"]);
 * assertEquals([...words], []);
 * ```
 *
 * @typeparam T 二叉堆中存储的值的类型。
 */
export class BinaryHeap<T> implements Iterable<T> {
  #data: T[] = [];
  #compare: (a: T, b: T) => number;

  /**
   * 构造一个空的二叉堆。
   *
   * @param compare 自定义比较函数，用于对堆中的值进行排序。默认情况下，值按降序排序。
   */
  constructor(compare: (a: T, b: T) => number = descend) {
    if (typeof compare !== 'function') {
      throw new TypeError(
        "Cannot construct a BinaryHeap: the 'compare' parameter is not a function, did you mean to call BinaryHeap.from?",
      );
    }
    this.#compare = compare;
  }

  /**
   * 返回未排序的底层克隆数组。
   *
   * @example 获取底层数组
   * ```ts
   * import { BinaryHeap } from "@std/data-structures";
   * import { assertEquals } from "@std/assert";
   *
   * const heap = BinaryHeap.from([4, 1, 3, 5, 2]);
   *
   * assertEquals(heap.toArray(), [ 5, 4, 3, 1, 2 ]);
   * ```
   *
   * @returns 一个包含二叉堆中值的数组。
   */
  toArray(): T[] {
    return Array.from(this.#data);
  }

  /**
   * 从类似数组、可迭代对象或现有二叉堆创建一个新的二叉堆。
   *
   * 可以提供自定义比较函数以按特定顺序对值进行排序。默认情况下，值按降序排序，
   * 除非传递了 {@link BinaryHeap}，此时比较函数将从输入堆中复制。
   *
   * @example 从类似数组创建二叉堆
   * ```ts no-assert
   * import { BinaryHeap } from "@std/data-structures";
   *
   * const heap = BinaryHeap.from([4, 1, 3, 5, 2]);
   * ```
   *
   * @example 从可迭代对象创建二叉堆
   * ```ts no-assert
   * import { BinaryHeap } from "@std/data-structures";
   *
   * const heap = BinaryHeap.from((function*() { yield* [4, 1, 3, 5, 2]; })());
   * ```
   *
   * @example 从现有二叉堆创建二叉堆
   * ```ts no-assert
   * import { BinaryHeap } from "@std/data-structures";
   *
   * const heap = BinaryHeap.from([4, 1, 3, 5, 2]);
   * const copy = BinaryHeap.from(heap);
   * ```
   *
   * @example 从类似数组创建具有自定义比较函数的二叉堆
   * ```ts no-assert
   * import { BinaryHeap, ascend } from "@std/data-structures";
   *
   * const heap = BinaryHeap.from([4, 1, 3, 5, 2], { compare: ascend });
   * ```
   *
   * @typeparam T 二叉堆中存储的值的类型。
   * @param collection 类似数组、可迭代对象或现有二叉堆。
   * @param options 可选的选项对象，用于自定义比较函数。
   * @returns 一个包含传递集合中值的新二叉堆。
   */
  static from<T>(
    collection: ArrayLike<T> | Iterable<T> | BinaryHeap<T>,
    options?: {
      compare?: (a: T, b: T) => number;
    },
  ): BinaryHeap<T>;
  /**
   * 从类似数组、可迭代对象或现有二叉堆创建一个新的二叉堆。
   *
   * 可以提供自定义映射函数以在将值插入堆之前对其进行转换。
   *
   * 可以提供自定义比较函数以按特定顺序对值进行排序。默认情况下，值按降序排序，
   * 除非传递了 {@link BinaryHeap}，此时比较函数将从输入堆中复制。比较运算符用于
   * 在映射值后对堆中的值进行排序。
   *
   * @example 从类似数组创建具有自定义映射函数的二叉堆
   * ```ts ignore
   * import { BinaryHeap } from "@std/data-structures";
   *
   * const heap = BinaryHeap.from([4, 1, 3, 5, 2], { map: (value) => value * 2 });
   * ```
   *
   * @typeparam T 传递集合中值的类型。
   * @typeparam U 二叉堆中存储的值的类型。
   * @typeparam V 调用映射函数时的 `this` 值的类型。默认为 `undefined`。
   * @param collection 类似数组、可迭代对象或现有二叉堆。
   * @param options 用于自定义映射和比较函数的选项对象。`thisArg` 属性可用于设置调用映射函数时的 `this` 值。
   * @returns 一个包含传递集合中映射值的新二叉堆。
   */
  static from<T, U, V = undefined>(
    collection: ArrayLike<T> | Iterable<T> | BinaryHeap<T>,
    options: {
      compare?: (a: U, b: U) => number;
      map: (value: T, index: number) => U;
      thisArg?: V;
    },
  ): BinaryHeap<U>;
  static from<T, U, V>(
    collection: ArrayLike<T> | Iterable<T> | BinaryHeap<T>,
    options?: {
      compare?: (a: U, b: U) => number;
      map?: (value: T, index: number) => U;
      thisArg?: V;
    },
  ): BinaryHeap<U> {
    let result: BinaryHeap<U>;
    let unmappedValues: ArrayLike<T> | Iterable<T> = [];
    if (collection instanceof BinaryHeap) {
      result = new BinaryHeap(
        options?.compare ?? (collection as unknown as BinaryHeap<U>).#compare,
      );
      if (options?.compare || options?.map) {
        unmappedValues = collection.#data;
      } else {
        result.#data = Array.from(collection.#data as unknown as U[]);
      }
    } else {
      result = options?.compare
        ? new BinaryHeap(options.compare)
        : new BinaryHeap();
      unmappedValues = collection;
    }
    const values: Iterable<U> = options?.map
      ? Array.from(unmappedValues, options.map, options.thisArg)
      : (unmappedValues as U[]);
    result.push(...values);
    return result;
  }

  /**
   * 返回二叉堆中存储值的数量。
   *
   * 该操作的时间复杂度为 O(1)。
   *
   * @example 获取二叉堆的长度
   * ```ts
   * import { BinaryHeap } from "@std/data-structures";
   * import { assertEquals } from "@std/assert";
   *
   * const heap = BinaryHeap.from([4, 1, 3, 5, 2]);
   *
   * assertEquals(heap.length, 5);
   * ```
   *
   * @returns 二叉堆中存储值的数量。
   */
  get length(): number {
    return this.#data.length;
  }

  /**
   * 获取二叉堆中最大的值而不移除它，或者如果堆为空则返回 undefined。
   *
   * 该操作的时间复杂度为 O(1)。
   *
   * @example 获取二叉堆中的最大值
   * ```ts
   * import { BinaryHeap } from "@std/data-structures";
   * import { assertEquals } from "@std/assert";
   *
   * const heap = BinaryHeap.from([4, 1, 3, 5, 2]);
   *
   * assertEquals(heap.peek(), 5);
   * ```
   *
   * @example 从空的二叉堆中获取最大值
   * ```ts
   * import { BinaryHeap } from "@std/data-structures";
   * import { assertEquals } from "@std/assert";
   *
   * const heap = new BinaryHeap<number>();
   *
   * assertEquals(heap.peek(), undefined);
   * ```
   *
   * @returns 二叉堆中的最大值，或者如果堆为空则返回 undefined。
   */
  peek(): T | undefined {
    return this.#data[0];
  }

  /**
   * 移除二叉堆中的最大值并返回它，或者如果堆为空则返回 undefined。
   *
   * @example 从二叉堆中移除最大值
   * ```ts
   * import { BinaryHeap } from "@std/data-structures";
   * import { assertEquals } from "@std/assert";
   *
   * const heap = BinaryHeap.from([4, 1, 3, 5, 2]);
   *
   * assertEquals(heap.pop(), 5);
   * assertEquals([...heap], [4, 3, 2, 1]);
   * ```
   *
   * 该操作的时间复杂度在平均和最坏情况下为 O(log n)，其中 n 是二叉堆中存储值的数量。
   *
   * @example 从空的二叉堆中移除最大值
   * ```ts
   * import { BinaryHeap } from "@std/data-structures";
   * import { assertEquals } from "@std/assert";
   *
   * const heap = new BinaryHeap<number>();
   *
   * assertEquals(heap.pop(), undefined);
   * ```
   *
   * @returns 二叉堆中的最大值，或者如果堆为空则返回 undefined。
   */
  pop(): T | undefined {
    const size: number = this.#data.length - 1;
    swap(this.#data, 0, size);
    let parent = 0;
    let right: number = 2 * (parent + 1);
    let left: number = right - 1;
    while (left < size) {
      const greatestChild =
        right === size ||
        this.#compare(this.#data[left]!, this.#data[right]!) <= 0
          ? left
          : right;
      if (this.#compare(this.#data[greatestChild]!, this.#data[parent]!) < 0) {
        swap(this.#data, parent, greatestChild);
        parent = greatestChild;
      } else {
        break;
      }
      right = 2 * (parent + 1);
      left = right - 1;
    }
    return this.#data.pop();
  }

  /**
   * 向二叉堆中添加一个或多个值，并返回堆的新长度。
   *
   * 该操作的时间复杂度在平均情况下为 O(1)，在最坏情况下为 O(log n)，其中 n 是二叉堆中存储值的数量。
   *
   * @example 向二叉堆中添加值
   * ```ts
   * import { BinaryHeap } from "@std/data-structures";
   * import { assertEquals } from "@std/assert";
   *
   * const heap = BinaryHeap.from([4, 1, 3, 2]);
   * heap.push(5);
   *
   * assertEquals([...heap], [5, 4, 3, 2, 1]);
   * ```
   *
   * @param values 要添加到二叉堆中的值。
   * @returns 二叉堆的新长度。
   */
  push(...values: T[]): number {
    for (const value of values) {
      let index: number = this.#data.length;
      let parent: number = getParentIndex(index);
      this.#data.push(value);
      while (
        index !== 0 &&
        this.#compare(this.#data[index]!, this.#data[parent]!) < 0
      ) {
        swap(this.#data, parent, index);
        index = parent;
        parent = getParentIndex(index);
      }
    }
    return this.#data.length;
  }

  /**
   * 移除二叉堆中的所有值。
   *
   * @example 清空二叉堆
   * ```ts
   * import { BinaryHeap } from "@std/data-structures";
   * import { assertEquals } from "@std/assert";
   *
   * const heap = BinaryHeap.from([4, 1, 3, 5, 2]);
   * heap.clear();
   *
   * assertEquals([...heap], []);
   * ```
   */
  clear() {
    this.#data = [];
  }

  /**
   * 检查二叉堆是否为空。
   *
   * @example 检查二叉堆是否为空
   * ```ts
   * import { BinaryHeap } from "@std/data-structures";
   * import { assertEquals } from "@std/assert";
   *
   * const heap = new BinaryHeap<number>();
   *
   * assertEquals(heap.isEmpty(), true);
   *
   * heap.push(42);
   *
   * assertEquals(heap.isEmpty(), false);
   * ```
   *
   * @returns 如果二叉堆为空，则返回 true，否则返回 false。
   */
  isEmpty(): boolean {
    return this.#data.length === 0;
  }

  /**
   * 创建一个迭代器，按从大到小的顺序检索并移除二叉堆中的值。
   *
   * 要避免消耗二叉堆，请使用 {@link BinaryHeap.from} 创建一个副本，然后在副本上调用 {@link BinaryHeap.prototype.drain}。
   *
   * @example 排空二叉堆
   * ```ts
   * import { BinaryHeap } from "@std/data-structures";
   * import { assertEquals } from "@std/assert";
   *
   * const heap = BinaryHeap.from([4, 1, 3, 5, 2]);
   *
   * assertEquals([...heap.drain()], [ 5, 4, 3, 2, 1 ]);
   * assertEquals([...heap.drain()], []);
   * ```
   *
   * @returns 一个用于检索和移除二叉堆中值的迭代器。
   */
  *drain(): IterableIterator<T> {
    while (!this.isEmpty()) {
      yield this.pop() as T;
    }
  }

  /**
   * 创建一个迭代器，按从大到小的顺序检索并移除二叉堆中的值。
   *
   * @example 获取二叉堆的迭代器
   * ```ts
   * import { BinaryHeap } from "@std/data-structures";
   * import { assertEquals } from "@std/assert";
   *
   * const heap = BinaryHeap.from([4, 1, 3, 5, 2]);
   *
   * assertEquals([...heap], [ 5, 4, 3, 2, 1 ]);
   * assertEquals([...heap], []);
   * ```
   *
   * @returns 一个用于检索和移除二叉堆中值的迭代器。
   */
  *[Symbol.iterator](): IterableIterator<T> {
    yield* this.drain();
  }
}
