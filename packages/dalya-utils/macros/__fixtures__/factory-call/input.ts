import DalyaError from 'dalya-utils/macros/DalyaError.macro';

// `throw Error(message)` is valid JS but we limit error construction to a single syntax.
throw DalyaError('my message');
