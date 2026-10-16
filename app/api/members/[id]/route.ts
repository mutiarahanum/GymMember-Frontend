import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function forwardRequest(
  method: "PUT" | "DELETE",
  request: NextRequest,
  context: RouteContext
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
    const { id } = await context.params;

    const response = await fetch(
      `${baseUrl}/members/${encodeURIComponent(id)}`,
      {
        method,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          ...(method === "PUT"
            ? { "Content-Type": "application/json" }
            : {}),
        },
        ...(method === "PUT"
          ? { body: JSON.stringify(await request.json()) }
          : {}),
        cache: "no-store",
      }
    );

    const text = await response.text();

    let data: unknown;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      return NextResponse.json(
        { success: false, message: "Laravel mengirim respons yang bukan JSON." },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Tidak dapat terhubung ke Laravel." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  return forwardRequest("PUT", request, context);
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  return forwardRequest("DELETE", request, context);
}