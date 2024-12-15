// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

import { ascend } from './comparators.ts';
import { BinarySearchTree } from './binary_search_tree.ts';
import { type Direction, RedBlackNode } from './_red_black_node.ts';
import { internals } from './_binary_search_tree_internals.ts';

const {
  getRoot,
  setRoot,
  getCompare,
  findNode,
  rotateNode,
  insertNode,
  removeNode,
} = internals;

/**
 * 红黑树。这是一种自平衡的二叉搜索树。
 * 默认情况下，值按升序排列，使用 JavaScript 内置的比较运算符对值进行排序。
 *
 * 红黑树所需的旋转次数比 AVL 树少，因此可以提供更快的插入和删除操作。
 * 如果需要更快的查找，应该使用 AVL 树。AVL 树比红黑树更严格地平衡，因此可以提供更快的查找。
 *
 * | 方法          | 平均情况    | 最坏情况   |
 * | ------------- | ------------ | ---------- |
 * | find(value)   | O(log n)     | O(log n)   |
 * | insert(value) | O(log n)     | O(log n)   |
 * | remove(value) | O(log n)     | O(log n)   |
 * | min()         | O(log n)     | O(log n)   |
 * | max()         | O(log n)     | O(log n)   |
 *
 * @example 用法示例
 * ```ts
 * import {
 *   ascend,
 *   descend,
 *   RedBlackTree,
 * } from "@std/data-structures";
 * import { assertEquals } from "@std/assert";
 *
 * const values = [3, 10, 13, 4, 6, 7, 1, 14];
 * const tree = new RedBlackTree<number>();
 * values.forEach((value) => tree.insert(value));
 * assertEquals([...tree], [1, 3, 4, 6, 7, 10, 13, 14]);
 * assertEquals(tree.min(), 1);
 * assertEquals(tree.max(), 14);
 * assertEquals(tree.find(42), null);
 * assertEquals(tree.find(7), 7);
 * assertEquals(tree.remove(42), false);
 * assertEquals(tree.remove(7), true);
 * assertEquals([...tree], [1, 3, 4, 6, 10, 13, 14]);
 *
 * const invertedTree = new RedBlackTree<number>(descend);
 * values.forEach((value) => invertedTree.insert(value));
 * assertEquals([...invertedTree], [14, 13, 10, 7, 6, 4, 3, 1]);
 * assertEquals(invertedTree.min(), 14);
 * assertEquals(invertedTree.max(), 1);
 * assertEquals(invertedTree.find(42), null);
 * assertEquals(invertedTree.find(7), 7);
 * assertEquals(invertedTree.remove(42), false);
 * assertEquals(invertedTree.remove(7), true);
 * assertEquals([...invertedTree], [14, 13, 10, 6, 4, 3, 1]);
 *
 * const words = new RedBlackTree<string>((a, b) =>
 *   ascend(a.length, b.length) || ascend(a, b)
 * );
 * ["truck", "car", "helicopter", "tank", "train", "suv", "semi", "van"]
 *   .forEach((value) => words.insert(value));
 * assertEquals([...words], [
 *   "car",
 *   "suv",
 *   "van",
 *   "semi",
 *   "tank",
 *   "train",
 *   "truck",
 *   "helicopter",
 * ]);
 * assertEquals(words.min(), "car");
 * assertEquals(words.max(), "helicopter");
 * assertEquals(words.find("scooter"), null);
 * assertEquals(words.find("tank"), "tank");
 * assertEquals(words.remove("scooter"), false);
 * assertEquals(words.remove("tank"), true);
 * assertEquals([...words], [
 *   "car",
 *   "suv",
 *   "van",
 *   "semi",
 *   "train",
 *   "truck",
 *   "helicopter",
 * ]);
 * ```
 *
 * @typeparam T 存储在树中的值的类型。
 */
export class RedBlackTree<T> extends BinarySearchTree<T> {
  /**
   * 构造一个空的红黑树。
   *
   * @param compare 值的自定义比较函数。默认的比较函数按升序排序。
   */
  constructor(compare: (a: T, b: T) => number = ascend) {
    if (typeof compare !== 'function') {
      throw new TypeError(
        "无法构造 RedBlackTree：'compare' 参数不是函数，是否想调用 RedBlackTree.from？",
      );
    }
    super(compare);
  }

