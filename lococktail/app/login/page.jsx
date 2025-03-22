"use client"

import Auth from '../../components/Auth';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation'; // Changed to next/navigation

export default function Login() {
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        router.replace('/'); // Changed push to replace
      }
    });

    // Mettre en place un écouteur pour les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          router.replace('/'); // Changed push to replace
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-black">Cocktails App</h1>
        {!session && <Auth />}
      </div>
    </div>
  );
}