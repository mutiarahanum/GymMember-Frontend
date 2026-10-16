import { NextResponse } from "next/server";

const API_URL = "http://127.0.0.1:8000/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
      cache: "no-store",
    });

    const result = await response.json();

    return NextResponse.json(result, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "Tidak dapat terhubung ke server Laravel. Pastikan backend sedang berjalan.",
      },
      { status: 500 }
    );
  }
}
