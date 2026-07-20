import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Only proxy URLs from these Google domains to prevent open-proxy abuse
const ALLOWED_HOSTS = [
  "drive.google.com",
  "drive.usercontent.google.com",
  "lh3.googleusercontent.com",
  "lh4.googleusercontent.com",
  "lh5.googleusercontent.com",
  "lh6.googleusercontent.com",
];

export async function GET(request: NextRequest) {
  try {
    const urlParam = request.nextUrl.searchParams.get("url");
    if (!urlParam) {
      return new NextResponse("Missing 'url' parameter", { status: 400 });
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(urlParam);
    } catch {
      return new NextResponse("Invalid URL", { status: 400 });
    }

    // Security: only allow Google Drive / usercontent URLs
    if (
      !ALLOWED_HOSTS.some(
        (host) => targetUrl.hostname === host || targetUrl.hostname.endsWith("." + host)
      )
    ) {
      return new NextResponse("Forbidden: domain not allowed", { status: 403 });
    }

    // Fetch the image server-side — no Sec-Fetch-* headers from the browser,
    // so Google will serve the image properly.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(urlParam, {
      signal: controller.signal,
      headers: {
        // Use a standard User-Agent so Google doesn't block us
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      // If the download endpoint fails, try Google's thumbnail endpoint as a fallback.
      // The thumbnail returns a 302 redirect that fetch() follows to lh3.googleusercontent.com.
      const fileIdMatch = urlParam.match(/[?&]id=([a-zA-Z0-9_\-.]+)/);
      if (fileIdMatch && urlParam.includes("drive.usercontent.google.com/download")) {
        const fallbackTimeout = setTimeout(() => controller.abort(), 15000);
        const fallbackUrl = `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w2000`;
        const fallbackResponse = await fetch(fallbackUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });
        clearTimeout(fallbackTimeout);

        if (fallbackResponse.ok) {
          const fallbackContentType = fallbackResponse.headers.get("content-type") || "";
          if (fallbackContentType.startsWith("image/")) {
            const fallbackHeaders: Record<string, string> = {
              "Content-Type": fallbackContentType,
              "Cache-Control": "public, max-age=86400, s-maxage=86400",
              "Access-Control-Allow-Origin": "*",
            };
            const fallbackDisposition = fallbackResponse.headers.get("content-disposition");
            if (fallbackDisposition && fallbackDisposition.startsWith("attachment")) {
              fallbackHeaders["Content-Disposition"] = "inline";
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return new NextResponse(fallbackResponse.body as any, { status: 200, headers: fallbackHeaders });
          }
        }
        console.error(`Proxy fallback also failed for ${urlParam}`);
      }

      console.error(`Proxy fetch failed: ${response.status} for ${urlParam}`);
      return new NextResponse(`Upstream fetch failed: ${response.status}`, {
        status: response.status,
      });
    }

    // Get the content type — bail if upstream didn't return an image
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      console.error(`Proxy: upstream returned non-image content-type: ${contentType} for ${urlParam}`);
      return new NextResponse("Upstream did not return an image", { status: 502 });
    }

    // Build response headers for the client
    const headers: Record<string, string> = {
      "Content-Type": contentType,
      // 24h cache on CDN + browser
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    };

    // Strip Content-Disposition if Google set it to "attachment" (would force download)
    const upstreamDisposition = response.headers.get("content-disposition");
    if (upstreamDisposition && upstreamDisposition.startsWith("attachment")) {
      headers["Content-Disposition"] = "inline";
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = response.body;
    return new NextResponse(body, { status: 200, headers });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return new NextResponse("Upstream timed out", { status: 504 });
    }
    console.error("Image proxy error:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
