
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useUser } from "@/app/context/UserProvider";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminPage() {
    const { user } = useUser();
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");

    const [listings, setListings] = useState([]);
    const [users, setUsers] = useState([]);

    const token = typeof window !== 'undefined' ? localStorage.getItem('jwtToken') : null;

    // --- GESTION CATÉGORIES ---
    const deleteCategory = async (id: number) => {
        try {
            await axios.delete(`${API_URL}/api/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(prev => prev.filter((cat: any) => cat.id !== id));
        } catch (error: any) {
            console.error(error);
            alert("Erreur suppression : des annonces sont rattachées à cette catégorie.");
        }
    };

    const updateCategory = async (id: number) => {
        try {
            const response = await axios.patch(`${API_URL}/api/categories/${id}`,
                { name: editingName },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/merge-patch+json'
                    }
                }
            );
            setCategories((prev: any) => prev.map((cat: any) => cat.id === id ? response.data : cat));
            setEditingId(null);
            alert("Catégorie mise à jour !");
        } catch (error: any) {
            console.error(error);
            alert("Erreur lors de la modification");
        }
    };

    const addCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        try {
            const response = await axios.post(`${API_URL}/api/categories`,
                { name: newCategoryName },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/ld+json',
                        'Accept': 'application/ld+json'
                    }
                }
            );
            setCategories((prev: any) => [...prev, response.data]);
            setNewCategoryName("");
            alert("Catégorie ajoutée !");
        } catch (error: any) {
            console.error(error);
        }
    };

    // --- GESTION ANNONCES (Lecture seule + Suppression) ---
    const deleteListing = async (id: number) => {
        if (!confirm("Supprimer cette annonce ?")) return;
        try {
            await axios.delete(`${API_URL}/api/listings/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setListings(prev => prev.filter((l: any) => l.id !== id));
            alert("Annonce supprimée");
        } catch (error) {
            console.error(error);
            alert("Erreur suppression");
        }
    };

    // --- CHARGEMENT INITIAL ---
    useEffect(() => {
        if (!token) return;

        // Catégories
        axios.get(`${API_URL}/api/categories`)
            .then(res => setCategories(res.data.member || []));

        // Annonces (sans pagination)
        axios.get(`${API_URL}/api/listings?page=1&itemsPerPage=50`)
            .then(res => setListings(res.data.member || []));

        // Utilisateurs
        axios.get(`${API_URL}/api/users?pagination=false`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setUsers(res.data.member || []))
            .catch(err => console.error("Erreur users:", err));

    }, [token]);


    console.log("Tous les users :",users)


    // Séparation utilisateurs / propriétaires
    const regularUsers = users.filter((u: any) =>
        Array.isArray(u.roles) &&
        u.roles.length === 1 &&
        u.roles[0] === 'ROLE_USER'
    );


    console.log("Utilisateurs:" , regularUsers)


    const owners = users.filter((u: any) =>
        u.roles?.includes('ROLE_PROPRIETAIRE')
    );

    return (
        <Container>
            <div className="pt-24 pb-12">
                <h1 className="text-center text-3xl font-bold mb-2">Espace administrateur</h1>
                <p className="text-gray-600 text-center mb-12">Bienvenue {user?.name}</p>

                {/* SECTION CATÉGORIES */}
                <div className="bg-white p-6 rounded-xl shadow-sm border mb-12">
                    <h2 className="text-xl font-bold mb-6">Gestion des Catégories</h2>
                    <table className="w-full border-collapse">
                        <thead>
                        <tr className="bg-gray-50 text-left">
                            <th className="p-3 border">Nom</th>
                            <th className="p-3 border text-center w-48">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {categories.map((cat: any) => (
                            <tr key={cat.id} className="border-b">
                                <td className="p-3">
                                    {editingId === cat.id ? (
                                        <input
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            className="border p-1 rounded w-full"
                                        />
                                    ) : (cat.name)}
                                </td>
                                <td className="p-3 flex gap-2 justify-center">
                                    {editingId === cat.id ? (
                                        <>
                                            <button onClick={() => updateCategory(cat.id)} className="text-green-600 font-bold text-sm">Enregistrer</button>
                                            <button onClick={() => setEditingId(null)} className="text-gray-500 text-sm">Annuler</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }} className="text-blue-600 text-sm">Modifier</button>
                                            <button onClick={() => deleteCategory(cat.id)} className="text-red-600 text-sm">Supprimer</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <form onSubmit={addCategory} className="flex gap-4 mt-6">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Nouvelle catégorie..."
                            className="border p-2 rounded flex-1"
                        />
                        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700">Ajouter</button>
                    </form>
                </div>

                {/* SECTION ANNONCES (Lecture seule) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold">Liste des Annonces</h2>
                            <p className="text-sm text-gray-500">{listings.length} annonces au total</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 border">Titre</th>
                                <th className="p-3 border">Prix</th>
                                <th className="p-3 border">Catégorie</th>
                                <th className="p-3 border text-center">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {listings.map((list: any) => (
                                <tr key={list.id} className="hover:bg-gray-50 border-b">
                                    <td className="p-3 font-medium">{list.title}</td>
                                    <td className="p-3">{list.pricePerNight}€ / nuit</td>
                                    <td className="p-3 text-gray-500">{list.category?.name || "N/A"}</td>
                                    <td className="p-3 flex gap-4 justify-center">
                                        <button
                                            onClick={() => router.push(`/listings/${list.id}`)}
                                            className="text-blue-600 hover:underline font-medium"
                                        >
                                            Voir
                                        </button>
                                        <button
                                            onClick={() => deleteListing(list.id)}
                                            className="text-red-600 hover:underline font-medium"
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* SECTION UTILISATEURS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* UTILISATEURS SIMPLES */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h2 className="text-xl font-bold mb-2">Utilisateurs</h2>
                        <p className="text-sm text-gray-500 mb-4">{regularUsers.length} inscrits</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-2 border">Nom</th>
                                    <th className="p-2 border">Email</th>
                                </tr>
                                </thead>
                                <tbody>
                                {regularUsers.map((u: any) => (
                                    <tr key={u.id} className="border-b hover:bg-gray-50">
                                        <td className="p-2">{u.name || "—"}</td>
                                        <td className="p-2 text-gray-600">{u.email}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* PROPRIÉTAIRES */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h2 className="text-xl font-bold mb-2">Propriétaires</h2>
                        <p className="text-sm text-gray-500 mb-4">{owners.length} propriétaires</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-2 border">Nom</th>
                                    <th className="p-2 border">Email</th>
                                </tr>
                                </thead>
                                <tbody>
                                {owners.map((u: any) => (
                                    <tr key={u.id} className="border-b hover:bg-gray-50">
                                        <td className="p-2 font-medium">{u.name || "—"}</td>
                                        <td className="p-2 text-gray-600">{u.email}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
}