import { NextRequest } from 'next/server';
import { schoolService } from '@/lib/services/factory';

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
    const radius = parseInt(searchParams.get('radius') || '5000');
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 20);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return Response.json(
        { error: 'Invalid latitude or longitude' },
        { status: 400 }
      );
    }

    const schools = await schoolService().findNearby(latNum, lngNum, radius, limit);

    return Response.json({
      center: { lat: latNum, lng: lngNum },
      radius,
      schools
    });
  } catch (error) {
    console.error('Nearby schools API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}