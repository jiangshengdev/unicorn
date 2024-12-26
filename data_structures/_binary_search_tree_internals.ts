// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

import type { BinarySearchNode } from './_binary_search_node.ts';
import type { Direction } from './_red_black_node.ts';
import type { BinarySearchTree } from './binary_search_tree.ts';

// 这些是二叉搜索树和红黑树实现之间共享的私有方法和属性。它们不用于数据结构模块之外的地方。
export const internals: {
  /**
   * 返回二叉搜索树的根节点。
   *
   * @typeparam T 节点存储的值的类型。
   * @param tree 二叉搜索树实例。
   * @returns 根节点或 `null`。
   */
  getRoot<T>(tree: BinarySearchTree<T>): BinarySearchNode<T> | null;

  /**
   * 设置二叉搜索树的根节点。
   *
   * @typeparam T 节点存储的值的类型。
   * @param tree 二叉搜索树实例。
   * @param node 要设置为根节点的节点。
   */
  setRoot<T>(tree: BinarySearchTree<T>, node: BinarySearchNode<T> | null): void;

  /**
   * 获取二叉搜索树的比较函数。
   *
   * @typeparam T 节点存储的值的类型。
   * @param tree 二叉搜索树实例。
   * @returns 用于比较节点值的函数。
   */
  getCompare<T>(tree: BinarySearchTree<T>): (a: T, b: T) => number;

  /**
   * 设置二叉搜索树的比较函数。
   *
   * @typeparam T 节点存储的值的类型。
   * @param tree 二叉搜索树实例。
   * @param compare 用于比较节点值的函数。
   */
  setCompare<T>(
    tree: BinarySearchTree<T>,
    compare: (a: T, b: T) => number,
  ): void;

  /**
   * 查找二叉搜索树中指定值的节点。
   *
   * @typeparam T 节点存储的值的类型。
   * @param tree 二叉搜索树实例。
   * @param value 要查找的值。
   * @returns 包含该值的节点或 `null`。
   */
  findNode<T>(tree: BinarySearchTree<T>, value: T): BinarySearchNode<T> | null;

  /**
   * 旋转二叉搜索树中的指定节点。
   *
   * @typeparam T 节点存储的值的类型。
   * @param tree 二叉搜索树实例。
   * @param node 要旋转的节点。
   * @param direction 旋转方向，可以是 `'left'` 或 `'right'`。
   */
  rotateNode<T>(
    tree: BinarySearchTree<T>,
    node: BinarySearchNode<T>,
    direction: Direction,
  ): void;

  /**
   * 在二叉搜索树中插入一个新节点。
   *
   * @typeparam T 节点存储的值的类型。
   * @param tree 二叉搜索树实例。
   * @param Node 节点类。
   * @param value 要插入的值。
   * @returns 插入的节点或 `null`。
   */
  insertNode<T>(
    tree: BinarySearchTree<T>,
    Node: typeof BinarySearchNode,
    value: T,
  ): BinarySearchNode<T> | null;

  /**
   * 从二叉搜索树中移除指定的节点。
   *
   * @typeparam T 节点存储的值的类型。
   * @param tree 二叉搜索树实例。
   * @param node 要移除的节点。
   * @returns 被移除的节点或 `null`。
   */
  removeNode<T>(
    tree: BinarySearchTree<T>,
    node: BinarySearchNode<T>,
  ): BinarySearchNode<T> | null;

  /**
   * 设置二叉搜索树的大小。
   *
   * @typeparam T 节点存储的值的类型。
   * @param tree 二叉搜索树实例。
   * @param size 要设置的大小。
   */
  setSize<T>(tree: BinarySearchTree<T>, size: number): void;
} = {} as typeof internals;
