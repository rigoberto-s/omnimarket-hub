"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, Loader2Icon, TriangleAlertIcon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      // La app no tiene modo oscuro: con "system" la descripción salía casi blanca sobre fondo blanco
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-5 text-green-800" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5" />,
        error: <CircleAlertIcon className="size-5 text-red-700" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "#18181b",
          "--normal-border": "#e4e4e7",
          "--border-radius": "12px",
          "--width": "380px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          // "!" porque las reglas de sonner usan selectores de atributos más específicos
          toast: "gap-3! px-4! py-3.5! shadow-[0_10px_30px_rgba(0,0,0,0.12)]!",
          icon: "m-0! size-5!",
          title: "text-sm! font-semibold! text-zinc-900!",
          description: "text-[13px]! leading-[1.4]! text-zinc-600!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
