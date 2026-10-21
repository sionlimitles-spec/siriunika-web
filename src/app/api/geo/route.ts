import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<NextResponse> {
  const country = request.headers.get("cf-ipcountry");
  return NextResponse.json(
    { country: country && country !== "XX" ? country.toUpperCase() : null },
    { headers: { "Cache-Control": "private, max-age=3600" } },
  );
}
