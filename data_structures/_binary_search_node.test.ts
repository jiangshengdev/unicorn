// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import assert from 'node:assert/strict';
import { BinarySearchNode } from "./_binary_search_node.ts";

let parent: BinarySearchNode<number>;
let child: BinarySearchNode<number>;
function beforeEach() {
  parent = new BinarySearchNode(null, 5);
  child = new BinarySearchNode(parent, 7);
  parent.right = child;
}

test("BinarySearchNode", () => {
  beforeEach();
  assert.strictEqual(parent.parent, null);
  assert.strictEqual(parent.left, null);
  assert.strictEqual(parent.right, child);
  assert.strictEqual(parent.value, 5);

  assert.strictEqual(child.parent, parent);
  assert.strictEqual(child.left, null);
  assert.strictEqual(child.right, null);
  assert.strictEqual(child.value, 7);
});

test("BinarySearchNode.from()", () => {
  beforeEach();
  const parentClone: BinarySearchNode<number> = BinarySearchNode.from(parent);
  const childClone: BinarySearchNode<number> = BinarySearchNode.from(child);

  assert.strictEqual(parentClone.parent, null);
  assert.strictEqual(parentClone.left, null);
  assert.strictEqual(parentClone.right, child);
  assert.strictEqual(parentClone.value, 5);

  assert.strictEqual(childClone.parent, parent);
  assert.strictEqual(childClone.left, null);
  assert.strictEqual(childClone.right, null);
  assert.strictEqual(childClone.value, 7);
});

test("BinarySearchNode.directionFromParent()", () => {
  beforeEach();
  const child2 = new BinarySearchNode(parent, 3);
  assert.strictEqual(child2.directionFromParent(), null);
  parent.left = child2;
  assert.strictEqual(child2.directionFromParent(), "left");
  assert.strictEqual(parent.directionFromParent(), null);
  assert.strictEqual(child.directionFromParent(), "right");
});

test("BinarySearchNode.findMinNode()", () => {
  beforeEach();
  assert.strictEqual(parent.findMinNode(), parent);
  const child2 = new BinarySearchNode(parent, 3);
  parent.left = child2;
  assert.strictEqual(parent.findMinNode(), child2);
  const child3 = new BinarySearchNode(child2, 4);
  child2.right = child3;
  assert.strictEqual(parent.findMinNode(), child2);
  const child4 = new BinarySearchNode(child2, 2);
  child2.left = child4;
  assert.strictEqual(parent.findMinNode(), child4);
});

test("BinarySearchNode.findMaxNode()", () => {
  beforeEach();
  assert.strictEqual(parent.findMaxNode(), child);
  const child2 = new BinarySearchNode(child, 6);
  child.left = child2;
  assert.strictEqual(parent.findMaxNode(), child);
  const child3 = new BinarySearchNode(child2, 6.5);
  child2.right = child3;
  assert.strictEqual(parent.findMaxNode(), child);
  const child4 = new BinarySearchNode(child2, 8);
  child.right = child4;
  assert.strictEqual(parent.findMaxNode(), child4);
  parent.right = null;
  assert.strictEqual(parent.findMaxNode(), parent);
});

test("BinarySearchNode.findSuccessorNode()", () => {
  beforeEach();
  assert.strictEqual(parent.findSuccessorNode(), child);
  assert.strictEqual(child.findSuccessorNode(), null);
  const child2 = new BinarySearchNode(child, 6);
  child.left = child2;
  assert.strictEqual(parent.findSuccessorNode(), child2);
  assert.strictEqual(child.findSuccessorNode(), null);
});
