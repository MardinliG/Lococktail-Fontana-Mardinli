import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

// GET all cocktails
export async function GET(request) {
  try {
    const { data, error } = await supabase
      .from('cocktails')
      .select('*')
      .order('name');
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cocktails' }, { status: 500 });
  }
}

// POST new cocktail
export async function POST(request) {
  try {
    const cocktailData = await request.json();
    
    // Validation
    if (!cocktailData.name || !cocktailData.price) {
      return NextResponse.json(
        { error: 'Name and price are required' }, 
        { status: 400 }
      );
    }
    
    // Get user from the session
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }
    
    const userId = sessionData.session.user.id;
    
    // Insert the new cocktail
    const { data, error } = await supabase
      .from('cocktails')
      .insert([{
        ...cocktailData,
        user_id: userId
      }])
      .select();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create cocktail' }, 
      { status: 500 }
    );
  }
}