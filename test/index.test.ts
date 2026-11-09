import { test } from 'node:test'
import assert from 'node:assert'
import { safeJoin } from '../index.js'
import { resolve } from 'node:path'

const cases: [root: string, ...parts: string[]][] = [
  ['/path/to/project', 'a', 'b'],
  ['x', 'a', 'b'],
]

for (const [_root, ...parts] of cases) {
  test(`escape test: ${_root} ${parts.join(',')}`, async () => {
    // resolve the root to avoid win32/unix issues
    const root = resolve(_root)
    assert(safeJoin(root, ...parts).startsWith(root))
  })
}
