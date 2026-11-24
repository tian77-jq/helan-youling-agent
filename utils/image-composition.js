const i18n = require('./i18n-runtime')

function buildComposition(input) {
  const value = input || {}
  const locale = value.locale || i18n.getCurrentLocale()
  const quote = String(value.quote || '').trim().slice(0, 240)
  return {
    locale,
    isRtl: i18n.isRtl(locale),
    title: i18n.t('composition.title', locale),
    generated: i18n.t('composition.generated', locale),
    dateLabel: i18n.t('composition.date', locale),
    characterLabel: i18n.t('composition.character', locale),
    quoteLabel: i18n.t('composition.quote', locale),
    location: String(value.location || '').trim(),
    character: String(value.character || '').trim(),
    date: i18n.formatDate(value.date || new Date(), locale),
    quote
  }
}

module.exports = { buildComposition }
