import { test } from 'node:test'
import assert from 'node:assert'
import { safeJoin } from '../index.js'
import { resolve, join, sep } from 'node:path'

const cases: [root: string, ...parts: string[]][] = [
  ['/path/to/project', 'a', 'b'],
  ['x', 'a', 'b'],
  ['/path/to/project', '..'],
  ['/path/to/project', '../c'],
  ['/path/to/project', '../../../../etc/passwd'],
  ['/path/to/project', 'a', '..', '..', 'b'],
  ['/path/to/project', 'a/../../b'],
  ['/path/to/project', 'a\\..\\..\\..\\b'],
  ['/path/to/project', '/etc/passwd'],
  ['/path/to/project', 'a', '/../../etc'],
  ['x', '../../y'],
]

const inside = (root: string, p: string) =>
  p === root || p.startsWith(root.endsWith(sep) ? root : root + sep)

for (const [_root, ...parts] of cases) {
  test(`escape test: ${_root} ${parts.join(',')}`, async () => {
    // resolve the root to avoid win32/unix issues
    const root = resolve(_root)
    let result: string = ''
    assert.doesNotThrow(() => {
      result = safeJoin(root, ...parts)
    })
    assert(inside(root, resolve(result)), `${result} escapes ${root}`)
  })
}

test('normal paths behave like path.join', () => {
  const root = resolve('/path/to/project')
  assert.equal(safeJoin(root, 'a', 'b'), join(root, 'a', 'b'))
  assert.equal(safeJoin(root, 'a/./b', '../c'), join(root, 'a', 'c'))
  assert.equal(safeJoin(root), join(root))
  assert.equal(safeJoin(root, '..'), join(root))
  assert.equal(safeJoin(root, '../c'), join(root, 'c'))
})
