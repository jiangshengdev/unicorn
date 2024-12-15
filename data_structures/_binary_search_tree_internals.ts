// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

import type { BinarySearchNode } from './_binary_search_node.ts';
import type { Direction } from './_red_black_node.ts';
import type { BinarySearchTree } from './binary_search_tree.ts';

// 这些是二叉搜索树和红黑树实现之间共享的私有方法和属性。它们不用于数据结构模块之外的地方。
export const internals: {
  /** 返回二叉搜索树的根节点。 */
  getRoot<T>(tree: BinarySearchTree<T>): BinarySearchNode<T> | null;
  /** 设置二叉搜索树的根节点。 */
  setRoot<T>(tree: BinarySearchTree<T>, node: BinarySearchNode<T> | null): void;
  /** 获取比较函数。 */
  getCompare<T>(tree: BinarySearchTree<T>): (a: T, b: T) => number;
  /** 设置比较函数。 */
  setCompare<T>(
    tree: BinarySearchTree<T>,
    compare: (a: T, b: T) => number,
  ): void;
  /** 查找节点。 */
  findNode<T>(tree: BinarySearchTree<T>, value: T): BinarySearchNode<T> | null;
  /** 旋转节点。 */
  rotateNode<T>(
    tree: BinarySearchTree<T>,
    node: BinarySearchNode<T>,
    direction: Direction,
  ): void;
  /** 插入节点。 */
  insertNode<T>(
    tree: BinarySearchTree<T>,
    Node: typeof BinarySearchNode,
    value: T,
  ): BinarySearchNode<T> | null;
  /** 移除节点。 */
  removeNode<T>(
    tree: BinarySearchTree<T>,
    node: BinarySearchNode<T>,
  ): BinarySearchNode<T> | null;
} = {} as typeof internals;
