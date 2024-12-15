// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

export type Direction = 'left' | 'right';

/**
 * 表示二叉搜索树中的一个节点。
 *
 * @typeparam T 存储在节点中的值的类型。
 */
export class BinarySearchNode<T> {
  // 左子节点，类型为 BinarySearchNode<T> 或 null
  left: BinarySearchNode<T> | null;
  // 右子节点，类型为 BinarySearchNode<T> 或 null
  right: BinarySearchNode<T> | null;
  // 父节点，类型为 BinarySearchNode<T> 或 null
  parent: BinarySearchNode<T> | null;
  // 存储在节点中的值，类型为 T
  value: T;

  /**
   * 创建一个新的二叉搜索节点。
   *
   * @param parent 父节点。
   * @param value 节点存储的值。
   */
  constructor(parent: BinarySearchNode<T> | null, value: T) {
    // 初始化左子节点为空
    this.left = null;
    // 初始化右子节点为空
    this.right = null;
    // 设置父节点
    this.parent = parent;
    // 设置节点值
    this.value = value;
  }

  /**
   * 从给定节点创建一个副本。
   *
   * @param node 要复制的节点。
   * @returns 新创建的节点副本。
   */
  static from<T>(node: BinarySearchNode<T>): BinarySearchNode<T> {
    // 创建新节点副本，设置父节点和值
    const copy: BinarySearchNode<T> = new BinarySearchNode(
      node.parent,
      node.value,
    );
    // 复制左子节点
    copy.left = node.left;
    // 复制右子节点
    copy.right = node.right;
    // 返回新创建的节点副本
    return copy;
  }

  /**
   * 确定当前节点相对于其父节点的位置方向。
   *
   * @returns 如果当前节点是父节点的左子节点，返回 `'left'`；如果是右子节点，返回 `'right'`；否则返回 `null`。
   */
  directionFromParent(): Direction | null {
    // 如果当前节点没有父节点，返回 null
    if (this.parent === null) {
      return null;
    } else {
      // 如果当前节点是父节点的左子节点
      if (this === this.parent.left) {
        // 返回 'left'
        return 'left';
      } else {
        // 如果当前节点是父节点的右子节点
        if (this === this.parent.right) {
          // 返回 'right'
          return 'right';
        } else {
          // 如果既不是左子节点也不是右子节点，返回 null
          return null;
        }
      }
    }
  }

  /**
   * 查找当前节点的最小子节点。
   *
   * @returns 包含最小值的节点。
   */
  findMinNode(): BinarySearchNode<T> {
    // 从左子节点开始，假定最小节点为左子节点
    let minNode: BinarySearchNode<T> | null = this.left;
    // 循环查找最左下方的节点
    while (minNode?.left) {
      // 继续向左子节点遍历
      minNode = minNode.left;
    }
    // 如果不存在左子节点，最小节点为当前节点
    return minNode ?? this;
  }

  /**
   * 查找当前节点的最大子节点。
   *
   * @returns 包含最大值的节点。
   */
  findMaxNode(): BinarySearchNode<T> {
    // 从右子节点开始，假定最大节点为右子节点
    let maxNode: BinarySearchNode<T> | null = this.right;
    // 循环查找最右下方的节点
    while (maxNode?.right) {
      // 继续向右子节点遍历
      maxNode = maxNode.right;
    }
    // 如果不存在右子节点，最大节点为当前节点
    return maxNode ?? this;
  }

  /**
   * 查找当前节点的后继节点。
   *
   * @returns 后继节点，如果不存在则返回 `null`。
   */
  findSuccessorNode(): BinarySearchNode<T> | null {
    // 如果有右子节点，后继节点是右子树的最小节点
    if (this.right !== null) return this.right.findMinNode();
    // 否则，向上遍历父节点，找到第一个当前节点是其左子节点的父节点
    let parent: BinarySearchNode<T> | null = this.parent;
    // 获取当前节点相对于父节点的方向
    let direction: Direction | null = this.directionFromParent();
    // 当父节点存在且当前节点是父节点的右子节点时
    while (parent && direction === 'right') {
      // 更新方向和父节点
      direction = parent.directionFromParent();
      parent = parent.parent;
    }
    // 返回找到的父节点作为后继节点
    return parent;
  }
}
