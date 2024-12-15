import assert from 'node:assert/strict';
import { RedBlackNode } from './_red_black_node.ts';

test('RedBlackNode', () => {
  const parent: RedBlackNode<number> = new RedBlackNode(null, 5);
  const child: RedBlackNode<number> = new RedBlackNode(parent, 7);
  parent.left = child;
  assert.strictEqual(parent.red, true);
  parent.red = false;

  assert.strictEqual(parent.parent, null);
  assert.strictEqual(parent.left, child);
  assert.strictEqual(parent.right, null);
  assert.strictEqual(parent.value, 5);
  assert.strictEqual(parent.red, false);

  assert.strictEqual(child.parent, parent);
  assert.strictEqual(child.left, null);
  assert.strictEqual(child.right, null);
  assert.strictEqual(child.value, 7);
  assert.strictEqual(child.red, true);
});

test('RedBlackNode.from()', () => {
  const parent: RedBlackNode<number> = new RedBlackNode(null, 5);
  const child: RedBlackNode<number> = new RedBlackNode(parent, 7);
  parent.left = child;
  parent.red = false;

  const parentClone: RedBlackNode<number> = RedBlackNode.from(parent);
  const childClone: RedBlackNode<number> = RedBlackNode.from(child);

  assert.strictEqual(parentClone.parent, null);
  assert.strictEqual(parentClone.left, child);
  assert.strictEqual(parentClone.right, null);
  assert.strictEqual(parentClone.value, 5);
  assert.strictEqual(parentClone.red, false);

  assert.strictEqual(childClone.parent, parent);
  assert.strictEqual(childClone.left, null);
  assert.strictEqual(childClone.right, null);
  assert.strictEqual(childClone.value, 7);
  assert.strictEqual(childClone.red, true);
});
