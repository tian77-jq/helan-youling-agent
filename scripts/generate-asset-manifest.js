const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const root = path.resolve(__dirname, '..')
const assetRoot = path.join(root, 'assets')
const files = []
function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name)
    if (item.isDirectory()) walk(file)
    else files.push(file)
  }
}
walk(assetRoot)
const entries = files.sort().map(file => {
  const relative = path.relative(root, file).replace(/\\/g, '/')
  const buffer = fs.readFileSync(file)
  return {
    assetId: `asset-${crypto.createHash('sha1').update(relative).digest('hex').slice(0, 12)}`,
    path: relative,
    hash: `sha256:${crypto.createHash('sha256').update(buffer).digest('hex')}`,
    type: path.extname(file).slice(1).toLowerCase() || 'unknown',
    fileSize: buffer.length,
    usedBy: [],
    creator: 'USER_CONFIRMATION_REQUIRED',
    source: 'USER_CONFIRMATION_REQUIRED',
    sourceUrl: '',
    license: 'LICENSE_UNKNOWN',
    licenseUrl: '',
    licenseCheckedAt: '',
    projectOwned: 'USER_CONFIRMATION_REQUIRED',
    thirdParty: 'USER_CONFIRMATION_REQUIRED',
    aiGenerated: 'USER_CONFIRMATION_REQUIRED',
    officialBrandAsset: false,
    researchOnly: false,
    commercialUse: false,
    modificationAllowed: false,
    attributionRequired: 'USER_CONFIRMATION_REQUIRED',
    demoAllowed: true,
    productionAllowed: false,
    transferAllowed: false,
    status: 'LICENSE_UNKNOWN',
    risk: '来源与商业许可未核验，禁止进入商业交付'
  }
})
const manifest = {
  schemaVersion: '2.0',
  policy: 'PUBLIC_ON_INTERNET_IS_NOT_COMMERCIAL_LICENSED',
  defaultStatus: 'LICENSE_UNKNOWN',
  entries
}
fs.writeFileSync(path.join(assetRoot, 'asset-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`[ASSET_MANIFEST_GENERATOR] entries=${entries.length} status=LICENSE_UNKNOWN productionAllowed=0`)
