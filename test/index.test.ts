import { test } from 'node:test'
import assert from 'node:assert'
import { isInside, safeJoin } from '../index.js'
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

test('isInside', () => {
  const root = resolve('/path/to/project')
  assert.equal(isInside(root, root), true)
  assert.equal(isInside(root, join(root, 'a', 'b')), true)
  assert.equal(isInside(root, resolve('/path/to')), false)
  assert.equal(isInside(root, resolve('/etc/passwd')), false)
})

test('isInside rejects sibling folders that share the root name as a prefix', () => {
  const root = resolve('/srv/app')
  assert.equal(isInside(root, resolve('/srv/app-secrets/key')), false)
  assert.equal(isInside(root, resolve('/srv/application')), false)
  assert.equal(isInside(root + sep, resolve('/srv/app-secrets/key')), false)
  assert.equal(isInside(root, root + sep), true)
  assert.equal(isInside(root, join(root, 'key')), true)
  assert.equal(isInside(root + sep, join(root, 'key')), true)
  // filesystem root contains everything
  const fsRoot = resolve('/')
  assert.equal(isInside(fsRoot, resolve('/etc/passwd')), true)
  assert.equal(isInside(fsRoot, fsRoot), true)
})

test('isInside rejects a path that is not absolute', () => {
  // relative paths would otherwise be resolved against process.cwd()
  const root = process.cwd()
  assert.equal(isInside(root, 'a'), false)
  assert.equal(isInside(root, join('a', 'b')), false)
  assert.equal(isInside(root, '.'), false)
  assert.equal(isInside(root, ''), false)
  assert.equal(isInside(root, join(root, 'a')), true)
})
