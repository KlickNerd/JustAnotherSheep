// Kopiert die statische Website aus ./site nach ./dist.
// Kein Bundler: die Seite ist fertiges HTML mit Bildern, Schriften und Audio.
import { cpSync, rmSync, existsSync } from 'node:fs';

if (!existsSync('site/index.html')) {
  console.error('site/index.html fehlt');
  process.exit(1);
}
rmSync('dist', { recursive: true, force: true });
cpSync('site', 'dist', { recursive: true });
console.log('site -> dist kopiert');
