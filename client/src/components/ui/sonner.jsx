import { Toaster as Sonner } from "sonner"

const Toaster = ({
  ...props
}) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:!bg-white group-[.toaster]:!border-slate-100 group-[.toaster]:!text-slate-900 group-[.toaster]:!shadow-[0_20px_50px_rgba(0,0,0,0.15)] group-[.toaster]:!rounded-[1.5rem] group-[.toaster]:!p-5 group-[.toaster]:!backdrop-blur-3xl",
          title: "group-[.toast]:!font-black group-[.toast]:!text-[15px] group-[.toast]:!tracking-tight",
          description: "group-[.toast]:!text-inherit !text-[13px] !font-medium !opacity-80",
          success: "group-[.toaster]:!bg-gradient-to-br group-[.toaster]:!from-emerald-400 group-[.toaster]:!to-teal-600 group-[.toaster]:!text-white group-[.toaster]:!border-teal-500/50",
          error: "group-[.toaster]:!bg-gradient-to-br group-[.toaster]:!from-rose-400 group-[.toaster]:!to-rose-600 group-[.toaster]:!text-white group-[.toaster]:!border-rose-500/50",
          info: "group-[.toaster]:!bg-gradient-to-br group-[.toaster]:!from-blue-400 group-[.toaster]:!to-blue-600 group-[.toaster]:!text-white group-[.toaster]:!border-blue-500/50",
          actionButton: "group-[.toast]:!bg-white group-[.toast]:!text-slate-900 group-[.toast]:!rounded-xl group-[.toast]:!px-4 group-[.toast]:!py-2 group-[.toast]:!font-black group-[.toast]:!text-xs group-[.toast]:!shadow-sm",
          cancelButton: "group-[.toast]:!bg-black/10 group-[.toast]:!text-inherit group-[.toast]:!border group-[.toast]:!border-white/20 group-[.toast]:!rounded-xl group-[.toast]:!px-4 group-[.toast]:!py-2 group-[.toast]:!font-bold group-[.toast]:!text-xs",
        },
      }}
      {...props} />
  );
}

export { Toaster }
