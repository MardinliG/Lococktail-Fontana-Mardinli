"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import Link from 'next/link';
import { use } from 'react';

export default function CocktailDetail({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [cocktail, setCocktail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, []);

  useEffect(() => {
    if (id) {
      fetchCocktail();
    }
  }, [id]);

  async function fetchCocktail() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('cocktails')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setCocktail(data);
    } catch (error) {
      console.error('Erreur lors du chargement du cocktail:', error.message);
      alert('Erreur lors du chargement du cocktail');
    } finally {
      setLoading(false);
    }
  }

  async function deleteCocktail() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cocktail?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('cocktails')
        .delete()
        .eq('id', id);

      if (error) throw error;

      router.replace('/');  // Changed from push to replace
    } catch (error) {
      console.error('Erreur lors de la suppression du cocktail:', error.message);
      alert('Erreur lors de la suppression du cocktail');
    }
  }

  if (loading) {
    return <div className="text-center p-12">Chargement du cocktail...</div>;
  }

  if (!cocktail) {
    return <div className="text-center p-12">Cocktail non trouvé</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-2">
            <Link href="/" className="text-blue-600 hover:underline">
              ← Retour
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 ml-4">{cocktail.name}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            {cocktail.image_url && (
              <div className="md:flex-shrink-0">
                <img
                  src={cocktail.image_url}
                  alt={cocktail.name}
                  className="h-64 w-full object-cover md:w-64"
                />
              </div>
            )}

            <div className="p-8">
              <div className="text-sm text-gray-500 mb-1">Cocktail</div>
              <h2 className="text-2xl font-bold mb-4">{cocktail.name}</h2>

              <p className="text-gray-700 mb-6">{cocktail.description}</p>

              <div className="mb-6">
                <h3 className="font-bold mb-2">Ingrédients:</h3>
                {Array.isArray(cocktail.ingredients) && cocktail.ingredients.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {cocktail.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Aucun ingrédient spécifié</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{cocktail.price.toFixed(2)} €</div>

                {user && user.id === cocktail.user_id && (
                  <div className="flex space-x-2">
                    <Link
                      href={`/cocktails/edit/${cocktail.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Modifier
                    </Link>
                    <button
                      onClick={deleteCocktail}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}