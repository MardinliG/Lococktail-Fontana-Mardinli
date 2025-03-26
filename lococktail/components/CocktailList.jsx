"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CocktailList() {
  const [cocktails, setCocktails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCocktails();
  }, []);

  async function fetchCocktails() {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/cocktails');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch cocktails');
      }
      
      const data = await response.json();
      setCocktails(data || []);
    } catch (error) {
      console.error('Error loading cocktails:', error.message);
      setError('Unable to load cocktails. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center p-4">Chargement des cocktails...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">{error}</div>;
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
              <div className="flex justify-between items-center mt-4">
                <span className="font-bold text-lg">{cocktail.price.toFixed(2)} €</span>
                <Link href={`/cocktails/${cocktail.id}`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
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