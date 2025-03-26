// app/api/cocktails/[id]/route.js

import { supabase } from '../../../../lib/supabaseClient';

// Méthode GET pour récupérer un cocktail spécifique
export async function GET(request, { params }) {
    const { id } = params;

    try {
        const { data: cocktail, error } = await supabase
            .from('cocktails')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Erreur récupération cocktail:', error.message);
            return new Response(JSON.stringify({ error: 'Cocktail introuvable' }), { status: 404 });
        }

        return new Response(JSON.stringify(cocktail), { status: 200 });
    } catch (error) {
        console.error('Erreur serveur:', error.message);
        return new Response(JSON.stringify({ error: 'Erreur interne du serveur' }), { status: 500 });
    }
}

// Méthode PUT pour mettre à jour un cocktail spécifique
export async function PUT(request, { params }) {
    const { id } = params;
    const body = await request.json();

    try {
        const { data: currentCocktail, error: getError } = await supabase
            .from('cocktails')
            .select('*')
            .eq('id', id)
            .single();

        if (getError) {
            return new Response(JSON.stringify({ error: getError.message }), { status: 500 });
        }

        const { error: updateError } = await supabase
            .from('cocktails')
            .update(body)
            .eq('id', id);

        if (updateError) {
            return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
        }

        const { data: updatedCocktail } = await supabase
            .from('cocktails')
            .select('*')
            .eq('id', id)
            .single();

        return new Response(JSON.stringify(updatedCocktail), { status: 200 });
    } catch (error) {
        console.error('Erreur mise à jour cocktail:', error.message);
        return new Response(JSON.stringify({ error: 'Erreur interne du serveur' }), { status: 500 });
    }
}
