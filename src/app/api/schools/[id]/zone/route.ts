import { NextRequest } from 'next/server';
import { zoneService } from '@/lib/services/factory';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const zone = await zoneService().getZoneBySchoolId(params.id);
    
    if (!zone) {
      return Response.json(
        { error: 'Zone not found' },
        { status: 404 }
      );
    }

    return Response.json(zone);
  } catch (error) {
    console.error('Zone API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}