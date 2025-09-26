import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get("url")

  if (!imageUrl) {
    return new NextResponse("Missing URL parameter", { status: 400 })
  }

  // Validate that it's an HLTV image URL
  if (!imageUrl.startsWith("https://img-cdn.hltv.org/")) {
    return new NextResponse("Invalid image URL", { status: 400 })
  }

  try {
    console.log("[v0] Proxying image:", imageUrl)

    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Referer: "https://www.hltv.org/",
        Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
      },
    })

    if (!response.ok) {
      console.log("[v0] Failed to fetch image:", response.status, response.statusText)
      return new NextResponse("Failed to fetch image", { status: response.status })
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") || "image/png"

    console.log("[v0] Successfully proxied image, size:", imageBuffer.byteLength)

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("[v0] Error proxying image:", error)
    return new NextResponse("Error fetching image", { status: 500 })
  }
}
