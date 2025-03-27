import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

export default function CocktailList() {
  const [cocktails, setCocktails] = useState([]);
  const [cocktailRatings, setCocktailRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        return;
      }
      setUser(data.user);
      fetchFavorites(data.user.id); // Fetch the favorites when the user is logged in
    };

    checkUser();
    fetchCocktails();
  }, []);

  async function fetchCocktails() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cocktails')
        .select('*')
        .order('name');

      if (error) throw error;

      setCocktails(data || []);
      fetchCocktailRatings(data); // Add this line to fetch ratings after fetching cocktails
    } catch (error) {
      console.error('Erreur lors du chargement des cocktails:', error.message);
      alert('Erreur lors du chargement des cocktails');
    } finally {
      setLoading(false);
    }
  }

  async function fetchFavorites(userId) {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('cocktail_id')
        .eq('user_id', userId);

      if (error) throw error;

      setFavorites(data.map(fav => fav.cocktail_id)); // Store cocktail_ids that are favorites
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error.message);
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

  const toggleFavorite = async (cocktailId) => {
    try {
      if (favorites.includes(cocktailId)) {
        // Remove from favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('cocktail_id', cocktailId);
        setFavorites(favorites.filter(id => id !== cocktailId)); // Update state
      } else {
        // Add to favorites
        await supabase
          .from('favorites')
          .insert([{ user_id: user.id, cocktail_id: cocktailId }]);
        setFavorites([...favorites, cocktailId]); // Update state
      }
    } catch (error) {
      console.error('Erreur lors de la modification des favoris:', error.message);
    }
  };

  async function rateCocktail(cocktailId, rating) {
    if (!user) {
      alert("Veuillez vous connecter pour noter un cocktail.");
      return;
    }

    // Insérer ou mettre à jour l'évaluation du cocktail
    const { data, error } = await supabase
      .from('ratings')
      .upsert([{ user_id: user.id, cocktail_id: cocktailId, rating }], { onConflict: ['user_id', 'cocktail_id'] });

    if (error) {
      console.error("Erreur lors de l'enregistrement de la note :", error.message);
      alert("Erreur lors de l'enregistrement de la note.");
    } else {
      alert("Note enregistrée !");
      // Mettre à jour les évaluations pour le cocktail
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
              <div className="flex flex-col gap-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">{cocktail.price.toFixed(2)} €</span>

                  <Link
                    href={`/cocktails/${cocktail.id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Détails
                  </Link>
                </div>

                <div className="flex items-center">
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

                {user && (
                  <button
                    onClick={() => toggleFavorite(cocktail.id)}
                    className={`w-full ${favorites.includes(cocktail.id) ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded`}
                  >
                    {favorites.includes(cocktail.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  </button>
                )}
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
