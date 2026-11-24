const https = require('https')

const DEFAULT_ENDPOINT = 'https://chatapi.weixin.qq.com/openai/v1/chat/completions'
const DEFAULT_MODEL = 'Deepseek-v4-flash'

function redact(value) {
  return String(value || '').replace(/Bearer\s+[^\s,;]+/ig, 'Bearer [REDACTED]').replace(/(token|authorization|secret|cookie)\s*[:=]\s*[^,;\s]+/ig, '$1=[REDACTED]').slice(0, 1000)
}

function safeRequestId(headers) {
  const source = headers || {}
  for (const name of ['request-id', 'x-request-id', 'trace-id', 'x-trace-id']) {
    const value = source[name] || source[name.toLowerCase()]
    if (value) return String(value).slice(0, 160)
  }
  return ''
}

function upstreamDetails(statusCode, headers, raw, parsed) {
  const bodyType = parsed && typeof parsed === 'object' ? 'json' : 'text'
  const root = parsed && typeof parsed === 'object' ? parsed : {}
  const nested = root.error && typeof root.error === 'object' ? root.error : {}
  const code = nested.code || root.code || root.errcode || root.error_code || ''
  const message = nested.message || nested.errmsg || root.message || root.errmsg || root.msg || ''
  return { upstreamStatus: statusCode, upstreamCode: redact(code), upstreamMessage: redact(message || (bodyType === 'text' ? raw : '')), upstreamBodyType: bodyType, requestId: safeRequestId(headers) }
}

function postJson(url, body, headers) {
  return new Promise((resolve, reject) => {
    const target = new URL(url)
    const request = https.request({
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || 443,
      path: `${target.pathname}${target.search}`,
      method: 'POST',
      headers: Object.assign({ 'content-type': 'application/json' }, headers || {})
    }, response => {
      let raw = ''
      response.setEncoding('utf8')
      response.on('data', chunk => { raw += chunk })
      response.on('end', () => {
        let parsed = null
        try { parsed = raw ? JSON.parse(raw) : null } catch (error) { parsed = null }
        if (response.statusCode < 200 || response.statusCode >= 300) {
          const details = upstreamDetails(response.statusCode, response.headers, raw, parsed)
          const error = new Error(details.upstreamMessage || `UPSTREAM_HTTP_${response.statusCode}`)
          error.statusCode = response.statusCode
          error.details = details
          return reject(error)
        }
        resolve(parsed)
      })
    })
    request.on('error', reject)
    request.setTimeout(30000, () => request.destroy(new Error('UPSTREAM_TIMEOUT')))
    request.write(JSON.stringify(body))
    request.end()
  })
}

exports.main = async event => {
  const token = process.env.CODING_PLAN_TOKEN || ''
  if (!token) return { success: false, code: 'CODING_PLAN_TOKEN_MISSING', message: 'Coding Plan Token 未配置在云函数环境变量中' }
  const input = event || {}
  const messages = Array.isArray(input.messages) ? input.messages.slice(-12).map(item => ({
    role: ['system', 'user', 'assistant'].includes(item && item.role) ? item.role : 'user',
    content: String(item && item.content || '').slice(0, 12000)
  })) : []
  if (!messages.length) return { success: false, code: 'INVALID_MESSAGES', message: 'messages 不能为空' }
  try {
    const requestBody = {
      model: process.env.CODING_PLAN_MODEL || DEFAULT_MODEL,
      messages,
      max_tokens: Number.isFinite(input.max_tokens) ? Math.min(Math.max(input.max_tokens, 1), 4096) : 1200
    }
    if (Number.isFinite(input.temperature)) requestBody.temperature = Math.min(Math.max(input.temperature, 0), 1.2)
    const response = await postJson(process.env.CODING_PLAN_ENDPOINT || DEFAULT_ENDPOINT, requestBody, { Authorization: `Bearer ${token}` })
    return { success: true, provider: 'wechat-coding-plan', model: response.model || process.env.CODING_PLAN_MODEL || DEFAULT_MODEL, response }
  } catch (error) {
    const details = error.details || { upstreamStatus: error.statusCode || null, upstreamCode: '', upstreamMessage: redact(error.message), upstreamBodyType: 'unknown', requestId: '' }
    console.error('[CODING_PLAN_PROXY_ERROR]', { upstreamStatus: details.upstreamStatus, upstreamCode: details.upstreamCode, upstreamMessage: details.upstreamMessage, upstreamBodyType: details.upstreamBodyType, requestId: details.requestId })
    return Object.assign({ success: false, provider: 'wechat-coding-plan', model: process.env.CODING_PLAN_MODEL || DEFAULT_MODEL, code: error.statusCode === 429 ? 'CODING_PLAN_RATE_LIMITED' : 'CODING_PLAN_UPSTREAM_ERROR' }, details)
  }
}
