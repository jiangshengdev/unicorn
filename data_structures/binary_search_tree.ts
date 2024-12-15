// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

import { ascend } from './comparators.ts';
import { BinarySearchNode } from './_binary_search_node.ts';
import { internals } from './_binary_search_tree_internals.ts';

type Direction = 'left' | 'right';

/**
 * 一个未平衡的二叉搜索树。默认情况下，值按升序排列，
 * 使用 JavaScript 内置的比较运算符对值进行排序。
 *
 * 为了性能，建议使用自平衡的二叉搜索树，
 * 除非你正在扩展此树以创建自平衡树，
 * 否则不要使用此树。请参见 {@link RedBlackTree} 了解如何
 * 扩展 BinarySearchTree 创建自平衡二叉搜索树的示例。
 *
 * | 方法         | 平均情况 | 最坏情况 |
 * | ------------ | -------- | -------- |
 * | find(value)  | O(log n) | O(n)     |
 * | insert(value)| O(log n) | O(n)     |
 * | remove(value)| O(log n) | O(n)     |
 * | min()        | O(log n) | O(n)     |
 * | max()        | O(log n) | O(n)     |
 *
 * @example 用法
 * ```ts
 * import {
 *   BinarySearchTree,
 *   ascend,
 *   descend,
 * } from "@std/data-structures";
 * import { assertEquals } from "@std/assert";
 *
 * const values = [3, 10, 13, 4, 6, 7, 1, 14];
 * const tree = new BinarySearchTree<number>();
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
 * const invertedTree = new BinarySearchTree<number>(descend);
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
 * const words = new BinarySearchTree<string>((a, b) =>
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
 * @typeparam T 存储在二叉搜索树中的值的类型。
 */
export class BinarySearchTree<T> implements Iterable<T> {
  #root: BinarySearchNode<T> | null = null;
  #size = 0;
  #compare: (a: T, b: T) => number;

  /**
   * 构造一个空的二叉搜索树。
   *
   * 要从数组类、可迭代对象或现有二叉搜索树创建二叉搜索树，请使用 {@link BinarySearchTree.from} 方法。
   *
   * @param compare 一个自定义比较函数，用于对树中的值进行排序。
   * 默认情况下，值按升序排序。
   */
  constructor(compare: (a: T, b: T) => number = ascend) {
    if (typeof compare !== 'function') {
      throw new TypeError(
        "Cannot construct a BinarySearchTree: the 'compare' parameter is not a function, did you mean to call BinarySearchTree.from?",
      );
    }
    this.#compare = compare;
  }

  static {
    internals.getRoot = <T>(tree: BinarySearchTree<T>) => tree.#root;
    internals.setRoot = <T>(
      tree: BinarySearchTree<T>,
      node: BinarySearchNode<T> | null,
    ) => {
      tree.#root = node;
    };
    internals.getCompare = <T>(tree: BinarySearchTree<T>) => tree.#compare;
    internals.findNode = <T>(
      tree: BinarySearchTree<T>,
      value: T,
    ): BinarySearchNode<T> | null => tree.#findNode(value);
    internals.rotateNode = <T>(
      tree: BinarySearchTree<T>,
      node: BinarySearchNode<T>,
      direction: Direction,
    ) => tree.#rotateNode(node, direction);
    internals.insertNode = <T>(
      tree: BinarySearchTree<T>,
      Node: typeof BinarySearchNode,
      value: T,
    ): BinarySearchNode<T> | null => tree.#insertNode(Node, value);
    internals.removeNode = <T>(
      tree: BinarySearchTree<T>,
      node: BinarySearchNode<T>,
    ): BinarySearchNode<T> | null => tree.#removeNode(node);
  }