  /**
   * 从类数组、可迭代对象或现有红黑树创建一个新的红黑树。
   *
   * 可以提供自定义比较函数以特定顺序对值进行排序。默认情况下，值按升序排序，
   * 除非传入的是 {@link RedBlackTree}，此时比较函数将从输入树中复制。
   *
   * @example 从类数组创建红黑树
   * ```ts no-assert
   * import { RedBlackTree } from "@std/data-structures";
   *
   * const tree = RedBlackTree.from<number>([3, 10, 13, 4, 6, 7, 1, 14]);
   * ```
   *
   * @example 从可迭代对象创建红黑树
   * ```ts no-assert
   * import { RedBlackTree } from "@std/data-structures";
   *
   * const tree = RedBlackTree.from<number>((function*() {
   *   yield 3;
   *   yield 10;
   *   yield 13;
   * })());
   * ```
   *
   * @example 从现有红黑树创建红黑树
   * ```ts no-assert
   * import { RedBlackTree } from "@std/data-structures";
   *
   * const tree = RedBlackTree.from<number>([3, 10, 13, 4, 6, 7, 1, 14]);
   * const copy = RedBlackTree.from(tree);
   * ```
   *
   * @example 使用自定义比较函数从类数组创建红黑树
   * ```ts no-assert
   * import { RedBlackTree, descend } from "@std/data-structures";
   *
   * const tree = RedBlackTree.from<number>([3, 10, 13, 4, 6, 7, 1, 14], {
   *  compare: descend,
   * });
   * ```
   *
   * @typeparam T 存储在树中的值的类型。
   * @param collection 类数组、可迭代对象或现有红黑树。
   * @param options 可选选项对象，用于自定义比较函数。
   * @returns 一个包含传入集合值的新红黑树。
   */
  static override from<T>(
    collection: ArrayLike<T> | Iterable<T> | RedBlackTree<T>,
    options?: {
      compare?: (a: T, b: T) => number;
    },
  ): RedBlackTree<T>;
  /**
   * 从类数组、可迭代对象或现有红黑树创建一个新的红黑树。
   *
   * 可以提供自定义映射函数在插入值之前转换它们。
   *
   * 可以提供自定义比较函数以特定顺序对值进行排序。可以提供自定义映射函数在插入值之前转换它们。
   * 默认情况下，值按升序排序，除非传入的是 {@link RedBlackTree}，此时比较函数将从输入树中复制。映射后的值使用比较运算符排序。
   *
   * @example 使用自定义映射函数从类数组创建红黑树
   * ```ts no-assert
   * import { RedBlackTree } from "@std/data-structures";
   *
   * const tree = RedBlackTree.from<number, string>([3, 10, 13, 4, 6, 7, 1, 14], {
   *   map: (value) => value.toString(),
   * });
   * ```

   * @typeparam T 传入集合中值的类型。
   * @typeparam U 存储在红黑树中的值的类型。
   * @typeparam V 映射函数中 `this` 上下文的类型。默认为 `undefined`。
   * @param collection 类数组、可迭代对象或现有红黑树。
   * @param options 选项对象，用于自定义映射和比较函数。`thisArg` 属性可用于在调用映射函数时设置 `this` 值。
   * @returns 一个包含映射后值的新红黑树。
   */
  static override from<T, U, V = undefined>(
    collection: ArrayLike<T> | Iterable<T> | RedBlackTree<T>,
    options: {
      compare?: (a: U, b: U) => number;
      map: (value: T, index: number) => U;
      thisArg?: V;
    },
  ): RedBlackTree<U>;
  static override from<T, U, V>(
    collection: ArrayLike<T> | Iterable<T> | RedBlackTree<T>,
    options?: {
      compare?: (a: U, b: U) => number;
      map?: (value: T, index: number) => U;
      thisArg?: V;
    },
  ): RedBlackTree<U> {
    let result: RedBlackTree<U>;
    let unmappedValues: ArrayLike<T> | Iterable<T> = [];
    if (collection instanceof RedBlackTree) {
      result = new RedBlackTree(
        options?.compare ??
          getCompare(collection as unknown as RedBlackTree<U>),
      );
      if (options?.compare || options?.map) {
        unmappedValues = collection;
      } else {
        const nodes: RedBlackNode<U>[] = [];
        const root = getRoot(collection);
        if (root) {
          setRoot(result, root as unknown as RedBlackNode<U>);
          nodes.push(root as unknown as RedBlackNode<U>);
        }
        while (nodes.length) {
          const node: RedBlackNode<U> = nodes.pop()!;
          const left: RedBlackNode<U> | null = node.left
            ? RedBlackNode.from(node.left)
            : null;
          const right: RedBlackNode<U> | null = node.right
            ? RedBlackNode.from(node.right)
            : null;

          if (left) {
            left.parent = node;
            nodes.push(left);
          }
          if (right) {
            right.parent = node;
            nodes.push(right);
          }
        }
      }
    } else {
      result = (
        options?.compare
          ? new RedBlackTree(options.compare)
          : new RedBlackTree()
      ) as RedBlackTree<U>;
      unmappedValues = collection;
    }
    const values: Iterable<U> = options?.map
      ? Array.from(unmappedValues, options.map, options.thisArg)
      : (unmappedValues as U[]);
    for (const value of values) result.insert(value);
    return result;
  }

