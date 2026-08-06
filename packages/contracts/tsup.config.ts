import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    // Dual output: the Nest API consumes CJS, the Vite app consumes ESM.
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
});
