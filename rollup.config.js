import css from 'rollup-plugin-css-only';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/sector-tagger.js',
    format: 'umd',
    name: 'SectorTagger',
  },
  plugins: [
    css({ output: 'styles.css' }),
    terser(),
  ],
};
