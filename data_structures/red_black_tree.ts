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
        "Cannot construct a RedBlackTree: the 'compare' parameter is not a function, did you mean to call RedBlackTree.from?",
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
    // 声明用于存储结果红黑树的变量
    let result: RedBlackTree<U>;
    // 声明用于存储未映射值的变量
    let unmappedValues: ArrayLike<T> | Iterable<T> = [];
    // 判断传入的集合是否为红黑树实例
    if (collection instanceof RedBlackTree) {
      // 使用提供的比较函数或原集合的比较函数创建新的红黑树
      result = new RedBlackTree(
        options?.compare ??
          getCompare(collection as unknown as RedBlackTree<U>),
      );
      // 如果提供了比较函数或映射函数
      if (options?.compare || options?.map) {
        // 未映射的值为原红黑树集合
        unmappedValues = collection;
      } else {
        // 否则直接复制原红黑树的节点
        const nodes: RedBlackNode<U>[] = [];
        const root = getRoot(collection);
        // 如果原树有根节点
        if (root) {
          // 设置新树的根节点为原树的根节点
          setRoot(result, root as unknown as RedBlackNode<U>);
          // 将根节点压入栈中，准备遍历复制
          nodes.push(root as unknown as RedBlackNode<U>);
        }
        // 当栈不为空时，继续遍历复制节点
        while (nodes.length) {
          // 弹出栈顶节点
          const node: RedBlackNode<U> = nodes.pop()!;
          // 获取左子节点，如果存在则创建新的节点实例
          const left: RedBlackNode<U> | null = node.left
            ? RedBlackNode.from(node.left)
            : null;
          // 获取右子节点，如果存在则创建新的节点实例
          const right: RedBlackNode<U> | null = node.right
            ? RedBlackNode.from(node.right)
            : null;
          // 如果左子节点存在
          if (left) {
            // 设置左子节点的父节点为当前节点
            left.parent = node;
            // 将左子节点压入栈中
            nodes.push(left);
          }
          // 如果右子节点存在
          if (right) {
            // 设置右子节点的父节点为当前节点
            right.parent = node;
            // 将右子节点压入栈中
            nodes.push(right);
          }
        }
      }
    } else {
      // 如果传入的集合不是红黑树实例
      // 使用提供的比较函数或默认的比较函数创建新的红黑树
      result = (
        options?.compare
          ? new RedBlackTree(options.compare)
          : new RedBlackTree()
      ) as RedBlackTree<U>;
      // 未映射的值为传入的集合
      unmappedValues = collection;
    }
    // 如果提供了映射函数，则对未映射的值进行映射处理
    const values: Iterable<U> = options?.map
      ? Array.from(unmappedValues, options.map, options.thisArg)
      : (unmappedValues as U[]);
    // 将处理后的值依次插入新的红黑树中
    for (const value of values) result.insert(value);
    // 返回新的红黑树
    return result;
  }

  // 私有方法，用于在删除节点后修复红黑树的性质
  #removeFixup(
    parent: RedBlackNode<T> | null,
    current: RedBlackNode<T> | null,
  ) {
    // 当父节点存在并且当前节点为黑色时，持续修复
    while (parent && !current?.red) {
      // 确定当前节点是父节点的左子节点还是右子节点
      const direction: Direction = parent.left === current ? 'left' : 'right';
      // 确定兄弟节点的方向，与当前节点相反
      const siblingDirection: Direction =
        direction === 'right' ? 'left' : 'right';
      // 获取兄弟节点
      let sibling: RedBlackNode<T> | null = parent[siblingDirection];

      // 如果兄弟节点是红色
      if (sibling?.red) {
        // 将兄弟节点染黑
        sibling.red = false;
        // 将父节点染红
        parent.red = true;
        // 以父节点为支点，向当前节点的方向进行旋转
        rotateNode(this, parent, direction);
        // 更新兄弟节点
        sibling = parent[siblingDirection];
      }
      // 如果兄弟节点存在
      if (sibling) {
        // 如果兄弟节点的两个子节点都是黑色
        if (!sibling.left?.red && !sibling.right?.red) {
          // 将兄弟节点染红，继续向上修复
          sibling!.red = true;
          // 当前节点上移
          current = parent;
          // 父节点上移
          parent = current.parent;
        } else {
          // 如果兄弟节点的远侄子节点是黑色
          if (!sibling[siblingDirection]?.red) {
            // 将兄弟节点的近侄子节点染黑
            sibling[direction]!.red = false;
            // 将兄弟节点染红
            sibling.red = true;
            // 以兄弟节点为支点，向兄弟节点的方向进行旋转
            rotateNode(this, sibling, siblingDirection);
            // 更新兄弟节点
            sibling = parent[siblingDirection!];
          }
          // 将兄弟节点的颜色设置为父节点的颜色
          sibling!.red = parent.red;
          // 将父节点染黑
          parent.red = false;
          // 将兄弟节点的远侄子节点染黑
          sibling![siblingDirection]!.red = false;
          // 以父节点为支点，向当前节点的方向进行旋转
          rotateNode(this, parent, direction);
          // 将当前节点指向根节点，结束修复
          current = getRoot(this) as RedBlackNode<T>;
          parent = null;
        }
      }
    }
    // 将当前节点染黑，确保红黑树性质
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
    // 调用父类的插入方法，返回插入的节点
    let node = insertNode(this, RedBlackNode, value) as RedBlackNode<T> | null;
    // 如果插入成功
    if (node) {
      // 当新插入节点的父节点是红色时，违反红黑树性质，需要修复
      while (node.parent?.red) {
        // 获取父节点
        let parent: RedBlackNode<T> = node.parent!;
        // 确定父节点相对于祖父节点的方向
        const parentDirection: Direction = parent.directionFromParent()!;
        // 叔叔节点的方向与父节点相反
        const uncleDirection: Direction =
          parentDirection === 'right' ? 'left' : 'right';
        // 获取叔叔节点
        const uncle: RedBlackNode<T> | null =
          parent.parent![uncleDirection] ?? null;

        // 如果叔叔节点是红色
        if (uncle?.red) {
          // 将父节点和叔叔节点染黑
          parent.red = false;
          uncle.red = false;
          // 将祖父节点染红
          parent.parent!.red = true;
          // 将当前节点上移到祖父节点，继续修复
          node = parent.parent!;
        } else {
          // 如果当前节点是父节点的“内侧”子节点
          if (node === parent[uncleDirection]) {
            // 以父节点为支点，向父节点方向旋转
            node = parent;
            rotateNode(this, node, parentDirection);
            // 更新父节点
            parent = node.parent!;
          }
          // 将父节点染黑
          parent.red = false;
          // 将祖父节点染红
          parent.parent!.red = true;
          // 以祖父节点为支点，向叔叔节点方向旋转
          rotateNode(this, parent.parent!, uncleDirection);
        }
      }
      // 确保根节点为黑色
      (getRoot(this) as RedBlackNode<T>).red = false;
    }
    // 返回是否插入成功
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
    // 查找要删除的节点
    const node = findNode(this, value) as RedBlackNode<T> | null;

    // 如果节点不存在，返回 false
    if (!node) {
      return false;
    }

    // 删除节点，返回被删除的节点
    const removedNode = removeNode(this, node) as RedBlackNode<T> | null;

    // 如果被删除的节点是黑色，需要修复红黑树性质
    if (removedNode && !removedNode.red) {
      // 调用删除修复方法
      this.#removeFixup(
        removedNode.parent,
        removedNode.left ?? removedNode.right,
      );
    }

    // 删除成功，返回 true
    return true;
  }
}
