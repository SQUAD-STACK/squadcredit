/**
 * React 19 + TypeScript 5.6+ compatibility fix.
 *
 * TS 5.6 changed the built-in Iterator protocol so that built-in iterators
 * (ArrayIterator, MapIterator, SetIterator, etc.) no longer satisfy the
 * stricter Iterable<T> constraint. This declaration patches the missing
 * `next` signature on all affected iterator types.
 *
 * See: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/71002
 */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ArrayIterator<T> {
    next(...[value]: [] | [undefined]): IteratorResult<T, undefined>;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface MapIterator<T> {
    next(...[value]: [] | [undefined]): IteratorResult<T, undefined>;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface SetIterator<T> {
    next(...[value]: [] | [undefined]): IteratorResult<T, undefined>;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface StringIterator<T> {
    next(...[value]: [] | [undefined]): IteratorResult<T, undefined>;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface IterableIterator<T, TReturn = any, TNext = any> {
    next(...[value]: [] | [TNext]): IteratorResult<T, TReturn>;
  }
}

export {};
