// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

export type Direction = 'left' | 'right';

/**
 * 表示二叉搜索树中的一个节点。
 *
 * @typeparam T 存储在节点中的值的类型。
 */
export class BinarySearchNode<T> {
  left: BinarySearchNode<T> | null;
  right: BinarySearchNode<T> | null;
  parent: BinarySearchNode<T> | null;
  value: T;

  /**
   * 创建一个新的二叉搜索节点。
   *
   * @param parent 父节点。
   * @param value 节点存储的值。
   */
  constructor(parent: BinarySearchNode<T> | null, value: T) {
    this.left = null;
    this.right = null;
    this.parent = parent;
    this.value = value;
  }

  /**
   * 从给定节点创建一个副本。
   *
   * @param node 要复制的节点。
   * @returns 新创建的节点副本。
   */
  static from<T>(node: BinarySearchNode<T>): BinarySearchNode<T> {
    const copy: BinarySearchNode<T> = new BinarySearchNode(
      node.parent,
      node.value,
    );
    copy.left = node.left;
    copy.right = node.right;
    return copy;
  }

  /**
   * 确定当前节点相对于其父节点的位置方向。
   *
   * @returns 如果当前节点是父节点的左子节点，返回 `'left'`；如果是右子节点，返回 `'right'`；否则返回 `null`。
   */
  directionFromParent(): Direction | null {
    return this.parent === null
      ? null
      : this === this.parent.left
        ? 'left'
        : this === this.parent.right
          ? 'right'
          : null;
  }

  /**
   * 查找当前节点的最小子节点。
   *
   * @returns 包含最小值的节点。
   */
  findMinNode(): BinarySearchNode<T> {
    let minNode: BinarySearchNode<T> | null = this.left;
    while (minNode?.left) minNode = minNode.left;
    return minNode ?? this;
  }

  /**
   * 查找当前节点的最大子节点。
   *
   * @returns 包含最大值的节点。
   */
  findMaxNode(): BinarySearchNode<T> {
    let maxNode: BinarySearchNode<T> | null = this.right;
    while (maxNode?.right) maxNode = maxNode.right;
    return maxNode ?? this;
  }

  /**
   * 查找当前节点的后继节点。
   *
   * @returns 后继节点，如果不存在则返回 `null`。
   */
  findSuccessorNode(): BinarySearchNode<T> | null {
    if (this.right !== null) return this.right.findMinNode();
    let parent: BinarySearchNode<T> | null = this.parent;
    let direction: Direction | null = this.directionFromParent();
    while (parent && direction === 'right') {
      direction = parent.directionFromParent();
      parent = parent.parent;
    }
    return parent;
  }
}
