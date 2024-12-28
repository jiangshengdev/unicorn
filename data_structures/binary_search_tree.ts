import { ascend } from './comparators.ts';
import { BinarySearchNode } from './_binary_search_node.ts';
import { internals } from './_binary_search_tree_internals.ts';

type Direction = 'left' | 'right';

export class BinarySearchTree<T> implements Iterable<T> {
  #root: BinarySearchNode<T> | null = null;
  #size = 0;
  #compare: (a: T, b: T) => number;

  constructor(compare: (a: T, b: T) => number = ascend) {
    if (typeof compare !== 'function') {
      throw new TypeError(
        "Cannot construct a BinarySearchTree: the 'compare' parameter is not a function, did you mean to call BinarySearchTree.from?",
      );
    }
    this.#compare = compare;
  }

  static {
    internals.getRoot = <T>(tree: BinarySearchTree<T>) => tree.#root;
    internals.setRoot = <T>(
      tree: BinarySearchTree<T>,
      node: BinarySearchNode<T> | null,
    ) => {
      tree.#root = node;
    };
    internals.getCompare = <T>(tree: BinarySearchTree<T>) => tree.#compare;
    internals.findNode = <T>(
      tree: BinarySearchTree<T>,
      value: T,
    ): BinarySearchNode<T> | null => tree.#findNode(value);
    internals.rotateNode = <T>(
      tree: BinarySearchTree<T>,
      node: BinarySearchNode<T>,
      direction: Direction,
    ) => tree.#rotateNode(node, direction);
    internals.insertNode = <T>(
      tree: BinarySearchTree<T>,
      Node: typeof BinarySearchNode,
      value: T,
    ): BinarySearchNode<T> | null => tree.#insertNode(Node, value);
    internals.removeNode = <T>(
      tree: BinarySearchTree<T>,
      node: BinarySearchNode<T>,
    ): BinarySearchNode<T> | null => tree.#removeNode(node);
    internals.setSize = <T>(tree: BinarySearchTree<T>, size: number) =>
      (tree.#size = size);
  }

  get size(): number {
    return this.#size;
  }

  #findNode(value: T): BinarySearchNode<T> | null {
    let node: BinarySearchNode<T> | null = this.#root;

    while (node) {
      const order: number = this.#compare(value as T, node.value);

      if (order === 0) break;

      const direction: 'left' | 'right' = order < 0 ? 'left' : 'right';

      node = node[direction];
    }

    return node;
  }

  #rotateNode(node: BinarySearchNode<T>, direction: Direction) {
    const replacementDirection: Direction =
      direction === 'left' ? 'right' : 'left';

    if (!node[replacementDirection]) {
      throw new TypeError(
        `Cannot rotate ${direction} without ${replacementDirection} child`,
      );
    }

    const replacement: BinarySearchNode<T> = node[replacementDirection]!;

    node[replacementDirection] = replacement[direction] ?? null;
    if (replacement[direction]) replacement[direction]!.parent = node;

    replacement.parent = node.parent;
    if (node.parent) {
      const parentDirection: Direction =
        node === node.parent[direction] ? direction : replacementDirection;

      node.parent[parentDirection] = replacement;
    } else {
      this.#root = replacement;
    }

    replacement[direction] = node;
    node.parent = replacement;
  }

  #insertNode(
    Node: typeof BinarySearchNode,
    value: T,
  ): BinarySearchNode<T> | null {
    if (!this.#root) {
      this.#root = new Node(null, value);
      this.#size++;
      return this.#root;
    } else {
      let node: BinarySearchNode<T> = this.#root;

      while (true) {
        const order: number = this.#compare(value, node.value);

        if (order === 0) break;

        const direction: Direction = order < 0 ? 'left' : 'right';

        if (node[direction]) {
          node = node[direction]!;
        } else {
          node[direction] = new Node(node, value);
          this.#size++;
          return node[direction];
        }
      }
    }

    return null;
  }

  #removeNode(node: BinarySearchNode<T>): BinarySearchNode<T> | null {
    const flaggedNode: BinarySearchNode<T> | null =
      !node.left || !node.right ? node : node.findSuccessorNode()!;

    const replacementNode: BinarySearchNode<T> | null =
      flaggedNode.left ?? flaggedNode.right;

    if (replacementNode) replacementNode.parent = flaggedNode.parent;

    if (!flaggedNode.parent) {
      this.#root = replacementNode;
    } else {
      flaggedNode.parent[flaggedNode.directionFromParent()!] = replacementNode;
    }

    if (flaggedNode !== node) {
      const swapValue = node.value;
      node.value = flaggedNode.value;
      flaggedNode.value = swapValue;
    }

    this.#size--;
    return flaggedNode;
  }

  insert(value: T): boolean {
    return !!this.#insertNode(BinarySearchNode, value);
  }

  remove(value: T): boolean {
    const node: BinarySearchNode<T> | null = this.#findNode(value);

    if (node) this.#removeNode(node);

    return node !== null;
  }

  find(value: T): T | null {
    return this.#findNode(value)?.value ?? null;
  }

  min(): T | null {
    return this.#root ? this.#root.findMinNode().value : null;
  }

  max(): T | null {
    return this.#root ? this.#root.findMaxNode().value : null;
  }

  clear() {
    this.#root = null;

    this.#size = 0;
  }

  isEmpty(): boolean {
    return this.size === 0;
  }

  *lnrValues(): IterableIterator<T> {
    const nodes: BinarySearchNode<T>[] = [];

    let node: BinarySearchNode<T> | null = this.#root;

    while (nodes.length || node) {
      if (node) {
        nodes.push(node);
        node = node.left;
      } else {
        node = nodes.pop()!;
        yield node.value;

        node = node.right;
      }
    }
  }

  *rnlValues(): IterableIterator<T> {
    const nodes: BinarySearchNode<T>[] = [];

    let node: BinarySearchNode<T> | null = this.#root;

    while (nodes.length || node) {
      if (node) {
        nodes.push(node);
        node = node.right;
      } else {
        node = nodes.pop()!;
        yield node.value;

        node = node.left;
      }
    }
  }

  *nlrValues(): IterableIterator<T> {
    const nodes: BinarySearchNode<T>[] = [];

    if (this.#root) nodes.push(this.#root);

    while (nodes.length) {
      const node: BinarySearchNode<T> = nodes.pop()!;
      yield node.value;

      if (node.right) nodes.push(node.right);
      if (node.left) nodes.push(node.left);
    }
  }

  *lrnValues(): IterableIterator<T> {
    const nodes: BinarySearchNode<T>[] = [];

    let node: BinarySearchNode<T> | null = this.#root;

    let lastNodeVisited: BinarySearchNode<T> | null = null;

    while (nodes.length || node) {
      if (node) {
        nodes.push(node);
        node = node.left;
      } else {
        const lastNode: BinarySearchNode<T> = nodes.at(-1)!;

        if (lastNode.right && lastNode.right !== lastNodeVisited) {
          node = lastNode.right;
        } else {
          yield lastNode.value;
          lastNodeVisited = nodes.pop()!;
        }
      }
    }
  }

  *lvlValues(): IterableIterator<T> {
    const children: BinarySearchNode<T>[] = [];

    let cursor: BinarySearchNode<T> | null = this.#root;

    while (cursor) {
      yield cursor.value;

      if (cursor.left) children.push(cursor.left);

      if (cursor.right) children.push(cursor.right);

      cursor = children.shift() ?? null;
    }
  }

  *[Symbol.iterator](): IterableIterator<T> {
    yield* this.lnrValues();
  }
}
