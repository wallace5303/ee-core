import {defineConfig} from 'vite'
import {resolve} from 'path';
import dts from 'vite-plugin-dts'

export default defineConfig({
  define: {'process.env': {}},
  build: {
    minify: "esbuild",
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      name: 'eebin',
      // fileName: (format) => `index.${format}.js`,
      fileName: `index`,
      formats: ['es', 'cjs']
    },
  },
  plugins: [
    dts({
      //tsconfigPath: resolve(__dirname, './tsconfig.json'),
      //rollupTypes: true
    }),
  ],
})
