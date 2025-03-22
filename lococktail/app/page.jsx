"use client"

import './globals.css';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import CocktailList from '../components/CocktailList';
import AddCocktailForm from '../components/AddCocktailForm';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState(null);
  const [refreshList, setRefreshList] = useState(false);
  
  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    
    getUser();
    
    // Configurer un écouteur d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };
  
  const handleCocktailAdded = () => {
    setRefreshList(prev => !prev);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Cocktails App</h1>
          <div>
            {user ? (
              <div className="flex items-center space-x-4">
                <span>{user.email}</span>
                <button 
                  onClick={handleSignOut}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Connexion / Inscription
              </Link>
            )}
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {user ? (
          <>
            <AddCocktailForm onCocktailAdded={handleCocktailAdded} />
            <h2 className="text-2xl font-bold mb-6">Nos Cocktails</h2>
            <CocktailList key={refreshList ? 'refresh' : 'initial'} />
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Bienvenue sur Cocktails App</h2>
            <p className="mb-6">Connectez-vous pour voir et ajouter des cocktails</p>
            <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-lg">
              Se connecter
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}