'use client';

// Tiny deep-merge utility used by the chart base wrapper. Arrays are
// replaced (not merged) which matches the semantics callers expect for
// Highcharts options like `series`, `colors`, `responsive.rules`.

type AnyObj = Record<string, any>;

function isPlainObject(value: unknown): value is AnyObj {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

export function mergeDeep<T extends AnyObj, U extends AnyObj>(target: T, source: U): T & U {
  const out: AnyObj = Object.keys(source).reduce(
    (acc, key) => {
      const tv = (target as AnyObj)[key];
      const sv = (source as AnyObj)[key];
      if (isPlainObject(tv) && isPlainObject(sv)) {
        acc[key] = mergeDeep(tv, sv);
      } else if (sv !== undefined) {
        acc[key] = sv;
      }
      return acc;
    },
    { ...target } as AnyObj
  );
  return out as T & U;
}
