import { createMacro, MacroError, MacroParams } from 'babel-plugin-macros';
import { readFileSync, writeFileSync } from 'fs';
import { normalize } from 'path';

import { NodePath, types } from '@babel/core';
import { Expression } from '@babel/types';
import { addNamed, addDefault } from '@babel/helper-module-imports';

// MacroError object stores information about a run-time error that occurs in a macro.
// When a MacroError is thrown, it includes
// - information about the location where the error occurred
// - providing context about the specific macro that caused the error.
// This makes it easier for developers to identify and fix the problem, as opposed to a generic error message that does not provide any additional information about the cause of the error.

function invertObject<T extends Record<string, string>>(object: T) {
  const inverted = {} as {
    [K in keyof T]: keyof T;
  };
  Object.keys(object).forEach((key) => {
    inverted[object[key] as keyof T] = key;
  });

  return inverted;
}

interface MissingErrorCodeHandler {
  ({
    devMessage,
    errorMessageLiteral,
    newExpressionPath,
  }: {
    devMessage?: types.TemplateLiteral;
    errorMessageLiteral?: string;
    newExpressionPath?: NodePath<types.Node> | null;
  }): string | void;
}

/**
 * Supported imports:
 * 1. Bare specifier e.g. `dalya-utils/macros/DalyaError.macro'`
 * 2. Relate import from `packages/dalya-utils/src` e.g `'../macros/DalyaError.macro'`
 */

