import { AIProvider, aiProviders } from '@/lib/ai/providers/providers-config';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const providers = aiProviders.map((provider: AIProvider) => ({
    id: provider.id,
    name: provider.name,
    description: provider.description,
    isConfigured: provider.isConfigured
  }));

  return NextResponse.json(providers);
} 

export async function POST(request: Request) {
  const { providerId } = await request.json();

  const cookieStore = await cookies();
  cookieStore.set("selected-provider", providerId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.json({ id: providerId });
} 