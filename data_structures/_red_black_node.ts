// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

import { BinarySearchNode, type Direction } from './_binary_search_node.ts';
export type { Direction };

/**
 * 表示红黑树中的一个节点，继承自二叉搜索树的节点。
 *
 * @typeparam T 存储在节点中的值的类型。
 */
export class RedBlackNode<T> extends BinarySearchNode<T> {
  /**
   * 节点的父节点。可以为空，表示根节点。
   */
  declare parent: RedBlackNode<T> | null;

  /**
   * 节点的左子节点。可以为空，表示没有左子节点。
   */
  declare left: RedBlackNode<T> | null;

  /**
   * 节点的右子节点。可以为空，表示没有右子节点。
   */
  declare right: RedBlackNode<T> | null;

  /**
   * 节点的颜色，true 表示红色，false 表示黑色。
   */
  red: boolean;

  /**
   * 创建一个新的红黑节点，并初始化其属性。
   *
   * @param parent 节点的父节点。可以为空，表示根节点。
   * @param value 节点存储的值。
   */
  constructor(parent: RedBlackNode<T> | null, value: T) {
    // 调用父类构造函数，初始化父节点和值
    super(parent, value);
    // 设置节点颜色为红色
    this.red = true;
  }

  /**
   * 从现有的红黑节点创建一个副本。
   *
   * @param node 要复制的红黑节点。
   * @returns 新创建的红黑节点副本。
   */
  static override from<T>(node: RedBlackNode<T>): RedBlackNode<T> {
    // 创建新的红黑节点副本，传入父节点和值
    const copy: RedBlackNode<T> = new RedBlackNode(node.parent, node.value);
    // 复制左子节点
    copy.left = node.left;
    // 复制右子节点
    copy.right = node.right;
    // 复制节点的颜色属性
    copy.red = node.red;
    return copy;
  }
}