  /**
   * 从数组类、可迭代对象或现有二叉搜索树创建一个新的二叉搜索树。
   *
   * 可以提供自定义比较函数以按特定顺序对值进行排序。
   * 默认情况下，值按升序排序，除非传递了 {@link BinarySearchTree}，
   * 此时比较函数将从输入树中复制。
   *
   * @example 从数组类创建二叉搜索树
   * ```ts no-assert
   * import { BinarySearchTree } from "@std/data-structures";
   *
   * const tree = BinarySearchTree.from<number>([42, 43, 41]);
   * ```
   *
   * @example 从可迭代对象创建二叉搜索树
   * ```ts no-assert
   * import { BinarySearchTree } from "@std/data-structures";
   *
   * const tree = BinarySearchTree.from<number>((function*() {
   *   yield 42;
   *   yield 43;
   *   yield 41;
   * })());
   * ```
   *
   * @example 从现有二叉搜索树创建二叉搜索树
   * ```ts no-assert
   * import { BinarySearchTree } from "@std/data-structures";
   *
   * const tree = BinarySearchTree.from<number>([42, 43, 41]);
   * const copy = BinarySearchTree.from(tree);
   * ```
   *
   * @example 使用自定义比较函数从数组类创建二叉搜索树
   * ```ts no-assert
   * import { BinarySearchTree, descend } from "@std/data-structures";
   *
   * const tree = BinarySearchTree.from<number>(
   *   [42, 43, 41],
   *   { compare: descend }
   * );
   * ```
   *
   * @typeparam T 存储在二叉搜索树中的值的类型。
   * @param collection 一个数组类、可迭代对象或现有二叉搜索树。
   * @param options 一个可选的选项对象，用于自定义比较函数。
   * @returns 一个从传递的集合创建的新二叉搜索树。
   */
  static from<T>(
    collection: ArrayLike<T> | Iterable<T> | BinarySearchTree<T>,
    options?: {
      compare?: (a: T, b: T) => number;
    },
  ): BinarySearchTree<T>;
  /**
   * 从数组类、可迭代对象或现有二叉搜索树创建一个新的二叉搜索树。
   *
   * 可以提供自定义映射函数，以在将值插入树之前转换它们。
   *
   * 可以提供自定义比较函数以按特定顺序对值进行排序。默认情况下，值按升序排序，
   * 除非传递了 {@link BinarySearchTree}，此时比较函数将从输入树中复制。
   * 比较运算符用于在映射值后对树中的值进行排序。
   *
   * @example 使用自定义映射函数从数组类创建二叉搜索树
   * ```ts no-assert
   * import { BinarySearchTree } from "@std/data-structures";
   *
   * const tree = BinarySearchTree.from<number, string>(
   *   [42, 43, 41],
   *   { map: (value) => value.toString() }
   * );
   * ```
   *
   * @typeparam T 传递集合中值的类型。
   * @typeparam U 二叉搜索树中存储的值的类型。
   * @typeparam V 调用映射函数时的 `this` 值的类型。默认为 `undefined`。
   * @param collection 一个数组类、可迭代对象或现有二叉搜索树。
   * @param options 一个选项对象，用于自定义映射和比较函数。`thisArg` 属性可用于设置调用映射函数时的 `this` 值。
   * @returns 一个包含从传递的集合中映射值的新二叉搜索树。
   */
  static from<T, U, V = undefined>(
    collection: ArrayLike<T> | Iterable<T> | BinarySearchTree<T>,
    options: {
      compare?: (a: U, b: U) => number;
      map: (value: T, index: number) => U;
      thisArg?: V;
    },
  ): BinarySearchTree<U>;
  static from<T, U, V>(
    collection: ArrayLike<T> | Iterable<T> | BinarySearchTree<T>,
    options?: {
      compare?: (a: U, b: U) => number;
      map?: (value: T, index: number) => U;
      thisArg?: V;
    },
  ): BinarySearchTree<U> {
    let result: BinarySearchTree<U>;
    let unmappedValues: ArrayLike<T> | Iterable<T> = [];
    if (collection instanceof BinarySearchTree) {
      result = new BinarySearchTree(
        options?.compare ??
          (collection as unknown as BinarySearchTree<U>).#compare,
      );
      if (options?.compare || options?.map) {
        unmappedValues = collection;
      } else {
        const nodes: BinarySearchNode<U>[] = [];
        if (collection.#root) {
          result.#root = BinarySearchNode.from(
            collection.#root as unknown as BinarySearchNode<U>,
          );
          nodes.push(result.#root);
        }
        while (nodes.length) {
          const node: BinarySearchNode<U> = nodes.pop()!;
          const left: BinarySearchNode<U> | null = node.left
            ? BinarySearchNode.from(node.left)
            : null;
          const right: BinarySearchNode<U> | null = node.right
            ? BinarySearchNode.from(node.right)
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
          ? new BinarySearchTree(options.compare)
          : new BinarySearchTree()
      ) as BinarySearchTree<U>;
      unmappedValues = collection;
    }
    const values: Iterable<U> = options?.map
      ? Array.from(unmappedValues, options.map, options.thisArg)
      : (unmappedValues as U[]);
    for (const value of values) result.insert(value);
    return result;
  }

  /**
   * 二叉搜索树中存储的值的数量。
   *
   * 该操作的时间复杂度为 O(1)。
   *
   * @example 获取树的大小
   * ```ts no-assert
   * import { BinarySearchTree } from "@std/data-structures";
   * import { assertEquals } from "@std/assert";
   *
   * const tree = BinarySearchTree.from<number>([42, 43, 41]);
   *
   * assertEquals(tree.size, 3);
   * ```
   *
   * @returns 二叉搜索树中存储的值的数量。
   */
  get size(): number {
    return this.#size;
  }

  #findNode(value: T): BinarySearchNode<T> | null {
    let node: BinarySearchNode<T> | null = this.#root;
    while (node) {
      const order: number = this.#compare(value as T, node.value);
      if (order === 0) break;
      const direction: 'left' | 'right' = order < 0 ? 'left' : 'right';
      node = node[direction];
    }
    return node;
  }

