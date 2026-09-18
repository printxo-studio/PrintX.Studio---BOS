import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: any = {};
    if (category && category !== 'ALL') where.category = category;

    const documents = await db.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Documents GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newDoc = await db.document.create({
      data: {
        title: body.title,
        category: body.category || 'CAD',
        fileUrl: body.fileUrl || '/files/sample.step',
        fileType: body.fileType || 'STEP',
        fileSize: parseInt(body.fileSize) || 1024000,
        
        uploadedBy: body.uploadedBy || 'PrintXO Engineer',
      },
    });

    return NextResponse.json(newDoc, { status: 201 });
  } catch (error) {
    console.error('Document creation error:', error);
    return NextResponse.json({ error: 'Failed to register document' }, { status: 500 });
  }
}
