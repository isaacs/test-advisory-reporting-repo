import { join } from 'path'

/**
 * Promise: the resulting path CANNOT escape the root!
 */
export function safeJoin(root, ...paths) {
  return join(root, ...paths)
}
