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

    if (process.env.DALYA_EXTRACT_ERROR_CODES === 'true') {
      this.writeErrorCodes();
    } else {
      this.throwError();
    }
  }

  writeErrorCodes(this: any) {
    console.log('writeErrorCodes called, this.message:', this.message);
    if (!this.message.startsWith('Dalya: ')) {
      throw new Error('Invalid error code format. Must start with `Dalya: `');
    }

    const updatedErrorCodes = this.errorCodes;
    const newErrorCode = String(Object.keys(this.errorCodes).length + 1);
    updatedErrorCodes[newErrorCode] = this.message;
    writeFileSync(this.errorCodesPath, JSON.stringify(updatedErrorCodes, null, 2));
  }

  throwError() {
    console.log('throwError called, this.message:', this.message);
    const foundErrorCode = this.errorCodesLookup[this.message];
    const errorMessage = foundErrorCode
      ? this.message
      : `Missing error code for message '${this.message}'. Did you forget to run \`yarn extract-errors\` first?`;

    throw new DalyaStackError(errorMessage);
  }
}

// const Foo = (function () {
//   function DalyaError(this: any, message: string) {
//     this.message = message;

//     this.errorCodesPath = resolve(__dirname, './DalyaErrorCodes.json');
//     this.errorCodes = JSON.parse(readFileSync(this.errorCodesPath, { encoding: 'utf8' })); // {"1": "DalyaError: Error"}
//     this.errorCodesLookup = invertObject(this.errorCodes); // {"DalyaError: Error": "1"}

//     if (process.env.DALYA_EXTRACT_ERROR_CODES === 'true') {
//       this.writeErrorCodes();
//     } else {
//       this.throwError();
//     }
//   }

//   // re-write all error codes TODO: add remove file with process.env.DALYA_EXTRACT_ERROR_CODES  command
//   DalyaError.prototype.writeErrorCodes = function writeErrorCodes(this: any) {
//     console.log('writeErrorCodes called, this.message:', this.message);
//     if (!this.message.startsWith('Dalya: ')) {
//       throw new Error('Invalid error code format. Must start with `Dalya: `');
//     }

//     const updatedErrorCodes = this.errorCodes;
//     const newErrorCode = String(Object.keys(this.errorCodes).length + 1);
//     updatedErrorCodes[newErrorCode] = this.message;
//     writeFileSync(this.errorCodesPath, JSON.stringify(updatedErrorCodes, null, 2));
//   };

//   DalyaError.prototype.throwError = function throwError() {
//     console.log('throwError called, this.message:', this.message);

//     const foundErrorCode = this.errorCodesLookup[this.message];
//     const errorMessage = foundErrorCode
//       ? this.message
//       : `Missing error code for message '${this.message}'. Did you forget to run \`yarn extract-errors\` first?`;

//     throw new DalyaStackError(errorMessage);
//   };
// })();

// DalyaError
//   // case 2. get error and throw

//       if (!this.message.startsWith('Dalya: ')) {
//         throw new Error('Invalid error code format. Must start with `Dalya: `');
//       }

//       const foundErrorCode = this.errorCodesLookup[this.message];
//       if (foundErrorCode) {
//         throw new Error(
//           `Duplicated error message.\nCheck DalyaErrorCodes.json, error code: ${String(
//             foundErrorCode,
//           )}`,
//         );
//       }

//       let updatedDalyaErrorCodes = this.errorCodes;
//       if (!this.errorCodeToUpdate) {
//         // write new error code
//         // error codes are 1-based: the first error code is assigned the value of 1, rather than 0.
//         const newErrorCode = String(Object.keys(this.errorCodesLookup).length + 1);
//         this.errorCodesLookup[this.message] = newErrorCode;
//         updatedDalyaErrorCodes = invertObject(this.errorCodesLookup);
//       } else {
//         // update existing DalyaErrorCodes.json
//         updatedDalyaErrorCodes[this.errorCodeToUpdate] = this.message;
//       }

//       writeFileSync(this.errorCodesPath, JSON.stringify(updatedDalyaErrorCodes, null, 2));

//       return this.message;

// }

// DalyaError.prototype.getValue = function () {
//   return this.value;
// }

// class DalyaError {
//   public message: string;

//   public errorCodeToUpdate: string | undefined;

//   public errorCodesPath: string;

//   constructor(message: string, errorCodeToUpdate?: string) {
//     this.message = message;
//     this.errorCodeToUpdate = errorCodeToUpdate;
//     this.errorCodesPath = resolve(__dirname, './DalyaErrorCodes.json');
//     this.errorMessageOperator();
//   }

//   get errorCodes() {
//     // errorCodes =
//     return JSON.parse(readFileSync(this.errorCodesPath, { encoding: 'utf8' }));
//   }

//   get errorCodesLookup() {
//     return invertObject(this.errorCodes); // errorCodesLookup =
//   }

//   errorCodeGenerator = () => {
//     if (!this.message.startsWith('Dalya: ')) {
//       throw new Error('Invalid error code format. Must start with `Dalya: `');
//     }

//     const foundErrorCode = this.errorCodesLookup[this.message];
//     if (foundErrorCode) {
//       throw new Error(
//         `Duplicated error message.\nCheck DalyaErrorCodes.json, error code: ${String(
//           foundErrorCode,
//         )}`,
//       );
//     }

//     let updatedDalyaErrorCodes = this.errorCodes;
//     if (!this.errorCodeToUpdate) {
//       // write new error code
//       // error codes are 1-based: the first error code is assigned the value of 1, rather than 0.
//       const newErrorCode = String(Object.keys(this.errorCodesLookup).length + 1);
//       this.errorCodesLookup[this.message] = newErrorCode;
//       updatedDalyaErrorCodes = invertObject(this.errorCodesLookup);
//     } else {
//       // update existing DalyaErrorCodes.json
//       updatedDalyaErrorCodes[this.errorCodeToUpdate] = this.message;
//     }

//     writeFileSync(this.errorCodesPath, JSON.stringify(updatedDalyaErrorCodes, null, 2));

//     return this.message;
//   };

//   errorCodeValidator = () => {
//     console.log('errorCodeValidator', this.message);
//     let errorMessage = this.message;
//     const foundErrorCode = this.errorCodesLookup[this.message];
//     console.log('foundErrorCode', foundErrorCode);
//     if (!foundErrorCode) {
//       errorMessage = `Missing error code for message '${this.message}'. Did you forget to run \`yarn extract-errors\` first?`;
//     }

//     throw new Error(errorMessage);
//   };

//   errorMessageOperator = () => {
//     const mode = process.env.DALYA_EXTRACT_ERROR_CODES === 'true' ? 'write' : 'throw';

//     switch (mode) {
//       case 'write':
//         return this.errorCodeGenerator();
//       case 'throw':
//         return this.errorCodeValidator();
//       default:
//         throw new Error('Unknown mode');
//     }
//   };
// }

// class DalyaError extends DalyaErrorConstructor {
//   constructor(message: string) {
//     super(message);
//     super.errorCodesGenerator();
//   }
// }

export default DalyaError;
