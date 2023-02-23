import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import DalyaStackError from './DalyaErrorStack';

/*
  IMPORTANT
  - All error should be tested in .test.(js|ts|tsx) file
  - For dynamic error messages, use printf-style formatting with %s formatter representation
  - Run error:write before publish any packages, because updating DalyaErrorCodes.json is relying on it (TODO: find better solution)
*/

interface DalyaErrorInterface {
  message: string;
  evaluateMessage: () => string;
  writeErrorCodes: () => string;
  throwError: () => void;
}

function invertObject<T extends Record<string, unknown>>(object: T) {
  const inverted = {} as {
    [K in keyof T]: keyof T;
  };
  Object.keys(object).forEach((key) => {
    inverted[object[key] as keyof T] = key;
  });

  return inverted;
}

class DalyaError implements DalyaErrorInterface {
  public message: string;

  private errorCodesRaw: string[];

  private errorCodesPath: string;

  private errorCodes: any;

  private errorCodesLookup: any;

  constructor(...args: string[]) {
    this.errorCodesRaw = args;
    this.message = this.evaluateMessage();
    this.errorCodesPath = resolve(__dirname, './DalyaErrorCodes.json');
    this.errorCodes = JSON.parse(readFileSync(this.errorCodesPath, { encoding: 'utf8' }));
    this.errorCodesLookup = invertObject(this.errorCodes);

    this.throwError();
  }

  evaluateMessage() {
    const errorCodesRaw = this.errorCodesRaw;
    if (errorCodesRaw.length > 1) {
      const splitted = errorCodesRaw[0].split('%s');

      const converted = splitted.reduce((result, expression, currentIndex) => {
        if (!errorCodesRaw[currentIndex + 1]) {
          return result.concat(expression);
        }

        const combined = expression.concat(errorCodesRaw[currentIndex + 1]);
        return result.concat(combined);
      }, '');

      return converted;
    }

    return errorCodesRaw.join();
  }

  writeErrorCodes() {
    const newErrorMessage = this.errorCodesRaw[0];

    if (!newErrorMessage.startsWith('Dalya: ')) {
      throw new Error('Invalid error code format. Must start with `Dalya: `');
    }

    // error codes are 1-based: the first error code is assigned the value of 1, rather than 0.
    const newErrorCode = String(Object.keys(this.errorCodes).length + 1);
    const updatedErrorCodes = this.errorCodes;

    updatedErrorCodes[newErrorCode] = newErrorMessage;
    writeFileSync(this.errorCodesPath, JSON.stringify(updatedErrorCodes, null, 2));

    return newErrorMessage;
  }

  throwError() {
    let errorMessage = this.message;

    const foundErrorCode = this.errorCodesLookup[this.errorCodesRaw[0]];
    if (!foundErrorCode) {
      if (process.env.DALYA_EXTRACT_ERROR_CODES !== 'true') {
        console.log('throw error?');
        throw new Error(
          `${this.errorCodesRaw[0]} is not found on DalyaErrorCodes.json.\nDid you forget to run 'yarn error:write?`,
        );
      } else {
        errorMessage = this.writeErrorCodes();
        console.info(`${errorMessage} inserted!`);
      }
    }

    throw new DalyaStackError(errorMessage);
  }
}

export default DalyaError;
