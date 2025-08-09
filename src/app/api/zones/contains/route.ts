import { NextRequest } from 'next/server';
import { zoneService } from '@/lib/services/factory';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return Response.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return Response.json(
        { error: 'Invalid latitude or longitude' },
        { status: 400 }
      );
    }

    const result = await zoneService().checkAddressInZones(latNum, lngNum);

    return Response.json(result);
  } catch (error) {
    console.error('Zone contains API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}