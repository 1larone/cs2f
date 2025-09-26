import { clsx, type ClassValue } from "./utils"

export type VariantProps<T> = T extends (...args: any[]) => any ? Parameters<T>[0] : never

export function cva(
  base: ClassValue,
  config?: {
    variants?: Record<string, Record<string, ClassValue>>
    defaultVariants?: Record<string, string>
  },
) {
  return (props?: Record<string, any>) => {
    if (!config?.variants) return clsx(base)

    const variantClasses = Object.entries(config.variants).map(([key, variants]) => {
      const value = props?.[key] ?? config.defaultVariants?.[key]
      return value ? variants[value] : undefined
    })

    return clsx(base, ...variantClasses)
  }
}
