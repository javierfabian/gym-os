const fs = require('fs');
const path = require('path');

// Claves hardcodeadas (sin depender de .env)
const validKeys = {
  'GYMO-BSIC-2025-DEV1': 'basic',
  'GYMO-BSIC-2025-CUST001': 'basic',
  'GYMO-BSIC-2025-CUST002': 'basic',
  'GYMO-BSIC-2025-CUST003': 'basic',
  'GYMO-BSIC-2025-CUST004': 'basic',
  'GYMO-BSIC-2025-CUST005': 'basic',
  'GYMO-PREM-2025-DEV1': 'premium',
  'GYMO-PREM-2025-CUST001': 'premium',
  'GYMO-PREM-2025-CUST002': 'premium',
  'GYMO-PREM-2025-CUST003': 'premium',
  'GYMO-PREM-2025-CUST004': 'premium'
};

const keyCount = Object.keys(validKeys).length;
const basicCount = Object.values(validKeys).filter(v => v === 'basic').length;
const premiumCount = Object.values(validKeys).filter(v => v === 'premium').length;

const configContent = `window.GYMOS_CONFIG = {
  appName: 'GYM OS',
  appVersion: '2.1.0',
  env: 'production',
  VALID_KEYS: ${JSON.stringify(validKeys, null, 2)}
};`;

const configPath = path.join(__dirname, 'public', 'config.js');
fs.writeFileSync(configPath, configContent, 'utf8');

console.log(`✅ config.js generado con ${keyCount} claves`);
console.log(`   ${basicCount} básicas`);
console.log(`   ${premiumCount} premium`);