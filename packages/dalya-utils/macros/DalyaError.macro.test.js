import pluginTester from 'babel-plugin-tester';
import plugin from 'babel-plugin-macros';
import { join, resolve } from 'path';
import { copyFileSync, readFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';

// tmpdir() returns temporary location /var/folders/T/error-codes.json of the operating system
const temporaryErrorCodesPaths = join(tmpdir(), 'error-codes.json');
const fixturePath = resolve(__dirname, './__fixtures__');

function readOutputFixtureSync(fixture, file) {
  // babel hardcodes the linefeed to \n
  return readFileSync(join(fixturePath, fixture, file), { encoding: 'utf8' }).replace(
    /\r?\n/g,
    '\n',
  );
}

pluginTester({
  plugin,
  filename: __filename,
  tests: [
    {
      title: 'literal',
      pluginOptions: {
        dalyaError: {
          errorCodesPath: join(fixturePath, 'literal', 'error-codes.json'),
        },
      },
      fixture: join(fixturePath, 'literal', 'input.js'),
      output: readOutputFixtureSync('literal', 'output.js'),
    },
    {
      title: 'annotates missing error codes',
      pluginOptions: {
        dalyaError: {
          errorCodesPath: join(fixturePath, 'no-error-code-annotation', 'error-codes.json'),
        },
      },
      fixture: join(fixturePath, 'no-error-code-annotation', 'input.ts'),
      output: readOutputFixtureSync('no-error-code-annotation', 'output.ts'),
    },
    {
      title: 'can throw on missing error codes',
      error:
        /: Missing error code for message 'missing'. Did you forget to run `yarn extract-errors` first ?/,
      fixture: join(fixturePath, 'no-error-code-throw', 'input.ts'),
      pluginOptions: {
        dalyaError: {
          errorCodesPath: join(fixturePath, 'no-error-code-throw', 'error-codes.json'),
          missingError: 'throw',
        },
      },
    },
    {
      title: 'can extract errors',
      fixture: join(fixturePath, 'error-code-extraction', 'input.ts'),
      pluginOptions: {
        dalyaError: {
          errorCodesPath: temporaryErrorCodesPaths,
          missingError: 'write',
        },
      },
      output: readOutputFixtureSync('error-code-extraction', 'output.js'),
      setup() {
        copyFileSync(
          join(fixturePath, 'error-code-extraction', 'error-codes.before.json'),
          temporaryErrorCodesPaths,
        );

        return function teardown() {
          try {
            const actualErrorCdoes = JSON.parse(
              readFileSync(temporaryErrorCodesPaths, { encoding: 'utf8' }),
            );
            const expectedErrorCodes = JSON.parse(
              readFileSync(join(fixturePath, 'error-code-extraction', 'error-codes.after.json')),
            );
            expect(actualErrorCdoes).toStrictEqual(expectedErrorCodes);
          } finally {
            unlinkSync(temporaryErrorCodesPaths);
          }
        };
      },
    },
    {
      title: 'throws if not called as a constructor',
      error:
        /: Encountered `DalyaError` outside of a "new expression" i\.e\. `new DalyaError\(\)`\. Use `throw new DalyaError\(message\)` over `throw DalyaError\(message\)`\./,
      fixture: join(fixturePath, 'factory-call', 'input.ts'),
      pluginOptions: {
        dalyaError: {
          errorCodesPath: join(fixturePath, 'factory-call', 'error-codes.json'),
        },
      },
    },
    {
      title: 'relative-import',
      fixture: join(fixturePath, 'relative-import', 'input.ts'),
      pluginOptions: {
        dalyaError: {
          errorCodesPath: join(fixturePath, 'relative-import', 'error-codes.json'),
        },
      },
      output: readOutputFixtureSync('relative-import', 'output.js'),
    },
  ],
});

/**
 * tests: [
 * {
 *    title: 'literal',
 *    description: When consumer use DalyaError instance from this module and the error message exists in error-codes.json, it will throw new Error in production environment (runtime environment). In development environment, it will exeute formatErrormessage function
 * }
 * ]
 */
