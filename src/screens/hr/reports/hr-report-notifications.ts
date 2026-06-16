import type { ReactNode } from 'react';
import type { ExternalToast } from 'sonner';

import { toast } from 'sonner';

const hrReportToastOptions: ExternalToast = {
  position: 'top-right',
  duration: 3000,
};

const withHrReportToastOptions = (options?: ExternalToast): ExternalToast => ({
  ...hrReportToastOptions,
  ...options,
});

export const hrReportToast = {
  success: (message: ReactNode, options?: ExternalToast) =>
    toast.success(message, withHrReportToastOptions(options)),
  error: (message: ReactNode, options?: ExternalToast) =>
    toast.error(message, withHrReportToastOptions(options)),
  warning: (message: ReactNode, options?: ExternalToast) =>
    toast.warning(message, withHrReportToastOptions(options)),
};
