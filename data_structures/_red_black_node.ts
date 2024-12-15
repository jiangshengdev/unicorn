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
  declare parent: RedBlackNode<T> | null;
  declare left: RedBlackNode<T> | null;
  declare right: RedBlackNode<T> | null;
  red: boolean;

  /**
   * 创建一个新的红黑节点。
   *
   * @param parent 节点的父节点。
   * @param value 节点存储的值。
   */
  constructor(parent: RedBlackNode<T> | null, value: T) {
    super(parent, value);
    this.red = true;
  }

  /**
   * 从现有的红黑节点创建一个副本。
   *
   * @param node 要复制的红黑节点。
   * @returns 新创建的红黑节点副本。
   */
  static override from<T>(node: RedBlackNode<T>): RedBlackNode<T> {
    const copy: RedBlackNode<T> = new RedBlackNode(node.parent, node.value);
    copy.left = node.left;
    copy.right = node.right;
    copy.red = node.red;
    return copy;
  }
}
