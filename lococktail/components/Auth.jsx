"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  // Connexion
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  // Inscription
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: "http://localhost:3000" },
    });
    if (error) {
      alert(error.message);
    } else {
      alert("Un email de confirmation a été envoyé !");
    }
    setLoading(false);
  };

  // Connexion avec OAuth (GitHub & Google)
  const handleOAuthLogin = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) throw error;
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg space-y-4">
      {/* Boutons Sign In / Sign Up */}
      <div className="flex justify-center space-x-4">
        <button
          className={`px-4 py-2 rounded-md font-medium ${!isSignUp ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}
          onClick={() => setIsSignUp(false)}
        >
          Sign In
        </button>
        <button
          className={`px-4 py-2 rounded-md font-medium ${isSignUp ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}
          onClick={() => setIsSignUp(true)}
        >
          Sign Up
        </button>
      </div>

      {/* Titre */}
      <h2 className="text-xl font-bold text-center text-black">{isSignUp ? "Créer un compte" : "Se connecter"}</h2>

      {/* Formulaire Connexion/Inscription */}
      <form onSubmit={isSignUp ? handleSignUp : handleEmailLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-black"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-black"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          {loading ? "Chargement..." : isSignUp ? "S'inscrire" : "Se connecter"}
        </button>
      </form>

      {/* Boutons OAuth (GitHub & Google) */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleOAuthLogin("github")}
          className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.523 2 12.064c0 4.47 2.865 8.267 6.839 9.618.5.092.682-.226.682-.502 0-.248-.009-.906-.013-1.78-2.782.613-3.37-1.344-3.37-1.344-.454-1.16-1.11-1.47-1.11-1.47-.908-.628.07-.616.07-.616 1.003.07 1.531 1.048 1.531 1.048.892 1.55 2.341 1.104 2.91.846.092-.657.35-1.104.636-1.362-2.22-.256-4.555-1.13-4.555-5.031 0-1.112.39-2.026 1.029-2.73-.103-.256-.446-1.292.098-2.692 0 0 .84-.276 2.75 1.051a9.583 9.583 0 015.004 0c1.91-1.327 2.75-1.051 2.75-1.051.546 1.4.203 2.436.1 2.692.64.704 1.028 1.618 1.028 2.73 0 3.917-2.339 4.78-4.566 5.036.359.318.678.942.678 1.902 0 1.374-.012 2.487-.012 2.82 0 .275.18.598.688.502A10.045 10.045 0 0022 12.064C22 6.523 17.523 2 12 2z" />
          </svg>
          GitHub
        </button>

        <button
          onClick={() => handleOAuthLogin("google")}
          className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866.549 3.921 1.453l2.814-2.814C17.503 2.988 15.139 2 12.545 2 7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426.011z" />
          </svg>
          Google
        </button>
      </div>
    </div>
  );
}
