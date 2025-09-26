export class CustomHLTVClient {
  private baseUrl: string
  private rateLimitDelay = 1000 // 1 second between requests

  constructor() {
    this.baseUrl = "/api/hltv"
  }

  async getLiveMatches() {
    await this.rateLimitWait()

    try {
      const response = await fetch(`${this.baseUrl}/matches?type=live`, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to fetch live matches:", error)
      throw error
    }
  }

  async getTodayMatches() {
    await this.rateLimitWait()

    try {
      const response = await fetch(`${this.baseUrl}/matches?type=today`, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to fetch today matches:", error)
      throw error
    }
  }

  async getMatchStats(matchId: number) {
    await this.rateLimitWait()

    try {
      const response = await fetch(`${this.baseUrl}/matches?type=stats&id=${matchId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Failed to fetch stats for match ${matchId}:`, error)
      throw error
    }
  }

  async refreshData() {
    await this.rateLimitWait()

    try {
      const response = await fetch(`${this.baseUrl}/matches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "refresh" }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to refresh data:", error)
      throw error
    }
  }

  private async rateLimitWait() {
    return new Promise((resolve) => setTimeout(resolve, this.rateLimitDelay))
  }

  generateUserApiKey(userId: string): string {
    const timestamp = Date.now()
    const hash = btoa(`${userId}-${timestamp}-fantasy-cs2`).replace(/[^a-zA-Z0-9]/g, "")
    return `fcs2_${hash.substring(0, 32)}`
  }
}

export const customHLTVClient = new CustomHLTVClient()
