"use client"

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AddCocktailForm({ onCocktailAdded }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation de base
    if (!name || !price) {
      alert('Le nom et le prix sont obligatoires');
      return;
    }
    
    // Convertir la string d'ingrédients en tableau
    const ingredients = ingredientsInput
      .split(',')
      .map(ingredient => ingredient.trim())
      .filter(ingredient => ingredient);
    
    try {
      setLoading(true);
      
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Vous devez être connecté pour ajouter un cocktail');
      
      // Ajouter le cocktail
      const { data, error } = await supabase
        .from('cocktails')
        .insert([
          {
            name,
            description,
            ingredients,
            price: parseFloat(price),
            image_url: imageUrl,
            user_id: user.id
          }
        ])
        .select();
      
      if (error) throw error;
      
      // Réinitialiser le formulaire et notifier le parent
      setName('');
      setDescription('');
      setPrice('');
      setIngredientsInput('');
      setImageUrl('');
      
      if (onCocktailAdded) {
        onCocktailAdded(data[0]);
      }
      
      alert('Cocktail ajouté avec succès!');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du cocktail:', error.message);
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">Ajouter un nouveau cocktail</h2>
      
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
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          {loading ? 'Ajout en cours...' : 'Ajouter le cocktail'}
        </button>
      </form>
    </div>
  );
}