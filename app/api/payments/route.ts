
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.API_BASE_URL;
  const token = process.env.API_TOKEN;

  if (!baseUrl || !token) {
    return NextResponse.json(
      { success: false, message: "Konfigurasi API belum lengkap." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${baseUrl}/payments`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
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

export async function POST(request: NextRequest) {
  const baseUrl = process.env.API_BASE_URL;
  const token = process.env.API_TOKEN;

  if (!baseUrl || !token) {
    return NextResponse.json(
      { success: false, message: "Konfigurasi API belum lengkap." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    const response = await fetch(`${baseUrl}/payments`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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
