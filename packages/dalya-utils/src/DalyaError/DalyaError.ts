import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import DalyaStackError from './DalyaErrorStack';

interface DalyaErrorInterface {
  message: string;
  writeErrorCodes: () => void;
  throwError: () => void;
}

function invertObject<T extends Record<string, unknown>>(object: T) {
  const inverted = {} as {
    [K in keyof T]: keyof T;
  };
  Object.keys(object).forEach((key) => {
    inverted[object[key] as keyof T] = key;
  });

  return inverted; // { "Dalya: Error": "1" }
}

class DalyaError implements DalyaErrorInterface {
  public message: string;

  private errorCodesPath: string;

  private errorCodes: any;

  private errorCodesLookup: any;

  constructor(message: string) {
    this.message = message;
    this.errorCodesPath = resolve(__dirname, './DalyaErrorCodes.json');
    this.errorCodes = JSON.parse(readFileSync(this.errorCodesPath, { encoding: 'utf8' })); // {"1": "DalyaError: Error"}
    this.errorCodesLookup = invertObject(this.errorCodes); // {"DalyaError: Error": "1"}

    this.throwError();
  }

  writeErrorCodes() {
    console.log('writeErrorCodes called, this.message:', this.message);
    if (!this.message.startsWith('Dalya: ')) {
      throw new Error('Invalid error code format. Must start with `Dalya: `');
    }

    const updatedErrorCodes = this.errorCodes;
    // error codes are 1-based: the first error code is assigned the value of 1, rather than 0.
    const newErrorCode = String(Object.keys(this.errorCodes).length + 1);
    updatedErrorCodes[newErrorCode] = this.message;
    writeFileSync(this.errorCodesPath, JSON.stringify(updatedErrorCodes, null, 2));
  }

  throwError() {
    console.log('throwError called, this.message:', this.message);
    const foundErrorCode = this.errorCodesLookup[this.message];

    if (!foundErrorCode) {
      this.writeErrorCodes();
    }
    throw new DalyaStackError(this.message);
  }
}

export default DalyaError;
