// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import assert from 'node:assert/strict';
import { ascend, descend } from './comparators.ts';

test('ascend() works as expected', () => {
  assert.strictEqual(ascend(2, 2), 0);
  assert.strictEqual(ascend(2, 3), -1);
  assert.strictEqual(ascend(3, 2), 1);
  assert.strictEqual(ascend('b', 'b'), 0);
  assert.strictEqual(ascend('a', 'b'), -1);
  assert.strictEqual(ascend('b', 'a'), 1);
  assert.strictEqual(ascend('b', 'b0'), -1);
  assert.strictEqual(ascend('b0', 'b'), 1);
  assert.strictEqual(ascend('2020-05-20', '2020-05-20'), 0);
  assert.strictEqual(ascend('2020-05-19', '2020-05-20'), -1);
  assert.strictEqual(ascend('2020-05-20', '2020-05-19'), 1);
  assert.strictEqual(ascend(new Date('2020-05-20'), new Date('2020-05-20')), 0);
  assert.strictEqual(
    ascend(new Date('2020-05-19'), new Date('2020-05-20')),
    -1,
  );
  assert.strictEqual(ascend(new Date('2020-05-20'), new Date('2020-05-19')), 1);
  assert.strictEqual(ascend<string | number>(-10, '-10'), 0);
  assert.strictEqual(ascend<string | number>('-10', -10), 0);
  assert.strictEqual(ascend<string | number>(-9, '-10'), 1);
  assert.strictEqual(ascend<string | number>('-9', -10), 1);
  assert.strictEqual(ascend<string | number>(-10, '-9'), -1);
  assert.strictEqual(ascend<string | number>('-10', -9), -1);
});

test('descend() works as expected', () => {
  assert.strictEqual(descend(2, 2), 0);
  assert.strictEqual(descend(2, 3), 1);
  assert.strictEqual(descend(3, 2), -1);
  assert.strictEqual(descend('b', 'b'), 0);
  assert.strictEqual(descend('a', 'b'), 1);
  assert.strictEqual(descend('b', 'a'), -1);
  assert.strictEqual(descend('b', 'b0'), 1);
  assert.strictEqual(descend('b0', 'b'), -1);
  assert.strictEqual(descend('2020-05-20', '2020-05-20'), 0);
  assert.strictEqual(descend('2020-05-19', '2020-05-20'), 1);
  assert.strictEqual(descend('2020-05-20', '2020-05-19'), -1);
  assert.strictEqual(
    descend(new Date('2020-05-20'), new Date('2020-05-20')),
    0,
  );
  assert.strictEqual(
    descend(new Date('2020-05-19'), new Date('2020-05-20')),
    1,
  );
  assert.strictEqual(
    descend(new Date('2020-05-20'), new Date('2020-05-19')),
    -1,
  );
  assert.strictEqual(descend<string | number>(-10, '-10'), 0);
  assert.strictEqual(descend<string | number>('-10', -10), 0);
  assert.strictEqual(descend<string | number>(-9, '-10'), -1);
  assert.strictEqual(descend<string | number>('-9', -10), -1);
  assert.strictEqual(descend<string | number>(-10, '-9'), 1);
  assert.strictEqual(descend<string | number>('-10', -9), 1);
});
