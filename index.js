import { resolve, sep } from 'path'

/**
 * Promise: the resulting path CANNOT escape the root!
 * 
 * @param {string} root
 * @param {string[]} paths
 */
export function safeJoin(root, ...paths) {
  const base = resolve(root)
  const result = resolve(base, ...paths)
  if (result !== base && !result.startsWith(base + sep)) {
    throw new Error('the path escapes the root')
  }
  return result
}
