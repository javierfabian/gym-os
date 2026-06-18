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

const fs   = require('fs');
const path = require('path');

// ── Leer .env ──────────────────────────────────────
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ No se encontró .env — creá el archivo primero.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};

envContent.split('\n').forEach(line => {
  line = line.trim();
  if (!line || line.startsWith('#')) return;
  const [key, ...rest] = line.split('=');
  if (key && rest.length) env[key.trim()] = rest.join('=').trim();
});

// ── Construir VALID_KEYS ───────────────────────────
const validKeys = {};

Object.entries(env).forEach(([key, value]) => {
  if (!value) return;
  if (key.startsWith('BASIC_KEY_') || key === 'DEV_BASIC_KEY') {
    validKeys[value] = 'basic';
  } else if (key.startsWith('PREMIUM_KEY_') || key === 'DEV_PREMIUM_KEY') {
    validKeys[value] = 'premium';
  }
});

const keyCount = Object.keys(validKeys).length;
if (keyCount === 0) {
  console.error('❌ No se encontraron claves en .env. Verificá el formato.');
  process.exit(1);
}

// ── Generar config.js ─────────────────────────────
const configContent = `/**
 * GYM OS v2.1 — Configuración generada automáticamente
 * Archivo: config.js
 *
 * ⚠ NO editar manualmente — usar generate-config.js
 * ⚠ NO subir a Git/GitHub — agregar a .gitignore
 *
 * Generado: ${new Date().toLocaleString('es-AR')}
 * Total claves: ${keyCount} (${Object.values(validKeys).filter(v=>v==='basic').length} básicas, ${Object.values(validKeys).filter(v=>v==='premium').length} premium)
 */

const GYMOS_CONFIG = {
  appName:    '${env.APP_NAME    || 'GYM OS'}',
  appVersion: '${env.APP_VERSION || '2.1'}',
  env:        '${env.APP_ENV     || 'production'}',

  VALID_KEYS: ${JSON.stringify(validKeys, null, 4)}
};
`;

const configPath = path.join(__dirname, 'config.js');
fs.writeFileSync(configPath, configContent, 'utf8');

console.log(`✅ config.js generado con ${keyCount} clave(s):`);
Object.entries(validKeys).forEach(([k, v]) => {
  console.log(`   ${v === 'premium' ? '★' : '✓'} [${v.toUpperCase().padEnd(7)}] ${k}`);
});
console.log('\n→ Abrí index.html con Live Server para probar.');
