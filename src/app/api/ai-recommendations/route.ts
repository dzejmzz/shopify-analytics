import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  // In the future, check user plan and call OpenAI here
  // For now, always return aiEnabled: false and a placeholder message
  return NextResponse.json({
    aiEnabled: false,
    recommendation: 'Upgrade your plan to unlock AI-powered recommendations for your analytics tables!'
  });
} 