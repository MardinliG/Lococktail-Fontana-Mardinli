"use client"

import { useState } from 'react';

export default function AddCocktailForm({ onCocktailAdded }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');

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
      setLoading(true);
      
      const response = await fetch('/api/cocktails', {
        method: 'POST',
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
        throw new Error(errorData.error || 'Failed to add cocktail');
      }
      
      const data = await response.json();
      
      // Reset form and notify parent
      setName('');
      setDescription('');
      setPrice('');
      setIngredientsInput('');
      setImageUrl('');
      
      if (onCocktailAdded) {
        onCocktailAdded(data);
      }
      
      alert('Cocktail ajouté avec succès!');
    } catch (error) {
      console.error('Error adding cocktail:', error.message);
      setError(error.message || 'Une erreur est survenue lors de l\'ajout du cocktail');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-black">
      <h2 className="text-2xl font-bold mb-4">Ajouter un nouveau cocktail</h2>
      
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
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:bg-green-300"
        >
          {loading ? 'Ajout en cours...' : 'Ajouter le cocktail'}
        </button>
      </form>
    </div>
  );
}