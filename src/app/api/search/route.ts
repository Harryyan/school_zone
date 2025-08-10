import { NextRequest } from 'next/server';
import { schoolService } from '@/lib/services/factory';
import type { SearchParams } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const params: SearchParams = {
      q: searchParams.get('q') || undefined,
      lat: searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined,
      lng: searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined,
      radius: searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: Math.min(parseInt(searchParams.get('pageSize') || '20'), 100),
      sortBy: (searchParams.get('sortBy') as 'distance' | 'name' | 'type') || 'name'
    };

    // Parse bbox if provided
    const bboxParam = searchParams.get('bbox');
    if (bboxParam) {
      const bbox = bboxParam.split(',').map(Number);
      if (bbox.length === 4) {
        params.bbox = bbox as [number, number, number, number];
      }
    }

    // Parse filters
    const filters: any = {};
    
    const type = searchParams.get('type');
    if (type) {
      filters.type = type.split(',');
    }

    const gender = searchParams.get('gender');
    if (gender) {
      filters.gender = gender.split(',');
    }

    const proprietor = searchParams.get('proprietor');
    if (proprietor) {
      filters.proprietor = proprietor.split(',');
    }

    const boarding = searchParams.get('boarding');
    if (boarding) {
      filters.boarding = boarding === 'true';
    }

    const hasZone = searchParams.get('hasZone');
    if (hasZone) {
      filters.hasZone = hasZone === 'true';
    }

    const equityIndexBand = searchParams.get('equityIndexBand');
    if (equityIndexBand) {
      filters.equityIndexBand = equityIndexBand.split(',').map(Number);
    }

    const decile = searchParams.get('decile');
    if (decile) {
      filters.decile = decile.split(',').map(Number);
    }

    if (Object.keys(filters).length > 0) {
      params.filters = filters;
    }

    const service = schoolService();
    const results = await service.search(params);

    return Response.json(results);
  } catch (error) {
    console.error('Search API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}