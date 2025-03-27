"use client"

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push('/login');
        return;
      }
      setUser(data.user);
      fetchFavorites(data.user.id);
    };

    checkUser();
  }, []);

  async function fetchFavorites(userId) {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('favorites')
        .select('cocktails(*)')  // On s'assure que cette relation est correctement définie dans Supabase
        .eq('user_id', userId);  // On filtre par l'utilisateur connecté
  
      if (error) throw error;
  
      // Extraire les cocktails des résultats de la requête
      const favoriteCocktails = data.map(fav => fav.cocktails);
      setFavorites(favoriteCocktails);  // Mettre à jour l'état avec les cocktails favoris
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error.message);
    } finally {
      setLoading(false);
    }
  }
  

  if (loading) {
    return <div className="text-center p-4">Chargement des favoris...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Mes Cocktails Favoris</h1>
      
      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl mb-4">Vous n'avez pas encore de cocktails favoris.</p>
          <Link 
            href="/" 
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            Découvrir des cocktails
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((cocktail) => (
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
                <div className="flex justify-between items-center mt-4">
                  <span className="font-bold text-lg">{cocktail.price.toFixed(2)} €</span>
                  <Link 
                    href={`/cocktails/${cocktail.id}`} 
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Détails
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}