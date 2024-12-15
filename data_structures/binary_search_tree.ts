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
    // 确保比较函数是一个有效的函数
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
    // 创建新的二叉搜索树实例
    let result: BinarySearchTree<U>;
    let unmappedValues: ArrayLike<T> | Iterable<T> = [];

    if (collection instanceof BinarySearchTree) {
      // 如果传入的是现有的二叉搜索树
      // 从现有树复制比较函数，除非提供了新的比较函数
      result = new BinarySearchTree(
        options?.compare ??
          (collection as unknown as BinarySearchTree<U>).#compare,
      );

      if (options?.compare || options?.map) {
        // 如果提供了自定义比较函数或映射函数，使用原始集合进行后续处理
        unmappedValues = collection;
      } else {
        // 如果没有提供新的比较函数或映射函数，直接复制现有树的节点结构
        const nodes: BinarySearchNode<U>[] = [];
        if (collection.#root) {
          // 复制根节点
          result.#root = BinarySearchNode.from(
            collection.#root as unknown as BinarySearchNode<U>,
          );
          nodes.push(result.#root);
        }
        // 遍历所有节点并复制左右子节点
        while (nodes.length) {
          const node: BinarySearchNode<U> = nodes.pop()!;
          const left: BinarySearchNode<U> | null = node.left
            ? BinarySearchNode.from(node.left)
            : null;
          const right: BinarySearchNode<U> | null = node.right
            ? BinarySearchNode.from(node.right)
            : null;

          if (left) {
            // 如果存在左子节点，设置其父节点并加入待处理队列
            left.parent = node;
            nodes.push(left);
          }
          if (right) {
            // 如果存在右子节点，设置其父节点并加入待处理队列
            right.parent = node;
            nodes.push(right);
          }
        }
      }
    } else {
      // 如果传入的是数组类或可迭代对象
      // 使用提供的比较函数或默认比较函数创建新的二叉搜索树
      result = (
        options?.compare
          ? new BinarySearchTree(options.compare)
          : new BinarySearchTree()
      ) as BinarySearchTree<U>;
      unmappedValues = collection;
    }

    // 如果提供了映射函数，则应用映射函数转换所有值
    const values: Iterable<U> = options?.map
      ? Array.from(unmappedValues, options.map, options.thisArg)
      : (unmappedValues as U[]);

    // 将所有转换后的值插入新树中
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

  /**
   * 查找给定值对应的节点。
   *
   * @param value 要查找的值。
   * @returns 如果找到，返回对应的节点；否则返回 null。
   */
  #findNode(value: T): BinarySearchNode<T> | null {
    // 从根节点开始查找
    let node: BinarySearchNode<T> | null = this.#root;

    // 持续遍历直到找到目标值或到达叶子节点
    while (node) {
      // 使用比较函数比较目标值与当前节点的值
      const order: number = this.#compare(value as T, node.value);

      // 如果比较结果为0，表示找到了目标值
      if (order === 0) break;

      // 确定下一步搜索的方向
      const direction: 'left' | 'right' = order < 0 ? 'left' : 'right';

      // 移动到子节点继续查找
      node = node[direction];
    }

    // 返回找到的节点，可能为 null
    return node;
  }

  /**
   * 旋转指定的节点，以重新平衡树结构。
   *
   * @param node 要旋转的节点。
   * @param direction 旋转的方向，'left' 或 'right'。
   * @throws 如果没有对应方向的子节点，则抛出错误。
   */
  #rotateNode(node: BinarySearchNode<T>, direction: Direction) {
    // 确定旋转方向的相反方向
    const replacementDirection: Direction =
      direction === 'left' ? 'right' : 'left';

    // 检查是否存在替代子节点
    if (!node[replacementDirection]) {
      throw new TypeError(
        `Cannot rotate ${direction} without ${replacementDirection} child`,
      );
    }

    // 获取要替代的子节点
    const replacement: BinarySearchNode<T> = node[replacementDirection]!;

    // 将当前节点的替代方向子节点指向替代节点的相反方向子节点
    node[replacementDirection] = replacement[direction] ?? null;
    if (replacement[direction]) replacement[direction]!.parent = node;

    // 将替代节点的父节点设置为当前节点的父节点
    replacement.parent = node.parent;
    if (node.parent) {
      // 确定替代节点在父节点中的方向
      const parentDirection: Direction =
        node === node.parent[direction] ? direction : replacementDirection;
      // 更新父节点对子节点的引用
      node.parent[parentDirection] = replacement;
    } else {
      // 如果当前节点是根节点，更新树的根节点为替代节点
      this.#root = replacement;
    }

    // 将当前节点设置为替代节点的子节点
    replacement[direction] = node;
    node.parent = replacement;
  }

  /**
   * 插入一个新的节点到二叉搜索树中。
   *
   * @param Node 节点的构造函数。
   * @param value 要插入的值。
   * @returns 如果成功插入，返回新节点；如果值已存在，返回 null。
   */
  #insertNode(
    Node: typeof BinarySearchNode,
    value: T,
  ): BinarySearchNode<T> | null {
    // 如果树为空，创建根节点
    if (!this.#root) {
      this.#root = new Node(null, value);
      this.#size++;
      return this.#root;
    } else {
      // 从根节点开始遍历树
      let node: BinarySearchNode<T> = this.#root;

      while (true) {
        // 使用比较函数比较新值与当前节点的值
        const order: number = this.#compare(value, node.value);

        // 如果值相等，表示值已存在于树中，结束插入
        if (order === 0) break;

        // 确定插入方向
        const direction: Direction = order < 0 ? 'left' : 'right';

        // 如果子节点存在，继续向下遍历
        if (node[direction]) {
          node = node[direction]!;
        } else {
          // 如果子节点不存在，在该位置插入新节点
          node[direction] = new Node(node, value);
          this.#size++;
          return node[direction];
        }
      }
    }

    // 如果值已存在于树中，返回 null
    return null;
  }

  /**
   * 移除指定的节点。
   *
   * @param node 要移除的节点。
   * @returns 被移除的节点，或者 null。
   */
  #removeNode(node: BinarySearchNode<T>): BinarySearchNode<T> | null {
    // 确定要删除的节点，如果有两个子节点，则找到后继节点
    const flaggedNode: BinarySearchNode<T> | null =
      !node.left || !node.right ? node : node.findSuccessorNode()!;

    // 获取替代节点（左子节点或右子节点）
    const replacementNode: BinarySearchNode<T> | null =
      flaggedNode.left ?? flaggedNode.right;

    // 更新替代节点的父节点引用
    if (replacementNode) replacementNode.parent = flaggedNode.parent;

    if (!flaggedNode.parent) {
      // 如果删除的是根节点，更新根节点
      this.#root = replacementNode;
    } else {
      // 确定替代节点在父节点中的方向
      flaggedNode.parent[flaggedNode.directionFromParent()!] = replacementNode;
    }

    if (flaggedNode !== node) {
      // 如果被删除节点有两个子节点，交换值
      const swapValue = node.value;
      node.value = flaggedNode.value;
      flaggedNode.value = swapValue;
    }

    // 更新树的节点数量
    this.#size--;
    return flaggedNode;
  }

  /**
   * 如果值尚不存在于树中，则将其添加到二叉搜索树中。
   *
   * 该操作的复杂度平均为 O(log n)，其中 n 是树中值的数量。在最坏情况下，复杂度为 O(n)。
   *
   * @example 向树中插入值
   * ```ts no-assert
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
   * @returns 如果值**入，则返回 `true`；如果值已存在于树中，则返回 `false`。
   */
  insert(value: T): boolean {
    // 调用内部方法插入节点
    return !!this.#insertNode(BinarySearchNode, value);
  }

  /**
   * 如果值存在于树中，则将其从二叉搜索树中移除。
   *
   * 该操作的复杂度平均为 O(log n)，其中 n 是树中值的数量。在最坏情况下，复杂度为 O(n)。
   *
   * @example 从树中移除值
   * ```ts no-assert
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
    // 查找要移除的节点
    const node: BinarySearchNode<T> | null = this.#findNode(value);

    // 如果节点存在，移除节点
    if (node) this.#removeNode(node);

    // 返回是否成功移除
    return node !== null;
  }

  /**
   * 检查一个值是否存在于二叉搜索树中。
   *
   * 该操作的复杂度取决于树的底层结构。有关更多详细信息，请参阅结构本身的文档。
   *
   * @example 在树中查找值
   * ```ts no-assert
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
   * ```ts no-assert
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
    // 如果根节点存在，返回最小节点的值
    return this.#root ? this.#root.findMinNode().value : null;
  }

  /**
   * 获取二叉搜索树中最大（最右边）的值，或者如果树为空则返回 `null`。
   *
   * 该操作的复杂度取决于树的底层结构。有关更多详细信息，请参阅结构本身的文档。
   *
   * @example 查找树中的最大值
   * ```ts no-assert
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
    // 如果根节点存在，返回最大节点的值
    return this.#root ? this.#root.findMaxNode().value : null;
  }

  /**
   * 从二叉搜索树中移除所有值。
   *
   * 该操作的复杂度为 O(1)。
   *
   * @example 清空树
   * ```ts no-assert
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
    // 将根节点设置为 null，断开所有节点的引用
    this.#root = null;

    // 重置树的大小为 0
    this.#size = 0;
  }

  /**
   * 检查二叉搜索树是否为空。
   *
   * 该操作的复杂度为 O(1)。
   *
   * @example 检查树是否为空
   * ```ts no-assert
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
    // 检查树的大小是否为 0
    return this.size === 0;
  }

  /**
   * 创建一个遍历此树的迭代器，按中序遍历（LNR，左-节点-右）。
   *
   * @example 使用中序 LNR 迭代器
   * ```ts no-assert
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
    // 创建栈来存储遍历路径上的节点
    const nodes: BinarySearchNode<T>[] = [];

    // 从根节点开始遍历
    let node: BinarySearchNode<T> | null = this.#root;

    // 持续遍历，直到栈为空且节点为 null
    while (nodes.length || node) {
      if (node) {
        // 将当前节点压入栈，并移动到左子节点
        nodes.push(node);
        node = node.left;
      } else {
        // 如果没有左子节点，弹出栈顶节点并访问其值
        node = nodes.pop()!;
        yield node.value;

        // 移动到右子节点继续遍历
        node = node.right;
      }
    }
  }

  /**
   * 创建一个遍历此树的迭代器，按逆中序遍历（RNL，右-节点-左）。
   *
   * @example 使用逆中序 RNL 迭代器
   * ```ts no-assert
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
    // 创建栈来存储遍历路径上的节点
    const nodes: BinarySearchNode<T>[] = [];

    // 从根节点开始遍历
    let node: BinarySearchNode<T> | null = this.#root;

    // 持续遍历，直到栈为空且节点为 null
    while (nodes.length || node) {
      if (node) {
        // 将当前节点压入栈，并移动到右子节点
        nodes.push(node);
        node = node.right;
      } else {
        // 如果没有右子节点，弹出栈顶节点并访问其值
        node = nodes.pop()!;
        yield node.value;

        // 移动到左子节点继续遍历
        node = node.left;
      }
    }
  }

  /**
   * 创建一个遍历此树的迭代器，按前序遍历（NLR，节点-左-右）。
   *
   * @example 使用前序 NLR 迭代器
   * ```ts no-assert
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
    // 创建栈来存储待访问的节点
    const nodes: BinarySearchNode<T>[] = [];

    // 如果根节点存在，先将其压入栈
    if (this.#root) nodes.push(this.#root);

    // 持续遍历，直到栈为空
    while (nodes.length) {
      // 弹出栈顶节点并访问其值
      const node: BinarySearchNode<T> = nodes.pop()!;
      yield node.value;

      // 先压入右子节点，再压入左子节点，以确保左子节点先被访问
      if (node.right) nodes.push(node.right);
      if (node.left) nodes.push(node.left);
    }
  }

  /**
   * 创建一个遍历此树的迭代器，按后序遍历（LRN，左-右-节点）。
   *
   * @example 使用后序 LRN 迭代器
   * ```ts no-assert
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
    // 创建栈来存储遍历路径上的节点
    const nodes: BinarySearchNode<T>[] = [];

    // 当前正在访问的节点
    let node: BinarySearchNode<T> | null = this.#root;

    // 记录上一个被访问的节点
    let lastNodeVisited: BinarySearchNode<T> | null = null;

    // 持续遍历，直到栈为空且节点为 null
    while (nodes.length || node) {
      if (node) {
        // 将当前节点压入栈，并移动到左子节点
        nodes.push(node);
        node = node.left;
      } else {
        // 获取栈顶节点但不弹出
        const lastNode: BinarySearchNode<T> = nodes.at(-1)!;

        // 如果存在右子节点且未被访问过，移动到右子节点
        if (lastNode.right && lastNode.right !== lastNodeVisited) {
          node = lastNode.right;
        } else {
          // 否则，弹出栈顶节点并访问其值
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
   * ```ts no-assert
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
    // 创建一个队列来存储待访问的子节点
    const children: BinarySearchNode<T>[] = [];

    // 当前正在访问的节点，从根节点开始
    let cursor: BinarySearchNode<T> | null = this.#root;

    // 持续遍历，直到队列为空且节点为 null
    while (cursor) {
      // 访问当前节点的值
      yield cursor.value;

      // 将左子节点加入队列
      if (cursor.left) children.push(cursor.left);

      // 将右子节点加入队列
      if (cursor.right) children.push(cursor.right);

      // 从队列中取出下一个要访问的节点
      cursor = children.shift() ?? null;
    }
  }

  /**
   * 创建一个遍历此树的迭代器，按中序遍历（LNR，左-节点-右）。
   *
   * @example 使用中序迭代器
   * ```ts no-assert
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
    // 使用中序遍历返回值的迭代器
    yield* this.lnrValues();
  }
}
