import { formatDalyaErrorMessage as _formatDalyaErrorMessage } from 'dalya-utils';
throw new Error(process.env.NODE_ENV !== 'production' ? `exists` : _formatDalyaErrorMessage(1));
throw new Error(
  process.env.NODE_ENV !== 'production' ? `will be created` : _formatDalyaErrorMessage(2),
);
