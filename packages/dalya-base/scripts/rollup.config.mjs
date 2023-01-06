import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

function onwarn(warning) {
  if (warning.code === 'UNUSED_EXTERNAL_IMPORT' && warning.source === 'react') {
    // only warn for import * as React from 'react'
    console.warn(warning.message);
  } else {
    throw Error(warning.message);
  }
}

const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
  '@emotion/react': 'emotionReact',
  '@emotion/styled': 'emotionStyled',
};

export default [
  {
    input: './src/index.ts',
    onwarn,
    output: {
      file: 'build/dalya.production.min.js',
      format: 'umd',
      name: 'dalya',
      globals,
    },
    external: Object.keys(globals),
    plugins: [
      peerDepsExternal(),
      resolve({
        extensions: ['.js', '.tsx', '.ts'],
      }),
      commonjs(),
      typescript({ tsconfig: './tsconfig.build.json' }),
      terser(),
    ],
  },
];
