"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../../lib/supabaseClient';
import Link from 'next/link';

export default function EditCocktail({ params }) {
  const router = useRouter();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [cocktail, setCocktail] = useState(null);
  const [user, setUser] = useState(null);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    // Check if user is logged in
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
      setError(null);

      const response = await fetch(`/api/cocktails/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch cocktail');
      }

      const data = await response.json();
      setCocktail(data);

      // Populate form fields
      setName(data.name || '');
      setDescription(data.description || '');
      setPrice(data.price?.toString() || '');
      setImageUrl(data.image_url || '');

      // Convert ingredients array to comma-separated string
      if (Array.isArray(data.ingredients)) {
        setIngredientsInput(data.ingredients.join(', '));
      }
    } catch (error) {
      console.error('Error loading cocktail:', error.message);
      setError('Unable to load cocktail details. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset error state
    setError(null);

    // Basic validation
    if (!name || !price) {
      setError('Le nom et le prix sont obligatoires');
      return;
    }

    // Convert ingredients string to array
    const ingredients = ingredientsInput
      .split(',')
      .map(ingredient => ingredient.trim())
      .filter(ingredient => ingredient);

    try {
      setSaving(true);

      const response = await fetch(`/api/cocktails/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          ingredients,
          price: parseFloat(price),
          image_url: imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update cocktail');
      }

      await response.json();

      alert('Cocktail mis à jour avec succès!');
      router.push(`/cocktails/${id}`);
    } catch (error) {
      console.error('Error updating cocktail:', error.message);
      setError(error.message || 'Une erreur est survenue lors de la mise à jour du cocktail');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center p-12">Chargement du cocktail...</div>;
  }

  if (error) {
    return <div className="text-center p-12 text-red-600">{error}</div>;
  }

  if (!cocktail) {
    return <div className="text-center p-12">Cocktail non trouvé</div>;
  }

  // Check if user is authorized to edit this cocktail
  if (user && user.id !== cocktail.user_id) {
    return (
      <div className="text-center p-12">
        <p className="text-red-600 mb-4">Vous n'êtes pas autorisé à modifier ce cocktail.</p>
        <Link href="/" className="text-blue-600 hover:underline">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-2">
            <Link href={`/cocktails/${id}`} className="text-blue-600 hover:underline">
              ← Retour
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 ml-4">Modifier {cocktail.name}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-black">
          <h2 className="text-2xl font-bold mb-4">Modifier le cocktail</h2>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="name">
                Nom *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded"
                rows="3"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="ingredients">
                Ingrédients (séparés par des virgules)
              </label>
              <input
                id="ingredients"
                type="text"
                value={ingredientsInput}
                onChange={(e) => setIngredientsInput(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Ex: Rhum, Jus de citron, Sucre de canne"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="price">
                Prix (€) *
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1" htmlFor="imageUrl">
                URL de l'image
              </label>
              <input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300 flex-1"
              >
                {saving ? 'Enregistrement...' : 'Sauvegarder les modifications'}
              </button>

              <Link
                href={`/cocktails/${id}`}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-center"
              >
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}