import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/app.ts', 'src/config.ts', 'src/prisma.ts', 'src/bin/www.ts'],
  bundle: false,
  format: 'esm',
  platform: 'node',
  outdir: 'dist',
  external: ['@prisma/client'],
  splitting: false,
  sourcemap: true,
});