  #removeFixup(
    parent: RedBlackNode<T> | null,
    current: RedBlackNode<T> | null,
  ) {
    while (parent && !current?.red) {
      const direction: Direction = parent.left === current ? 'left' : 'right';
      const siblingDirection: Direction =
        direction === 'right' ? 'left' : 'right';
      let sibling: RedBlackNode<T> | null = parent[siblingDirection];

      if (sibling?.red) {
        sibling.red = false;
        parent.red = true;
        rotateNode(this, parent, direction);
        sibling = parent[siblingDirection];
      }
      if (sibling) {
        if (!sibling.left?.red && !sibling.right?.red) {
          sibling!.red = true;
          current = parent;
          parent = current.parent;
        } else {
          if (!sibling[siblingDirection]?.red) {
            sibling[direction]!.red = false;
            sibling.red = true;
            rotateNode(this, sibling, siblingDirection);
            sibling = parent[siblingDirection!];
          }
          sibling!.red = parent.red;
          parent.red = false;
          sibling![siblingDirection]!.red = false;
          rotateNode(this, parent, direction);
          current = getRoot(this) as RedBlackNode<T>;
          parent = null;
        }
      }
    }
    if (current) current.red = false;
  }

  /**
   * 如果值尚不存在于树中，则将其添加到红黑树中。
   *
   * 该操作的复杂度平均和最坏情况均为 O(log n)，其中
   * n 是树中的值的数量。
   *
   * @example 向树中插入值
   * ```ts
   * import { RedBlackTree } from "@std/data-structures";
   * import { assertEquals } from "@std/assert";
   *
   * const tree = new RedBlackTree<number>();
   *
   * assertEquals(tree.insert(42), true);
   * assertEquals(tree.insert(42), false);
   * ```
   *
   * @param value 要插入到树中的值。
   * @returns 如果值被插入，返回 `true`；如果值已存在于树中，返回 `false`。
   */
  override insert(value: T): boolean {
    let node = insertNode(this, RedBlackNode, value) as RedBlackNode<T> | null;
    if (node) {
      while (node.parent?.red) {
        let parent: RedBlackNode<T> = node.parent!;
        const parentDirection: Direction = parent.directionFromParent()!;
        const uncleDirection: Direction =
          parentDirection === 'right' ? 'left' : 'right';
        const uncle: RedBlackNode<T> | null =
          parent.parent![uncleDirection] ?? null;

        if (uncle?.red) {
          parent.red = false;
          uncle.red = false;
          parent.parent!.red = true;
          node = parent.parent!;
        } else {
          if (node === parent[uncleDirection]) {
            node = parent;
            rotateNode(this, node, parentDirection);
            parent = node.parent!;
          }
          parent.red = false;
          parent.parent!.red = true;
          rotateNode(this, parent.parent!, uncleDirection);
        }
      }
      (getRoot(this) as RedBlackNode<T>).red = false;
    }
    return !!node;
  }

  /**
   * 如果值存在于树中，则将其从红黑树中移除。
   *
   * 该操作的复杂度平均和最坏情况均为 O(log n)，其中
   * n 是树中的值的数量。
   *
   * @example 从树中移除值
   * ```ts
   * import { RedBlackTree } from "@std/data-structures";
   * import { assertEquals } from "@std/assert";
   *
   * const tree = RedBlackTree.from<number>([42]);
   *
   * assertEquals(tree.remove(42), true);
   * assertEquals(tree.remove(42), false);
   * ```
   *
   * @param value 要从树中移除的值。
   * @returns 如果找到并移除该值，返回 `true`；如果未找到该值，返回 `false`。
   */
  override remove(value: T): boolean {
    const node = findNode(this, value) as RedBlackNode<T> | null;

    if (!node) {
      return false;
    }

    const removedNode = removeNode(this, node) as RedBlackNode<T> | null;

    if (removedNode && !removedNode.red) {
      this.#removeFixup(
        removedNode.parent,
        removedNode.left ?? removedNode.right,
      );
    }

    return true;
  }
}
