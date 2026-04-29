import * as esbuild from 'esbuild';

const config = {
  entryPoints: ['src/app.ts', 'src/config.ts', 'src/prisma.ts', 'src/bin/www.ts'],
  bundle: false,
  format: 'esm',
  platform: 'node',
  outdir: 'dist',
  external: ['@prisma/client', 'express', 'cookie-parser', 'morgan', 'debug'],
  splitting: false,
  sourcemap: true,
  packages: 'external',
};

await esbuild.build(config);
console.log('Build complete');