// 仅允许调用已由项目方配置“免费额度保护”的服务端适配器。
function isAvailable() { return false }
function synthesize() { return Promise.reject(new Error('TENCENT_TTS_NOT_CONFIGURED')) }
module.exports = { id: 'TENCENT_TTS', isAvailable, synthesize }
