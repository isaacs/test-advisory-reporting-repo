import { isAbsolute, join, resolve, sep } from 'path'

const splitRe = sep === '\\' ? /[\\/]+/ : /\/+/

/**
 * Promise: the resulting path CANNOT escape the root!
 *
 * `..` segments are resolved against the root, and never go above it,
 * the same way `..` at the filesystem root stays at the filesystem root.
 * Absolute paths in `paths` are treated as relative to `root`.
 * This never throws on a hostile path.
 *
 * @param {string} root
 * @param {string[]} paths
 */
export function safeJoin(root, ...paths) {
  const stack = []
  for (const p of paths) {
    for (const seg of String(p).split(splitRe)) {
      if (seg === '' || seg === '.') continue
      if (seg === '..') stack.pop()
      else stack.push(seg)
    }
  }
  return join(root, ...stack)
}

/**
 * Promise: true only when `path` is `root` or inside it.
 * A `path` that is not absolute is rejected (returns false), rather
 * than being resolved against the current working directory.
 *
 * @param {string} root
 * @param {string} path
 */
export function isInside(root, path) {
  if (!isAbsolute(String(path))) return false
  const r = resolve(root)
  const p = resolve(path)
  if (p === r) return true
  // require a path separator right after the root, so that a sibling
  // such as `/srv/app-secrets` is not considered inside `/srv/app`
  const prefix = r.endsWith(sep) ? r : r + sep
  return p.startsWith(prefix)
}
