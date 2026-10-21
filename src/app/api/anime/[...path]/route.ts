import { NextResponse } from "next/server";
import { z } from "zod";
import { getAnimeProvider } from "@/lib/anime";

export const runtime = "nodejs";

// Schema Validasi URL Params & Query
const idSchema = z.coerce.number().int().positive();
const searchSchema = z.object({
  q: z.string().min(1).max(100),
  page: z.coerce.number().int().positive().optional().default(1),
});

function errorResponse(message: string, status = 500): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path } = await params;
  const provider = getAnimeProvider();
  const { searchParams } = new URL(request.url);

  try {
    const route = path.join("/");

    // 1. /api/anime/trending
    if (route === "trending") {
      const data = await provider.getTrending();
      return NextResponse.json({ data }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
    }

    // 2. /api/anime/latest
    if (route === "latest") {
      const data = await provider.getLatest();
      return NextResponse.json({ data }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
    }

    // 3. /api/anime/schedule
    if (route === "schedule") {
      const data = await provider.getSchedule();
      return NextResponse.json({ data }, { headers: { "Cache-Control": "public, s-maxage=7200, stale-while-revalidate=86400" } });
    }

    // 4. /api/anime/search?q=...
    if (route === "search") {
      const parsed = searchSchema.safeParse({
        q: searchParams.get("q"),
        page: searchParams.get("page"),
      });
      
      if (!parsed.success) {
        return errorResponse("Parameter pencarian tidak valid", 400);
      }
      
      const data = await provider.search(parsed.data.q, parsed.data.page);
      return NextResponse.json({ data }, { headers: { "Cache-Control": "public, s-maxage=3600" } });
    }

    // 5. /api/anime/detail/[id]
    if (path[0] === "detail" && path[1]) {
      const idParsed = idSchema.safeParse(path[1]);
      if (!idParsed.success) return errorResponse("ID anime tidak valid", 400);
      
      const data = await provider.getDetail(idParsed.data);
      if (!data) return errorResponse("Anime tidak ditemukan", 404);
      
      return NextResponse.json({ data }, { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } });
    }

    // 6. /api/anime/episodes/[id]
    if (path[0] === "episodes" && path[1]) {
      const idParsed = idSchema.safeParse(path[1]);
      if (!idParsed.success) return errorResponse("ID anime tidak valid", 400);
      
      const data = await provider.getEpisodes(idParsed.data);
      return NextResponse.json({ data }, { headers: { "Cache-Control": "public, s-maxage=86400" } });
    }

    // 7. /api/anime/recommendations/[id]
    if (path[0] === "recommendations" && path[1]) {
      const idParsed = idSchema.safeParse(path[1]);
      if (!idParsed.success) return errorResponse("ID anime tidak valid", 400);
      
      const data = await provider.getRecommendations(idParsed.data);
      return NextResponse.json({ data }, { headers: { "Cache-Control": "public, s-maxage=86400" } });
    }

    // 8. /api/anime/stream/[episodeId]
    if (path[0] === "stream" && path[1]) {
      const data = await provider.getStreamLinks(path[1]);
      return NextResponse.json({ data }, { headers: { "Cache-Control": "public, s-maxage=3600" } });
    }

    return errorResponse("Endpoint tidak ditemukan", 404);

  } catch (error) {
    console.error("[Anime API Error]", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan sistem";
    return errorResponse(message, 500);
  }
          }
