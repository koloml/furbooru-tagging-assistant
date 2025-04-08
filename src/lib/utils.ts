/**
 * Traverse and find the object using the key path.
 * @param targetObject Target object to traverse into.
 * @param path Path of keys to traverse deep into the object.
 * @return Resulting object or null if nothing found (or target entry is not an object).
 */
export function findDeepObject(targetObject: Record<string, any>, path: string[]): Object|null {
  let result = targetObject;

  for (const key of path) {
    if (!result || typeof result !== 'object') {
      return null;
    }

    result = result[key];
  }

  if (!result || typeof result !== "object") {
    return null;
  }

  return result;
}
