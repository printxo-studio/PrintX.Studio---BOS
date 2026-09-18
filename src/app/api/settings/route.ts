import { NextResponse } from 'next/server';
import { getSystemSettings, saveSystemSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getSystemSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Failed to get settings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updated = await saveSystemSettings(body);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    console.error('Failed to save settings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save settings' },
      { status: 500 }
    );
  }
}
