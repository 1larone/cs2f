// Server-side API utilities for secure API key handling

class ServerAPIUtils {
  private customApiKey: string

  constructor() {
    this.customApiKey = process.env.CUSTOM_HLTV_KEY || `fantasy-cs2-server-${Date.now()}`
  }

  async fetchWithApiKey(url: string, options: RequestInit = {}) {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        "X-API-Key": this.customApiKey,
        "User-Agent": "Fantasy-CS2-App/1.0",
      },
    })
  }

  generateSecureApiKey(userId: string): string {
    const timestamp = Date.now()
    const hash = Buffer.from(`${userId}-${timestamp}-fantasy-cs2-secure`)
      .toString("base64")
      .replace(/[^a-zA-Z0-9]/g, "")
    return `fcs2_secure_${hash.substring(0, 32)}`
  }

  validateApiKey(providedKey: string, userId: string): boolean {
    // Simple validation - in production, use proper JWT or session validation
    return providedKey.startsWith("fcs2_") && providedKey.length > 20
  }
}

export const serverAPIUtils = new ServerAPIUtils()
