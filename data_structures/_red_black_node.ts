import { BinarySearchNode, type Direction } from './_binary_search_node.ts';

export type { Direction };

export class RedBlackNode<T> extends BinarySearchNode<T> {
  declare parent: RedBlackNode<T> | null;

  declare left: RedBlackNode<T> | null;

  declare right: RedBlackNode<T> | null;

  red: boolean;

  constructor(parent: RedBlackNode<T> | null, value: T) {
    super(parent, value);

    this.red = true;
  }
}