  #rotateNode(node: BinarySearchNode<T>, direction: Direction) {
    const replacementDirection: Direction =
      direction === 'left' ? 'right' : 'left';
    if (!node[replacementDirection]) {
      throw new TypeError(
        `Cannot rotate ${direction} without ${replacementDirection} child`,
      );
    }
    const replacement: BinarySearchNode<T> = node[replacementDirection]!;
    node[replacementDirection] = replacement[direction] ?? null;
    if (replacement[direction]) replacement[direction]!.parent = node;
    replacement.parent = node.parent;
    if (node.parent) {
      const parentDirection: Direction =
        node === node.parent[direction] ? direction : replacementDirection;
      node.parent[parentDirection] = replacement;
    } else {
      this.#root = replacement;
    }
    replacement[direction] = node;
    node.parent = replacement;
  }

  #insertNode(
    Node: typeof BinarySearchNode,
    value: T,
  ): BinarySearchNode<T> | null {
    if (!this.#root) {
      this.#root = new Node(null, value);
      this.#size++;
      return this.#root;
    } else {
      let node: BinarySearchNode<T> = this.#root;
      while (true) {
        const order: number = this.#compare(value, node.value);
        if (order === 0) break;
        const direction: Direction = order < 0 ? 'left' : 'right';
        if (node[direction]) {
          node = node[direction]!;
        } else {
          node[direction] = new Node(node, value);
          this.#size++;
          return node[direction];
        }
      }
    }
    return null;
  }

  /** 移除给定节点，并返回物理上从树中移除的节点。 */
  #removeNode(node: BinarySearchNode<T>): BinarySearchNode<T> | null {
    /**
     * 要从树中物理移除的节点。
     * 保证最多只有一个子节点。
     */
    const flaggedNode: BinarySearchNode<T> | null =
      !node.left || !node.right ? node : node.findSuccessorNode()!;
    /** 替换标记节点的节点。 */
    const replacementNode: BinarySearchNode<T> | null =
      flaggedNode.left ?? flaggedNode.right;

    if (replacementNode) replacementNode.parent = flaggedNode.parent;
    if (!flaggedNode.parent) {
      this.#root = replacementNode;
    } else {
      flaggedNode.parent[flaggedNode.directionFromParent()!] = replacementNode;
    }
    if (flaggedNode !== node) {
      /** 交换值，以防移除的节点的值仍然被消费者需要。 */
      const swapValue = node.value;
      node.value = flaggedNode.value;
      flaggedNode.value = swapValue;
    }

    this.#size--;
    return flaggedNode;
  }

  /**
   * 如果值尚不存在于树中，则将其添加到二叉搜索树中。
   *
   * 该操作的复杂度平均为 O(log n)，其中 n 是树中值的数量。在最坏情况下，复杂度为 O(n)。
   *
   * @example 向树中插入值
   * ```ts
   * import { BinarySearchTree } from "@std/data-structures";
   * import { assertEquals } from "@std/assert";
   *
   * const tree = new BinarySearchTree<number>();
   *
   * assertEquals(tree.insert(42), true);
   * assertEquals(tree.insert(42), false);
   * ```
   *
   * @param value 要插入到二叉搜索树中的值。
   * @returns 如果值被插入，则返回 `true`；如果值已存在于树中，则返回 `false`。
   */
  insert(value: T): boolean {
    return !!this.#insertNode(BinarySearchNode, value);
  }

  /**
   * 如果值存在于树中，则将其从二叉搜索树中移除。
   *
   * 该操作的复杂度平均为 O(log n)，其中 n 是树中值的数量。在最坏情况下，复杂度为 O(n)。
   *
   * @example 从树中移除值
   * ```ts
   * import { BinarySearchTree } from "@std/data-structures";
   * import { assertEquals } from "@std/assert";
   *
   * const tree = BinarySearchTree.from<number>([42]);
   *
   * assertEquals(tree.remove(42), true);
   * assertEquals(tree.remove(42), false);
   * ```
   *
   * @param value 要从二叉搜索树中移除的值。
   * @returns 如果找到并移除该值，则返回 `true`；如果未在树中找到该值，则返回 `false`。
   */
  remove(value: T): boolean {
    const node: BinarySearchNode<T> | null = this.#findNode(value);
    if (node) this.#removeNode(node);
    return node !== null;
  }

  /**
   * 检查一个值是否存在于二叉搜索树中。
   *
   * 该操作的复杂度取决于树的底层结构。有关更多详细信息，请参阅结构本身的文档。
   *
   * @example 在树中查找值
   * ```ts
   * import { BinarySearchTree } from "@std/data-structures";
   * import { assertEquals } from "@std/assert";
   *
   * const tree = BinarySearchTree.from<number>([42]);
   *
   * assertEquals(tree.find(42), 42);
   * assertEquals(tree.find(43), null);
   * ```
   *
   * @param value 要在二叉搜索树中搜索的值。
   * @returns 如果找到该值，则返回该值；否则返回 `null`。
   */
  find(value: T): T | null {
    return this.#findNode(value)?.value ?? null;
  }

  /**
   * 获取二叉搜索树中最小（最左边）的值，或者如果树为空则返回 `null`。
   *
   * 该操作的复杂度取决于树的底层结构。有关更多详细信息，请参阅结构本身的文档。
   *
   * @example 查找树中的最小值
   * ```ts
   * import { BinarySearchTree } from "@std/data-structures";
   * import { assertEquals } from "@std/assert";
   *
   * const tree = BinarySearchTree.from<number>([42, 43, 41]);
   *
   * assertEquals(tree.min(), 41);
   * ```
   *
   * @returns 二叉搜索树中的最小值，或者如果树为空则返回 `null`。
   */
  min(): T | null {
    return this.#root ? this.#root.findMinNode().value : null;
  }

  /**
   * 获取二叉搜索树中最大（最右边）的值，或者如果树为空则返回 `null`。
   *
   * 该操作的复杂度取决于树的底层结构。有关更多详细信息，请参阅结构本身的文档。
   *
   * @example 查找树中的最大值
   * ```ts
   * import { BinarySearchTree } from "@std/data-structures";
   * import { assertEquals } from "@std/assert";
   *
   * const tree = BinarySearchTree.from<number>([42, 43, 41]);
   *
   * assertEquals(tree.max(), 43);
   * ```
   *
   * @returns 二叉搜索树中的最大值，或者如果树为空则返回 `null`。
   */
  max(): T | null {
    return this.#root ? this.#root.findMaxNode().value : null;
  }

  /**
   * 从二叉搜索树中移除所有值。
   *
   * 该操作的复杂度为 O(1)。
   *
   * @example 清空树
   * ```ts
   * import { BinarySearchTree } from "@std/data-structures";
   * import { assertEquals } from "@std/assert";
   *
   * const tree = BinarySearchTree.from<number>([42, 43, 41]);
   * tree.clear();
   *
   * assertEquals(tree.size, 0);
   * assertEquals(tree.find(42), null);
   * ```
   */
  clear() {
    this.#root = null;
    this.#size = 0;
  }

  /**
   * 检查二叉搜索树是否为空。
   *
   * 该操作的复杂度为 O(1)。
   *
   * @example 检查树是否为空
   * ```ts
   * import { BinarySearchTree } from "@std/data-structures";
   * import { assertEquals } from "@std/assert";
   *
   * const tree = new BinarySearchTree<number>();
   *
   * assertEquals(tree.isEmpty(), true);
   *
   * tree.insert(42);
   *
   * assertEquals(tree.isEmpty(), false);
   * ```
   *
   * @returns 如果二叉搜索树为空，则返回 `true`；否则返回 `false`。
   */
  isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * 创建一个遍历此树的迭代器，按中序遍历（LNR，左-节点-右）。
   *
   * @example 使用中序 LNR 迭代器
   * ```ts
   * import { BinarySearchTree } from "@std/data-structures";
   * import { assertEquals } from "@std/assert";
   *
   * const tree = BinarySearchTree.from([4, 1, 2, 5, 3]);
   *
   * assertEquals([...tree.lnrValues()], [1, 2, 3, 4, 5]);
   * ```
   *
   * @returns 一个按中序遍历（LNR）遍历树的迭代器。
   */
  *lnrValues(): IterableIterator<T> {
    const nodes: BinarySearchNode<T>[] = [];
    let node: BinarySearchNode<T> | null = this.#root;
    while (nodes.length || node) {
      if (node) {
        nodes.push(node);
        node = node.left;
      } else {
        node = nodes.pop()!;
        yield node.value;
        node = node.right;
      }
    }
  }

  /**
   * 创建一个遍历此树的迭代器，按逆中序遍历（RNL，右-节点-左）。
   *
   * @example 使用逆中序 RNL 迭代器
   * ```ts
   * import { BinarySearchTree } from "@std/data-structures";
   * import { assertEquals } from "@std/assert";
   *
   * const tree = BinarySearchTree.from([4, 1, 2, 5, 3]);
   * [...tree.rnlValues()] // 5, 4, 3, 2, 1
   * ```
   *
   * @returns 一个按逆中序遍历（RNL）遍历树的迭代器。
   */
  *rnlValues(): IterableIterator<T> {
    const nodes: BinarySearchNode<T>[] = [];
    let node: BinarySearchNode<T> | null = this.#root;
    while (nodes.length || node) {
      if (node) {
        nodes.push(node);
        node = node.right;
      } else {
        node = nodes.pop()!;
        yield node.value;
        node = node.left;
      }
    }
  }

  /**
   * 创建一个遍历此树的迭代器，按前序遍历（NLR，节点-左-右）。
   *
   * @example 使用前序 NLR 迭代器
   * ```ts
   * import { BinarySearchTree } from "@std/data-structures";
   * import { assertEquals } from "@std/assert";
   *
   * const tree = BinarySearchTree.from([4, 1, 2, 5, 3]);
   *
   * assertEquals([...tree.nlrValues()], [4, 1, 2, 3, 5]);
   * ```
   *
   * @returns 一个按前序遍历（NLR）遍历树的迭代器。
   */
  *nlrValues(): IterableIterator<T> {
    const nodes: BinarySearchNode<T>[] = [];
    if (this.#root) nodes.push(this.#root);
    while (nodes.length) {
      const node: BinarySearchNode<T> = nodes.pop()!;
      yield node.value;
      if (node.right) nodes.push(node.right);
      if (node.left) nodes.push(node.left);
    }
  }

  /**
   * 创建一个遍历此树的迭代器，按后序遍历（LRN，左-右-节点）。
   *
   * @example 使用后序 LRN 迭代器
   * ```ts
   * import { BinarySearchTree } from "@std/data-structures";
   * import { assertEquals } from "@std/assert";
   *
   * const tree = BinarySearchTree.from([4, 1, 2, 5, 3]);
   *
   * assertEquals([...tree.lrnValues()], [3, 2, 1, 5, 4]);
   * ```
   *
   * @returns 一个按后序遍历（LRN）遍历树的迭代器。
   */
  *lrnValues(): IterableIterator<T> {
    const nodes: BinarySearchNode<T>[] = [];
    let node: BinarySearchNode<T> | null = this.#root;
    let lastNodeVisited: BinarySearchNode<T> | null = null;
    while (nodes.length || node) {
      if (node) {
        nodes.push(node);
        node = node.left;
      } else {
        const lastNode: BinarySearchNode<T> = nodes.at(-1)!;
        if (lastNode.right && lastNode.right !== lastNodeVisited) {
          node = lastNode.right;
        } else {
          yield lastNode.value;
          lastNodeVisited = nodes.pop()!;
        }
      }
    }
  }

  /**
   * 创建一个遍历此树的迭代器，按层序遍历（BFS，宽度优先搜索）。
   *
   * @example 使用层序 BFS 迭代器
   * ```ts
   * import { BinarySearchTree } from "@std/data-structures";
   * import { assertEquals } from "@std/assert";
   *
   * const tree = BinarySearchTree.from([4, 1, 2, 5, 3]);
   *
   * assertEquals([...tree.lvlValues()], [4, 1, 5, 2, 3]);
   * ```
   *
   * @returns 一个按层序遍历（BFS）遍历树的迭代器。
   */
  *lvlValues(): IterableIterator<T> {
    const children: BinarySearchNode<T>[] = [];
    let cursor: BinarySearchNode<T> | null = this.#root;
    while (cursor) {
      yield cursor.value;
      if (cursor.left) children.push(cursor.left);
      if (cursor.right) children.push(cursor.right);
      cursor = children.shift() ?? null;
    }
  }

  /**
   * 创建一个遍历此树的迭代器，按中序遍历（LNR，左-节点-右）。
   *
   * @example 使用中序迭代器
   * ```ts
   * import { BinarySearchTree } from "@std/data-structures";
   * import { assertEquals } from "@std/assert";
   *
   * const tree = BinarySearchTree.from([4, 1, 2, 5, 3]);
   *
   * assertEquals([...tree], [1, 2, 3, 4, 5]);
   * ```
   *
   * 参见 {@link BinarySearchTree.prototype.lnrValues}。
   *
   * @returns 一个按中序遍历（LNR）遍历树的迭代器。
   */
  *[Symbol.iterator](): IterableIterator<T> {
    yield* this.lnrValues();
  }
}
