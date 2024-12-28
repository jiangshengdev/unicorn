import type { BinarySearchNode } from './_binary_search_node.ts';
import type { Direction } from './_red_black_node.ts';
import type { BinarySearchTree } from './binary_search_tree.ts';

export const internals: {
  getRoot<T>(tree: BinarySearchTree<T>): BinarySearchNode<T> | null;

  setRoot<T>(tree: BinarySearchTree<T>, node: BinarySearchNode<T> | null): void;

  getCompare<T>(tree: BinarySearchTree<T>): (a: T, b: T) => number;

  setCompare<T>(
    tree: BinarySearchTree<T>,
    compare: (a: T, b: T) => number,
  ): void;

  findNode<T>(tree: BinarySearchTree<T>, value: T): BinarySearchNode<T> | null;

  rotateNode<T>(
    tree: BinarySearchTree<T>,
    node: BinarySearchNode<T>,
    direction: Direction,
  ): void;

  insertNode<T>(
    tree: BinarySearchTree<T>,
    Node: typeof BinarySearchNode,
    value: T,
  ): BinarySearchNode<T> | null;

  removeNode<T>(
    tree: BinarySearchTree<T>,
    node: BinarySearchNode<T>,
  ): BinarySearchNode<T> | null;

  setSize<T>(tree: BinarySearchTree<T>, size: number): void;
} = {} as typeof internals;
