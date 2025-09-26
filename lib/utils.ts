export type ClassValue = string | number | boolean | undefined | null | ClassValue[]

export function clsx(...classes: ClassValue[]): string {
  const result: string[] = []

  for (const cls of classes) {
    if (!cls) continue

    if (typeof cls === "string" || typeof cls === "number") {
      result.push(String(cls))
    } else if (Array.isArray(cls)) {
      const nested = clsx(...cls)
      if (nested) result.push(nested)
    }
  }

  return result.join(" ")
}

export function cn(...inputs: ClassValue[]) {
  return clsx(...inputs)
}
