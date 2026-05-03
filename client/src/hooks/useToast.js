import { toast as sonnerToast } from "sonner";

/**
 * A custom hook to handle system-wide notifications
 * Following the Best Practice of abstracting third-party libraries
 */
export const useToast = () => {
  const toast = {
    success: (message, description = "") => {
      sonnerToast.success(message, {
        description,
        className: "rounded-2xl border-slate-100 shadow-xl font-sans",
      });
    },
    error: (message, description = "") => {
      sonnerToast.error(message, {
        description,
        className: "rounded-2xl border-red-50 shadow-xl font-sans",
      });
    },
    info: (message, description = "") => {
      sonnerToast.info(message, {
        description,
        className: "rounded-2xl border-blue-50 shadow-xl font-sans",
      });
    },
    warning: (message, description = "") => {
      sonnerToast.warning(message, {
        description,
        className: "rounded-2xl border-amber-50 shadow-xl font-sans",
      });
    },
    loading: (message) => {
      return sonnerToast.loading(message, {
        className: "rounded-2xl border-slate-100 shadow-xl font-sans",
      });
    }
  };

  return { toast };
};
