import { formatDalyaErrorMessage as _formatDalyaErrorMessage } from 'dalya-utils';
throw new Error(
  process.env.NODE_ENV !== 'production'
    ? `Dalya: Expected valid input target.
Did you use \`inputComponent\``
    : _formatDalyaErrorMessage(1),
);
