import { join } from 'path'

/**
 * Promise: the resulting path CANNOT escape the root!
 * 
 * @param {string} root
 * @param {string[]} paths
 */
export function safeJoin(root, ...paths) {
  return join(root, ...paths)
}
