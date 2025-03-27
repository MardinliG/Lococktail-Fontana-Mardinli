"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

export default function CocktailList() {
  const [cocktails, setCocktails] = useState([]);
  const [cocktailRatings, setCocktailRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
    fetchCocktails();
  }, []);

  async function fetchUser() {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setUser(data.user);
    }
  }

  async function fetchCocktails() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cocktails')
        .select('*')
        .order('name');
      if (error) throw error;
      setCocktails(data || []);
      fetchCocktailRatings(data);
    } catch (error) {
      console.error('Erreur lors du chargement des cocktails:', error.message);
      alert('Erreur lors du chargement des cocktails');
    } finally {
      setLoading(false);
    }
  }

  async function fetchCocktailRatings(cocktailsList) {
    const { data, error } = await supabase.from('ratings').select('cocktail_id, rating');
    if (error) {
      console.error('Erreur lors du chargement des ratings:', error.message);
      return;
    }
    
    const ratings = {};
    cocktailsList.forEach(cocktail => {
      const cocktailRatings = data.filter(r => r.cocktail_id === cocktail.id);
      ratings[cocktail.id] = cocktailRatings.length 
        ? cocktailRatings.reduce((sum, r) => sum + r.rating, 0) / cocktailRatings.length
        : 0;
    });
    setCocktailRatings(ratings);
  }

  async function addToFavorites(cocktailId) {
    try {
      // Vérifier si le cocktail est déjà en favori pour cet utilisateur
      const { data: existingFavorite, error: selectError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .eq('cocktail_id', cocktailId)
        .single(); // On récupère un seul résultat
  
      if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = aucune ligne trouvée (pas une vraie erreur)
        throw selectError;
      }
  
      if (existingFavorite) {
        alert('Ce cocktail est déjà dans vos favoris.');
        return; // Empêche l'ajout en double
      }
  
      // Ajouter le cocktail aux favoris
      const { error: insertError } = await supabase
        .from('favorites')
        .insert([{ user_id: user.id, cocktail_id: cocktailId }]);
  
      if (insertError) throw insertError;
  
      alert('Cocktail ajouté aux favoris !');
    } catch (error) {
      console.error("Erreur lors de l'ajout aux favoris :", error.message);
      alert("Erreur lors de l'ajout aux favoris");
    }
  }
  

  async function rateCocktail(cocktailId, rating) {
    if (!user) {
      alert("Veuillez vous connecter pour noter un cocktail.");
      return;
    }
    const { data, error } = await supabase
      .from('ratings')
      .upsert([{ user_id: user.id, cocktail_id: cocktailId, rating }], { onConflict: ['user_id', 'cocktail_id'] });
    if (error) {
      console.error("Erreur lors de l'enregistrement de la note :", error.message);
      alert("Erreur lors de l'enregistrement de la note.");
    } else {
      alert("Note enregistrée !");
      fetchCocktailRatings(cocktails);
    }
  }

  if (loading) {
    return <div className="text-center p-4">Chargement des cocktails...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cocktails.length ? (
        cocktails.map((cocktail) => (
          <div key={cocktail.id} className="border rounded-lg overflow-hidden shadow-lg">
            {cocktail.image_url && (
              <img 
                src={cocktail.image_url} 
                alt={cocktail.name} 
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-xl font-bold mb-2">{cocktail.name}</h3>
              <p className="text-gray-700 mb-2">{cocktail.description}</p>
              <div className="flex items-center mt-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <span 
                    key={star} 
                    onClick={() => rateCocktail(cocktail.id, star)}
                    className={`text-xl cursor-pointer ${cocktailRatings[cocktail.id] >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                  >
                    ★
                  </span>
                ))}
                <span className="ml-2 text-gray-600">
                  ({cocktailRatings[cocktail.id]?.toFixed(1) || '0.0'})
                </span>
              </div>
              <div className="flex justify-between items-center mt-4">
                <button 
                  onClick={() => addToFavorites(cocktail.id)} 
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Ajouter aux favoris
                </button>
                <Link 
                  href={`/cocktails/${cocktail.id}`} 
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Détails
                </Link>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center p-4">
          Aucun cocktail trouvé. Ajoutez votre premier cocktail !
        </div>
      )}
    </div>
  );
}
