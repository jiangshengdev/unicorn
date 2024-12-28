import { descend } from './comparators.ts';

function swap<T>(array: T[], a: number, b: number) {
  const temp = array[a];
  array[a] = array[b]!;
  array[b] = temp!;
}

function getParentIndex(index: number) {
  return Math.floor((index + 1) / 2) - 1;
}

export class BinaryHeap<T> implements Iterable<T> {
  #data: T[] = [];
  #compare: (a: T, b: T) => number;

  constructor(compare: (a: T, b: T) => number = descend) {
    if (typeof compare !== 'function') {
      throw new TypeError(
        "Cannot construct a BinaryHeap: the 'compare' parameter is not a function, did you mean to call BinaryHeap.from?",
      );
    }
    this.#compare = compare;
  }

  toArray(): T[] {
    return Array.from(this.#data);
  }

  static from<T>(
    collection: ArrayLike<T> | Iterable<T> | BinaryHeap<T>,
    options?: {
      compare?: (a: T, b: T) => number;
    },
  ): BinaryHeap<T>;

  static from<T, U, V = undefined>(
    collection: ArrayLike<T> | Iterable<T> | BinaryHeap<T>,
    options: {
      compare?: (a: U, b: U) => number;
      map: (value: T, index: number) => U;
      thisArg?: V;
    },
  ): BinaryHeap<U>;
  static from<T, U, V>(
    collection: ArrayLike<T> | Iterable<T> | BinaryHeap<T>,
    options?: {
      compare?: (a: U, b: U) => number;
      map?: (value: T, index: number) => U;
      thisArg?: V;
    },
  ): BinaryHeap<U> {
    let result: BinaryHeap<U>;
    let unmappedValues: ArrayLike<T> | Iterable<T> = [];
    if (collection instanceof BinaryHeap) {
      result = new BinaryHeap(
        options?.compare ?? (collection as unknown as BinaryHeap<U>).#compare,
      );
      if (options?.compare || options?.map) {
        unmappedValues = collection.#data;
      } else {
        result.#data = Array.from(collection.#data as unknown as U[]);
      }
    } else {
      result = options?.compare
        ? new BinaryHeap(options.compare)
        : new BinaryHeap();
      unmappedValues = collection;
    }
    const values: Iterable<U> = options?.map
      ? Array.from(unmappedValues, options.map, options.thisArg)
      : (unmappedValues as U[]);
    result.push(...values);
    return result;
  }

  get length(): number {
    return this.#data.length;
  }

  peek(): T | undefined {
    return this.#data[0];
  }

  pop(): T | undefined {
    const size: number = this.#data.length - 1;
    swap(this.#data, 0, size);
    let parent = 0;
    let right: number = 2 * (parent + 1);
    let left: number = right - 1;
    while (left < size) {
      const greatestChild =
        right === size ||
        this.#compare(this.#data[left]!, this.#data[right]!) <= 0
          ? left
          : right;
      if (this.#compare(this.#data[greatestChild]!, this.#data[parent]!) < 0) {
        swap(this.#data, parent, greatestChild);
        parent = greatestChild;
      } else {
        break;
      }
      right = 2 * (parent + 1);
      left = right - 1;
    }
    return this.#data.pop();
  }

  push(...values: T[]): number {
    for (const value of values) {
      let index: number = this.#data.length;
      let parent: number = getParentIndex(index);
      this.#data.push(value);
      while (
        index !== 0 &&
        this.#compare(this.#data[index]!, this.#data[parent]!) < 0
      ) {
        swap(this.#data, parent, index);
        index = parent;
        parent = getParentIndex(index);
      }
    }
    return this.#data.length;
  }

  clear() {
    this.#data = [];
  }

  isEmpty(): boolean {
    return this.#data.length === 0;
  }

  *drain(): IterableIterator<T> {
    while (!this.isEmpty()) {
      yield this.pop() as T;
    }
  }

  *[Symbol.iterator](): IterableIterator<T> {
    yield* this.drain();
  }
}
