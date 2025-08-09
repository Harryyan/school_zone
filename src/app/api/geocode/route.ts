import { NextRequest } from 'next/server';
import { geocodingService } from '@/lib/services/factory';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query) {
      return Response.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    if (query.length < 3) {
      return Response.json(
        { error: 'Query must be at least 3 characters long' },
        { status: 400 }
      );
    }

    const results = await geocodingService().geocodeAddress(query);

    return Response.json({
      query,
      results
    });
  } catch (error) {
    console.error('Geocode API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}