function dalyaError(params: MacroParams) {
  const { references, babel, config } = params;
  let errorCodesLookup = {} as any;
  let handleMissingErrorCode: MissingErrorCodeHandler | undefined;
  let updatedErrorCodes = false;

  // errorCodesPaths and missingError defined in ../../babel.config.js
  const {
    errorCodesPath: babelPluginMacrosErrorCodesPath,
    missingError: babelPluginMacrosMissingError,
  } = config as any;
  const errorCodesPath = babelPluginMacrosErrorCodesPath || '';
  const missingError = babelPluginMacrosMissingError || 'annotate';
  const errorCodes = JSON.parse(readFileSync(errorCodesPath, { encoding: 'utf8' }));
  errorCodesLookup = invertObject(errorCodes);

  // annotating : adding information to existing code
  // writing : creating new code
  // switch function is to assign handleMissingErrorCode function based on missingError variable
  switch (missingError) {
    case 'annotate':
      handleMissingErrorCode = ({ devMessage, newExpressionPath }) => {
        if (newExpressionPath != null && devMessage != null) {
          // Outputs:
          // /* FIXME (minify-erros-in-prod): Unminified error message in production build! */
          // thrwo new Error(`A message with ${interpolation}`)
          newExpressionPath.replaceWith(
            babel.types.newExpression(babel.types.identifier('Error'), [devMessage]),
          );
          newExpressionPath.addComment(
            'leading',
            ' FIXME (minify-erros-in-prod): Unminified error message in production build! ',
          );
        }
      };
      break;
    case 'throw':
      handleMissingErrorCode = ({ errorMessageLiteral }) => {
        throw new MacroError(
          `Missing error code for message '${errorMessageLiteral}'. Did you forget to run \`yarn extract-errors\` first?`,
        );
      };
      break;
    case 'write':
      handleMissingErrorCode = ({ errorMessageLiteral }) => {
        // this will insert new error codes in error-codes.json
        updatedErrorCodes = true;
        // error codes are 1-based : the first error code is assigned the value of 1, rather than 0. This is a common convention in programming
        const newErrorCode = String(Object.keys(errorCodesLookup).length + 1);
        // ! non-nullable is feasible because evaluateMessage already validated `errorMessageLiteral` variable
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        errorCodesLookup[errorMessageLiteral!] = newErrorCode;
        return newErrorCode;
      };
      break;
    default:
      throw new MacroError(
        `Unknown missing error behavior '${missingError}'. Can only handle 'annotate', 'throw' and 'write'.`,
      );
  }

  /**
   * Evaluates a babel node as a string
   *
   * Supported nodes
   * - `'just a literal'`
   * - `'a literal' + 'concateneded' + 'with +'`
   * Cannot evaluate template literals or Array.prototype.join etc
   */

  function evaluateMessage(node: types.Node): string {
    if (babel.types.isBinaryExpression(node)) {
      if (node.operator !== '+') {
        throw new Error(`Unsupported binary operator '${node.operator}'. Can only evaluate '+'.`);
      }
      return `${evaluateMessage(node.left)}${evaluateMessage(node.right)}`;
    }

    if (babel.types.isStringLiteral(node)) {
      return node.value;
    }
    throw new Error('Can only evaluate strings that are concatenated with `+` or string literals.');
  }

  /**
   * The identifier for the callee in `formatMuiErrorMessage()`
   * Creating an identifier per DalyaError reference would create duplicate imports
   * It's not obvious that these will be duplicated by bundlers
   * We can already do this at transpile-time
   */

  let formatDalyaErrorMessageIdentifier: types.Identifier | null = null;

  references.default.forEach((babelPath) => {
    const newExpressionPath = babelPath.parentPath;
    if (!newExpressionPath?.isNewExpression()) {
      throw new MacroError(
        'Encountered `DalyaError` outside of a "new expression" i.e. `new DalyaError()`. Use `throw new DalyaError(message)` over `throw DalyaError(message)`.',
      );
    }

    const errorMessageLiteral = evaluateMessage(newExpressionPath.node.arguments[0]);

    // const errorMessageLiteral  = 'Error: The `value` of %s is invalid.'
    // const foo = errorMessageLiteral.split('%s').map((literal) => literal.replace(/`/g, '\\`'))
    // foo => ['Error: The \\`value\\` of ', ' is invalid.']

    const errorMessageExpressions = newExpressionPath.node.arguments.slice(1) as Array<Expression>;
    // quasi-literals refers to a feature of template literals that is a type of string that use backticks (``) instead of quotes ('' or "") and can include expressions inside them. These expressions are evaluated at runtime and the results are injected into the string. By converting the backtick characters to backslash-escaped backtick characters, the string can be safely used within a template literal without causing a syntax error. This conversion is necessary when the string is going to be used in some other places where backtick characters need to be escaped, such as in regular expressions, command line interpreters or in JSON strings
    const errorMessageQuasis = errorMessageLiteral
      .split('%s')
      .map((cooked: any) =>
        babel.types.templateElement({ raw: cooked.replace(/`/g, '\\`'), cooked }),
      );
    // errorMessageQuasis creates a new babel.types.templateElement object that has two properties: raw and cooked. The raw property is set to the cooked string with all backtick characters replaced with '\\`' and the cooked property is set to the original cooked string.
    // Providing `cooked` here is important. Otherwise babel will generate "" with NODE_ENV=test. Original code used `cooked: String.raw({raw: cooked})` Thought it's unclear what for. 'One line\nNext line' will end up as `One line
    // Next line` which is what you'd want from that literal.

    // Outputs:
    // `A ${adj} message that contains ${noun}`;
    const devMessage = babel.types.templateLiteral(errorMessageQuasis, errorMessageExpressions);

    let errorCode = errorCodesLookup[errorMessageLiteral];
    if (errorCode == null && handleMissingErrorCode) {
      errorCode = handleMissingErrorCode({
        devMessage,
        errorMessageLiteral,
        newExpressionPath,
      });
      if (errorCode === undefined) {
        return;
      }
    }

    if (formatDalyaErrorMessageIdentifier === null) {
      const isBareImportSourceIdentifier = (params as any).source.startsWith('dalya-utils');
      if (isBareImportSourceIdentifier) {
        // Input: import DalyaError from 'dalya-utils/macros/DalyaError.macro'
        // Output: import { formatDalyaErrorMessage } from 'dalya-utils'
        formatDalyaErrorMessageIdentifier = addNamed(
          babelPath,
          'formatDalyaErrorMessage',
          'dalya-utils',
        );
      } else {
        const normalizedRelativeImport = normalize(
          (params as any).source.replace('../macros/DalyaError.macro', './formatDalyaErrorMessage'),
        ).replace(/\\/g, '/');

        // 'formatDalyaErrorMesage' implies './formatDalyaErrorMessage' for fs paths but not for import specifiers
        const formatDalyaErrorMessageImportSource = normalizedRelativeImport.startsWith('.')
          ? normalizedRelativeImport
          : `./${normalizedRelativeImport}`;
        // Input: import DalyaError from 'dalya-utils/macros/DalyaError.macro'
        // Output: import formatDalyaErrorMessage from 'dalya-utils'

        // If 'hintedName' exists in scope, the name will be '_hintedName2', '_hintedName3', ...
        formatDalyaErrorMessageIdentifier = addDefault(
          babelPath,
          formatDalyaErrorMessageImportSource,
          {
            nameHint: 'formatDalyaErrorMessage',
          },
        );
      }
    }

    // Outputs:
    // formatDalyaErrorMessage(ERROR_CODE, adj, noun)
    const prodMessage = babel.types.callExpression(
      babel.types.cloneNode(formatDalyaErrorMessageIdentifier),
      [babel.types.numericLiteral(parseInt(errorCode, 10)), ...errorMessageExpressions],
    );
    // Outputs:
    // new Error(process.env.NODE_ENV !== 'production' ? `A message with ${interpolation}` : formatProdError('A message with %s', interpolation))
    newExpressionPath.replaceWith(
      babel.types.newExpression(babel.types.identifier('Error'), [
        babel.types.conditionalExpression(
          babel.types.binaryExpression(
            '!==',
            babel.types.memberExpression(
              babel.types.memberExpression(
                babel.types.identifier('process'),
                babel.types.identifier('env'),
              ),
              babel.types.identifier('NODE_ENV'),
            ),
            babel.types.stringLiteral('production'),
          ),
          devMessage,
          prodMessage,
        ),
      ]),
    );
  });

  if (missingError === 'write' && updatedErrorCodes) {
    writeFileSync(errorCodesPath, JSON.stringify(invertObject(errorCodesLookup), null, 2));
  }

  return { keepImports: false };
}

const DalyaError = createMacro(dalyaError, { configName: 'dalyaError' });
export default DalyaError;

/*
Bundled example
_interopRequireDefault <= from @babel/runtime

"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = capitalize;
var _formatMuiErrorMessage2 = _interopRequireDefault(require("./formatMuiErrorMessage"));
// It should to be noted that this function isn't equivalent to `text-transform: capitalize`.
//
// A strict capitalization should uppercase the first letter of each word in the sentence.
// We only handle the first word.
function capitalize(string) {
  if (typeof string !== 'string') {
    throw new Error(process.env.NODE_ENV !== "production" ? `MUI: \`capitalize(string)\` expects a string argument.` : (0, _formatMuiErrorMessage2.default)(7));
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
}

*/
