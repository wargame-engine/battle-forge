import { mergeWith } from 'lodash';
export function customMerge(object, sources) {
  return mergeWith(object, sources, ((objValue, srcValue) => {
    if (srcValue === undefined) {
      return undefined;
    }
  }))
}

export const insert = (arr, index, newItem) => [
  ...arr.slice(0, index),
  newItem,
  ...arr.slice(index)
];