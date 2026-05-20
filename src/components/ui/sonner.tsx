"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-[#0b1220] group-[.toaster]:border group-[.toaster]:border-[rgba(11,18,32,0.08)] group-[.toaster]:shadow-sm group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-[rgba(11,18,32,0.55)] group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-[#f5f7fa] group-[.toast]:text-[#0b1220] group-[.toast]:border group-[.toast]:border-[rgba(11,18,32,0.08)] group-[.toast]:rounded-lg",
          cancelButton:
            "group-[.toast]:bg-transparent group-[.toast]:text-[rgba(11,18,32,0.45)] group-[.toast]:hover:text-[#0b1220]",
          success:
            "group-[.toast]:border-l-4 group-[.toast]:border-l-[#10b981]",
          error:
            "group-[.toast]:border-l-4 group-[.toast]:border-l-[#e24329]",
          info:
            "group-[.toast]:border-l-4 group-[.toast]:border-l-[#3bb2f6]",
          warning:
            "group-[.toast]:border-l-4 group-[.toast]:border-l-[#f59e0b]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
