import { safeJoin } from '../index.js'

let threw = false
try {
  safeJoin('/root', '../etc/passwd')
} catch {
  threw = true
}
if (!threw) throw new Error('safeJoin let a path escape the root')
