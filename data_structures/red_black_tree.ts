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

  static override from<T>(
    collection: ArrayLike<T> | Iterable<T> | RedBlackTree<T>,
    options?: {
      compare?: (a: T, b: T) => number;
    },
  ): RedBlackTree<T>;

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
    let result: RedBlackTree<U>;

    let unmappedValues: ArrayLike<T> | Iterable<T> = [];

    if (collection instanceof RedBlackTree) {
      result = new RedBlackTree(
        options?.compare ??
          getCompare(collection as unknown as RedBlackTree<U>),
      );

      if (options?.compare || options?.map) {
        unmappedValues = collection;
      } else {
        const nodes: RedBlackNode<U>[] = [];
        const root = getRoot(collection);

        if (root) {
          setRoot(result, root as unknown as RedBlackNode<U>);

          nodes.push(root as unknown as RedBlackNode<U>);
        }

        while (nodes.length) {
          const node: RedBlackNode<U> = nodes.pop()!;

          const left: RedBlackNode<U> | null = node.left
            ? RedBlackNode.from(node.left)
            : null;

          const right: RedBlackNode<U> | null = node.right
            ? RedBlackNode.from(node.right)
            : null;

          if (left) {
            left.parent = node;

            nodes.push(left);
          }

          if (right) {
            right.parent = node;

            nodes.push(right);
          }
        }

        setSize(result, collection.size);
      }
    } else {
      result = (
        options?.compare
          ? new RedBlackTree(options.compare)
          : new RedBlackTree()
      ) as RedBlackTree<U>;

      unmappedValues = collection;
    }

    const values: Iterable<U> = options?.map
      ? Array.from(unmappedValues, options.map, options.thisArg)
      : (unmappedValues as U[]);

    for (const value of values) result.insert(value);

    return result;
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
