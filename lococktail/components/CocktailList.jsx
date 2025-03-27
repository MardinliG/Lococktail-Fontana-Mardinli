import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

export default function CocktailList() {
  const [cocktails, setCocktails] = useState([]);
  const [cocktailRatings, setCocktailRatings] = useState({});
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState(null);
  const [commentsInput, setCommentsInput] = useState({}); // Etat pour les commentaires individuels

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
      fetchComments(data); // Add this to fetch comments
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

  async function fetchComments(cocktailsList) {
    // Add 'id' to the fields being selected
    const { data, error } = await supabase.from('comments').select('id, cocktail_id, content, user_id, created_at');
    if (error) {
      console.error('Erreur lors du chargement des commentaires:', error.message);
      return;
    }

    const commentsMap = {};
    cocktailsList.forEach(cocktail => {
      commentsMap[cocktail.id] = data.filter(comment => comment.cocktail_id === cocktail.id);
    });
    setComments(commentsMap);
  }

  // Met à jour l'état pour un commentaire spécifique au cocktail
  const handleCommentChange = (event, cocktailId) => {
    setCommentsInput({
      ...commentsInput,
      [cocktailId]: event.target.value, // Mise à jour du commentaire du cocktail spécifique
    });
  };

  const submitComment = async (cocktailId) => {
    const newComment = commentsInput[cocktailId]; // Récupère le commentaire spécifique au cocktail
    if (!newComment.trim()) {
      alert('Veuillez entrer un commentaire.');
      return;
    }

    if (!user) {
      alert('Veuillez vous connecter pour ajouter un commentaire.');
      return;
    }

    const { data, error } = await supabase.from('comments').insert([{
      user_id: user.id,
      cocktail_id: cocktailId,
      content: newComment,
    }]);

    if (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error.message);
      alert('Erreur lors de l\'ajout du commentaire');
    } else {
      setCommentsInput({
        ...commentsInput,
        [cocktailId]: "", // Clear the input field for that specific cocktail
      });
      fetchComments(cocktails); // Refresh the comments
    }
  };

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

              {/* Rating section */}
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

              {/* Comment section */}
              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2">Commentaires :</h4>
                <div>
                  {comments[cocktail.id]?.map((comment) => (
                    <div key={comment.id} className="bg-gray-100 p-2 mb-2 rounded">
                      <p className="font-semibold">{comment.user_id}</p>
                      <p>{comment.content}</p>
                    </div>
                  ))}
                </div>
                <textarea
                  value={commentsInput[cocktail.id] || ""}
                  onChange={(e) => handleCommentChange(e, cocktail.id)}
                  className="w-full p-2 mt-2 border rounded"
                  placeholder="Ajoutez un commentaire..."
                />
                <button
                  onClick={() => submitComment(cocktail.id)}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Ajouter un commentaire
                </button>
              </div>

              {/* Favorite button */}
              <button
                onClick={() => toggleFavorite(cocktail.id)}
                className={`bg-${favorites.includes(cocktail.id) ? 'red' : 'blue'}-600 text-white px-4 py-2 rounded hover:bg-${favorites.includes(cocktail.id) ? 'red' : 'blue'}-700`}
              >
                {favorites.includes(cocktail.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              </button>

              {/* Cocktail Details link */}
              <Link
                href={`/cocktails/${cocktail.id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Détails
              </Link>
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
