import { NextRequest, NextResponse } from "next/server";

async function forwardRequest(
  method: "GET" | "POST",
  request?: NextRequest
) {
  const baseUrl = process.env.API_BASE_URL;
  const token = process.env.API_TOKEN;

  if (!baseUrl || !token) {
    return NextResponse.json(
      { success: false, message: "Konfigurasi API belum lengkap." },
      { status: 500 }
    );
  }

  try {
    const body =
      method === "POST" && request
        ? await request.json()
        : undefined;

    const response = await fetch(`${baseUrl}/members`, {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(body !== undefined
          ? { "Content-Type": "application/json" }
          : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Tidak dapat terhubung ke Laravel." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return forwardRequest("GET");
}

export async function POST(request: NextRequest) {
  return forwardRequest("POST", request);
}