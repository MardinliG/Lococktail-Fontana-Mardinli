"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import Link from "next/link";
import { use } from "react"; // Importer 'use' de React

export default function EditCocktail({ params }) {
    const router = useRouter();

    // Déballer les paramètres via React.use()
    const unwrappedParams = use(params);  // Utiliser `use()` pour déballer la promesse
    const id = unwrappedParams.id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [cocktail, setCocktail] = useState(null);
    const [user, setUser] = useState(null);

    // Form fields
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [ingredientsInput, setIngredientsInput] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    useEffect(() => {
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

    // Fonction pour mettre à jour le cocktail dans Supabase
    async function updateCocktail(updatedCocktail) {
        try {
            const { error } = await supabase
                .from('cocktails')
                .update(updatedCocktail)  // Envoie les nouvelles données
                .eq('id', updatedCocktail.id);  // Assure-toi que c'est le bon cocktail à mettre à jour

            if (error) {
                throw error;
            }

            // Si la mise à jour réussit, redirige l'utilisateur vers la page du cocktail mis à jour
            alert("Cocktail mis à jour avec succès!");
            router.push(`/cocktails/${updatedCocktail.id}`);
        } catch (error) {
            console.error("Erreur lors de la mise à jour du cocktail:", error.message);
            setError(error.message || "Une erreur est survenue lors de la mise à jour du cocktail");
        }
    }

    // Fonction pour charger le cocktail depuis la base de données
    async function fetchCocktail() {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/cocktails/${id}`);

            // Vérifier que la réponse n'est pas vide
            if (!response.ok) {
                const errorMessage = `Erreur ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            const text = await response.text();
            if (!text) throw new Error("Réponse vide du serveur");

            const data = JSON.parse(text);

            setCocktail(data);
            setName(data.name || "");
            setDescription(data.description || "");
            setPrice(data.price?.toString() || "");
            setImageUrl(data.image_url || "");
            setIngredientsInput(data.ingredients?.join(", ") || "");
        } catch (error) {
            console.error("Erreur chargement cocktail:", error.message);
            setError(error.message || "Impossible de charger les détails du cocktail.");
        } finally {
            setLoading(false);
        }
    }

    // Handler pour la soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Reset error state
        setError(null);

        // Validation simple
        if (!name || !price) {
            setError("Le nom et le prix sont obligatoires");
            return;
        }

        // Convertir les ingrédients en tableau
        const ingredients = ingredientsInput
            .split(",")
            .map((ingredient) => ingredient.trim())
            .filter((ingredient) => ingredient);

        // Créer l'objet de données à envoyer
        const payload = {
            id,  // L'ID est nécessaire pour la mise à jour
            name,
            description,
            ingredients,
            price: parseFloat(price),
            image_url: imageUrl,
        };

        console.log("Sending update payload:", payload);  // Log pour déboguer

        try {
            setSaving(true);

            // Appel à la fonction de mise à jour
            await updateCocktail(payload);
        } catch (error) {
            console.error("Error updating cocktail:", error.message);
            setError(error.message || "Une erreur est survenue lors de la mise à jour du cocktail");
        } finally {
            setSaving(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-xl">Chargement...</p>
            </div>
        );
    }

    // Error state
    if (!cocktail && !loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl text-red-600 mb-2">Erreur</h2>
                    <p>{error || "Ce cocktail n'existe pas ou a été supprimé."}</p>
                    <Link
                        href="/cocktails"
                        className="text-blue-600 mt-4 inline-block hover:underline"
                    >
                        Retour à la liste des cocktails
                    </Link>
                </div>
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
                        <h1 className="text-3xl font-bold text-gray-900 ml-4">Modifier {cocktail?.name}</h1>
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
                                {saving ? "Enregistrement..." : "Sauvegarder les modifications"}
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
