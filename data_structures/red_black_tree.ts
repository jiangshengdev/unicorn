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
  setSize,
} = internals;

export class RedBlackTree<T> extends BinarySearchTree<T> {
  constructor(compare: (a: T, b: T) => number = ascend) {
    if (typeof compare !== 'function') {
      throw new TypeError(
        "Cannot construct a RedBlackTree: the 'compare' parameter is not a function, did you mean to call RedBlackTree.from?",
      );
    }
    super(compare);
  }

  #removeFixup(
    parent: RedBlackNode<T> | null,
    current: RedBlackNode<T> | null,
  ) {
    while (parent && !current?.red) {
      const direction: Direction = parent.left === current ? 'left' : 'right';

      const siblingDirection: Direction =
        direction === 'right' ? 'left' : 'right';

      let sibling: RedBlackNode<T> | null = parent[siblingDirection];

      if (sibling?.red) {
        sibling.red = false;

        parent.red = true;

        rotateNode(this, parent, direction);

        sibling = parent[siblingDirection];
      }

      if (sibling) {
        if (!sibling.left?.red && !sibling.right?.red) {
          sibling!.red = true;

          current = parent;

          parent = current.parent;
        } else {
          if (!sibling[siblingDirection]?.red) {
            sibling[direction]!.red = false;

            sibling.red = true;

            rotateNode(this, sibling, siblingDirection);

            sibling = parent[siblingDirection!];
          }

          sibling!.red = parent.red;

          parent.red = false;

          sibling![siblingDirection]!.red = false;

          rotateNode(this, parent, direction);

          current = getRoot(this) as RedBlackNode<T>;
          parent = null;
        }
      }
    }

    if (current) current.red = false;
  }

  override insert(value: T): boolean {
    let node = insertNode(this, RedBlackNode, value) as RedBlackNode<T> | null;

    if (node) {
      while (node.parent?.red) {
        let parent: RedBlackNode<T> = node.parent!;

        const parentDirection: Direction = parent.directionFromParent()!;

        const uncleDirection: Direction =
          parentDirection === 'right' ? 'left' : 'right';

        const uncle: RedBlackNode<T> | null =
          parent.parent![uncleDirection] ?? null;

        if (uncle?.red) {
          parent.red = false;
          uncle.red = false;

          parent.parent!.red = true;

          node = parent.parent!;
        } else {
          if (node === parent[uncleDirection]) {
            node = parent;
            rotateNode(this, node, parentDirection);

            parent = node.parent!;
          }

          parent.red = false;

          parent.parent!.red = true;

          rotateNode(this, parent.parent!, uncleDirection);
        }
      }

      (getRoot(this) as RedBlackNode<T>).red = false;
    }

    return !!node;
  }

  override remove(value: T): boolean {
    const node = findNode(this, value) as RedBlackNode<T> | null;

    if (!node) {
      return false;
    }

    const removedNode = removeNode(this, node) as RedBlackNode<T> | null;

    if (removedNode && !removedNode.red) {
      this.#removeFixup(
        removedNode.parent,
        removedNode.left ?? removedNode.right,
      );
    }

    return true;
  }
}
