// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

/**
 * 使用 JavaScript 内置的比较运算符以升序比较两个值。
 *
 * @example 比较数字
 * ```ts
 * import { ascend } from "@std/data-structures";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(ascend(1, 2), -1);
 * assertEquals(ascend(2, 1), 1);
 * assertEquals(ascend(1, 1), 0);
 * ```
 *
 * @typeparam T 被比较值的类型。
 * @param a 左边的比较值。
 * @param b 右边的比较值。
 * @returns 如果 `a` 小于 `b` 返回 -1，如果 `a` 等于 `b` 返回 0，如果 `a` 大于 `b` 返回 1。
 */
export function ascend<T>(a: T, b: T): -1 | 0 | 1 {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * 使用 JavaScript 内置的比较运算符以降序比较两个值。
 *
 * @example 比较数字
 * ```ts
 * import { descend } from "@std/data-structures";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(descend(1, 2), 1);
 * assertEquals(descend(2, 1), -1);
 * assertEquals(descend(1, 1), 0);
 * ```
 *
 * @typeparam T 被比较值的类型。
 * @param a 左边的比较值。
 * @param b 右边的比较值。
 * @returns 如果 `a` 大于 `b` 返回 -1，如果 `a` 等于 `b` 返回 0，如果 `a` 小于 `b` 返回 1。
 */
export function descend<T>(a: T, b: T): -1 | 0 | 1 {
  return a < b ? 1 : a > b ? -1 : 0;
}
