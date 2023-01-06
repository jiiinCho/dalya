import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import renameNodeModules from 'rollup-plugin-rename-node-modules';

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
};

export default [
  {
    input: './src/index.ts',
    onwarn,
    output: {
      dir: 'base',
      format: 'cjs',
      preserveModules: true,
      preserveModulesRoot: 'src',
      globals,
    },
    external: Object.keys(globals),
    plugins: [
      peerDepsExternal(),
      resolve(),
      babel({
        exclude: /node_modules/,
        babelHelpers: 'bundled',
        extensions: ['.js', '.ts', '.tsx'],
      }),
      commonjs({
        ignoreGlobal: true,
        include: /node_modules/,
      }),
      typescript({
        tsconfig: './tsconfig.build.json',
        declaration: true,
        declarationDir: 'base',
      }),
      terser(),
      renameNodeModules('external'),
    ],
  },
];
