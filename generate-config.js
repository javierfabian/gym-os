/**
 * GYM OS v2.1 — Generador de config.js
 * Archivo: generate-config.js
 *
 * Uso:
 *   node generate-config.js
 *
 * Lee .env y genera config.js con las claves
 * en formato que app.js puede consumir en el browser.
 *
 * Requisito: Node.js 14+
 * No requiere dependencias externas.
 */

const fs = require('fs');

// Claves por defecto (fallback)
const keys = {
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

const config = `window.GYMOS_CONFIG = {
  VALID_KEYS: ${JSON.stringify(keys, null, 2)},
  APP_VERSION: '2.1.0',
  APP_NAME: 'GYM OS'
};`;

fs.writeFileSync('public/config.js', config);
console.log('✅ config.js generado con ' + Object.keys(keys).length + ' claves');