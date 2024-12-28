import { RedBlackTree } from '../data_structures/red_black_tree.ts';
import { RedBlackNode } from '../data_structures/_red_black_node.js';
import { internals } from '../data_structures/_binary_search_tree_internals.js';
import chalk from 'chalk';

const { getRoot } = internals;

/**
 * 为了打印，需要先递归分配每个节点在 2D 平面中的位置：
 * - depth 代表该节点在树的深度(从 0 开始)
 * - x 表示它在当前层中的相对顺序
 *
 * 返回值会累积一个全局的 Map<RedBlackNode<T>, [depth, x]>。
 */
function assignPositions<T>(
  node: RedBlackNode<T> | null,
  depth = 0,
  posMap = new Map<RedBlackNode<T>, [number, number]>(),
  x = 0,
): { posMap: Map<RedBlackNode<T>, [number, number]>; xCount: number } {
  if (!node) {
    return { posMap, xCount: x };
  }

  // 先递归左子树
  let { posMap: leftMap, xCount } = assignPositions(
    node.left,
    depth + 1,
    posMap,
    x,
  );

  // 当前节点位置
  posMap.set(node, [depth, xCount]);
  xCount++;

  // 再递归右子树
  let { posMap: rightMap, xCount: finalCount } = assignPositions(
    node.right,
    depth + 1,
    leftMap,
    xCount,
  );

  return { posMap: rightMap, xCount: finalCount };
}

/**
 * 获取树高，用于后面计算打印行数和大致宽度
 */
function getTreeHeight<T>(root: RedBlackNode<T> | null): number {
  if (!root) return 0;
  return 1 + Math.max(getTreeHeight(root.left), getTreeHeight(root.right));
}

/**
 * 打印红黑树主函数
 * - tree: RedBlackTree<T> 实例
 *
 * 整体思路与 Python 示例类似，先分配各节点坐标，再将它们映射到字符“画布”中绘制。
 *
 * 会在每个节点值后拼接 “(R)” 或 “(B)”，表示红黑。
 */
export function printRedBlackTree<T>(tree: RedBlackTree<T>): void {
  const root = getRoot(tree) as RedBlackNode<T> | null;
  if (!root) {
    console.log('(empty tree)');
    return;
  }

  // 先给每个节点分配 (depth, x) 坐标
  const { posMap } = assignPositions(root);
  // 计算树的最大深度
  const height = getTreeHeight(root);

  // 这里粗略给定宽度(可按需微调)
  // 2^height 是该层最多节点数，乘以一个系数保证横向有足够空格
  const totalWidth = 2 ** height * 4;

  // 在“画布”上行数大概设为 height * 2，保证斜杠画出来不串行
  const lines = Array.from({ length: height * 2 }, () =>
    Array.from({ length: totalWidth }, () => ' '),
  );

  // 真正将节点绘制到 lines 中
  for (const [node, [depth, x]] of posMap.entries()) {
    const row = depth * 2; // 每一层节点与其斜线分开
    // 通过 x 对 totalWidth 做一个等比例放大，定位到列
    const col = Math.floor((x + 1) * (totalWidth / 2 ** height));

    // 节点显示内容：值 + (R) 或 (B)
    const text = `${node.value}${node.red ? '|R' : '|B'}`;

    // 将节点值写到画布中，尽量居中
    const startCol = col - Math.floor(text.length / 2);
    for (let i = 0; i < text.length; i++) {
      if (startCol + i >= 0 && startCol + i < totalWidth) {
        lines[row][startCol + i] = text[i];
      }
    }

    // 绘制与子节点之间的连线(斜杠 + 下划线)
    // 1) 左子树
    if (node.left) {
      const childPos = posMap.get(node.left)!;
      const childCol = Math.floor(
        (childPos[1] + 1) * (totalWidth / 2 ** height),
      );
      // 在本行的下一行(row+1)，左侧画 '/'
      if (col - 1 >= 0) {
        lines[row + 1][col - 1] = '/';
      }
      // 在 row+1 这行，从 childCol 一直到 col-1 之间填下划线
      const start = Math.min(childCol, col - 1);
      const end = Math.max(childCol, col - 1);
      for (let c = start; c < end; c++) {
        if (c >= 0 && c < totalWidth) {
          lines[row + 1][c] = '_';
        }
      }
    }

    // 2) 右子树
    if (node.right) {
      const childPos = posMap.get(node.right)!;
      const childCol = Math.floor(
        (childPos[1] + 1) * (totalWidth / 2 ** height),
      );
      // 在本行的下一行(row+1)，右侧画 '\'
      if (col + 1 < totalWidth) {
        lines[row + 1][col + 1] = '\\';
      }
      // 在 row+1 这行，从 col+2 一直到 childCol 间填下划线
      const start = Math.min(col + 2, childCol);
      const end = Math.max(col + 2, childCol);
      for (let c = start; c <= end; c++) {
        if (c >= 0 && c < totalWidth) {
          lines[row + 1][c] = '_';
        }
      }
    }
  }

  // 将每行数组合并为字符串，并去除尾部空格
  for (let i = 0; i < lines.length; i++) {
    let lineStr = lines[i].join('').trimEnd();
    // 使用正则替换整个节点文本并应用chalk颜色
    lineStr = lineStr
      .replace(/(\d+)\|R/g, (match, p1) => chalk.white.bgRed(` ${p1} `))
      .replace(/(\d+)\|B/g, (match, p1) => chalk.white.bgBlack(` ${p1} `));
    console.log(lineStr);
  }
}

function main() {
  let numbers = [6, 8, 10, 7, 9, 2, 1, 3, 4, 5];
  let tree = new RedBlackTree();

  for (let num of numbers) {
    tree.insert(num);
    console.log();
    console.log(`Insert ${num}:`);

    console.log();
    printRedBlackTree(tree);
    console.log();
  }
}

main();
