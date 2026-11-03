// Isolated HTTP loopback test, with a mock upstream. No Oracle, real credentials, or TLS issuance.
import assert from 'node:assert/strict'
import http from 'node:http'
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { once } from 'node:events'

const executable = process.argv[2]
if (!executable) throw new Error('Usage: node verify-proxy.mjs path-to-caddy.exe')
const origin = 'https://ywjang.github.io'
let writes = 0
const upstream = http.createServer((request, response) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) writes++
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify({ mock: true, receivedAuthorization: !!request.headers.authorization }))
})
upstream.listen(0, '127.0.0.1')
await once(upstream, 'listening')
const probe = http.createServer()
probe.listen(0, '127.0.0.1')
await once(probe, 'listening')
const port = probe.address().port
await new Promise(resolve => probe.close(resolve))
const directory = await mkdtemp(join(tmpdir(), 'academic-proxy-test-'))
const template = await readFile(new URL(process.argv[3] || './Caddyfile', import.meta.url), 'utf8')
const config = template.replace('{$API_DOMAIN}', `http://127.0.0.1:${port}`)
  .replace('http://127.0.0.1:18091 {', `http://127.0.0.1:${port} {`)
  .replaceAll('127.0.0.1:8091', `127.0.0.1:${upstream.address().port}`)
  .replace('email {$ACME_EMAIL}', 'auto_https off')
await writeFile(join(directory, 'Caddyfile'), config)
const child = spawn(executable, ['run', '--config', join(directory, 'Caddyfile'), '--adapter', 'caddyfile'], {
  windowsHide: true,
  env: { ...process.env, WEB_VIEWER_USER: 'Bob',
    WEB_VIEWER_HASH: '$2a$14$Zkx19XLiW6VYouLHR5NmfOFU0z2GTNmpkT/5qqR7hx4IjWJPDhjvG',
    XDG_DATA_HOME: directory, XDG_CONFIG_HOME: directory },
  stdio: ['ignore', 'pipe', 'pipe'],
})
let log = ''
child.stderr.on('data', chunk => { log += chunk })
const base = `http://127.0.0.1:${port}`
const auth = 'Basic ' + Buffer.from('Bob:hiccup').toString('base64') // public Caddy documentation fixture
try {
  let ready = false
  for (let attempt = 0; attempt < 60; attempt++) {
    if (child.exitCode !== null) throw new Error('Caddy exited: ' + log)
    try { await fetch(base); ready = true; break } catch { await new Promise(resolve => setTimeout(resolve, 100)) }
  }
  assert.ok(ready, 'proxy readiness')
  let checks = 0
  const check = (actual, expected) => { assert.equal(actual, expected); checks++ }
  let result = await fetch(base + '/api/system', { headers: { Origin: origin } })
  check(result.status, 401)
  check(result.headers.get('access-control-allow-origin'), origin)
  result = await fetch(base + '/api/system', { method: 'OPTIONS', headers: {
    Origin: origin, 'Access-Control-Request-Method': 'GET', 'Access-Control-Request-Headers': 'authorization',
  } })
  check(result.status, 204)
  check(result.headers.get('access-control-allow-headers'), 'Authorization, Content-Type, Accept')
  result = await fetch(base + '/api/system', { headers: { Origin: origin, Authorization: auth } })
  check(result.status, 200)
  const body = await result.json()
  check(body.mock, true)
  check(body.receivedAuthorization, false)
  result = await fetch(base + '/api/system', { headers: { Authorization: 'Basic ' + Buffer.from('Bob:wrong').toString('base64') } })
  check(result.status, 401)
  result = await fetch(base + '/api/system', { headers: { Origin: 'https://untrusted.example', Authorization: auth } })
  check(result.status, 403)
  check(result.headers.get('access-control-allow-origin'), null)
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    result = await fetch(base + '/api/academic/students', { method, headers: { Origin: origin, Authorization: auth } })
    check(result.status, 403)
  }
  check(writes, 0)
  result = await fetch(base + '/news-feed', { headers: { Origin: origin } })
  check(result.status, 200)
  result = await fetch(base + '/private-file')
  check(result.status, 404)
  console.log(JSON.stringify({ checks, passed: true, upstream: 'LOOPBACK_MOCK', oracleRequests: 0, publicPorts: 0 }))
} finally {
  child.kill()
  if (child.exitCode === null) await once(child, 'exit')
  await new Promise(resolve => upstream.close(resolve))
  await rm(directory, { recursive: true, force: true })
}
