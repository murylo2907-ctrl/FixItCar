import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const isWin = process.platform === 'win32'

function run(label, cwd, script) {
  const cmd = isWin ? 'npm.cmd' : 'npm'
  const child = spawn(cmd, ['run', script], {
    cwd,
    stdio: 'inherit',
    shell: isWin,
    env: process.env,
  })
  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`[${label}] encerrou com código ${code}`)
      process.exit(code)
    }
  })
  return child
}

console.log('FixIt Car — subindo API (4000) e app (5173)…\n')

const api = run('api', join(root, 'backend'), 'dev')
const web = run('web', join(root, 'frontend'), 'dev')

function shutdown() {
  api.kill()
  web.kill()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
