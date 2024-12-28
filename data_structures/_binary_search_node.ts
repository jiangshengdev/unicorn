export type Direction = 'left' | 'right';

export class BinarySearchNode<T> {
  left: BinarySearchNode<T> | null;

  right: BinarySearchNode<T> | null;

  parent: BinarySearchNode<T> | null;

  value: T;

  constructor(parent: BinarySearchNode<T> | null, value: T) {
    this.left = null;

    this.right = null;

    this.parent = parent;

    this.value = value;
  }

  directionFromParent(): Direction | null {
    if (this.parent === null) {
      return null;
    } else {
      if (this === this.parent.left) {
        return 'left';
      } else {
        if (this === this.parent.right) {
          return 'right';
        } else {
          return null;
        }
      }
    }
  }

  findMinNode(): BinarySearchNode<T> {
    let minNode: BinarySearchNode<T> | null = this.left;

    while (minNode?.left) {
      minNode = minNode.left;
    }

    return minNode ?? this;
  }

  findMaxNode(): BinarySearchNode<T> {
    let maxNode: BinarySearchNode<T> | null = this.right;

    while (maxNode?.right) {
      maxNode = maxNode.right;
    }

    return maxNode ?? this;
  }

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
