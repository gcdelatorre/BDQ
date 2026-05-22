import { toast as sonnerToast } from "sonner";

/**
 * A custom hook to handle system-wide notifications
 * Following the Best Practice of abstracting third-party libraries
 */
export const useToast = () => {
  const toast = {
    success: (title, description = "") => {
      sonnerToast.success(title, { description });
    },
    error: (title, description = "") => {
      sonnerToast.error(title, { description });
    },
    info: (title, description = "") => {
      sonnerToast.info(title, { description });
    },
    warning: (title, description = "") => {
      sonnerToast.warning(title, { description });
    },
    loading: (title) => {
      return sonnerToast.loading(title);
    }
  };

  return { toast };
};
