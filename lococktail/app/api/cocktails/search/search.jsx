import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

export async function GET(request) {
  try {
    // Get search parameters from the URL
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('query') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const ingredient = searchParams.get('ingredient');
    
    // Start building the query
    const cocktailsQuery = supabase
      .from('cocktails')
      .select('*')
      .order('name');

    // Add filters
    if (query) {
      cocktailsQuery.ilike('name', `%${query}%`);
    }

  } 
}