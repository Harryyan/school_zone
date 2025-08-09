import { NextRequest } from 'next/server';
import { schoolService } from '@/lib/services/factory';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const school = await schoolService().findById(params.id);
    
    if (!school) {
      return Response.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    return Response.json(school);
  } catch (error) {
    console.error('School API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}