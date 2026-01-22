/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useUser } from "@/app/context/UserProvider";
import Container from "@/components/Container";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminPage() {
    const { user } = useUser();
    const router = useRouter();
    const [categories, setCategories] = useState<any[]>([]); // ajout du type any[]
    const [listings, setListings] = useState<any[]>([]);// ajout du type any[]
    const [users, setUsers] = useState<any[]>([]);// ajout du type any[]
    const [newCategoryName, setNewCategoryName] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");
    const [bookings, setBookings] = useState<any[]>([]);




    const token = typeof window !== 'undefined' ? localStorage.getItem('jwtToken') : null;

    useEffect(() => {
        if (!token) {
            router.replace("/");
        }
    }, [token, router]);


    // --- GESTION CATÉGORIES ---
    const deleteCategory = async (id: number) => {
        try {
            await axios.delete(`${API_URL}/api/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(prev => prev.filter((cat: any) => cat.id !== id));
            toast.success("Catégorie supprimée");
        } catch (error: any) {
            toast.error("Impossible de supprimer : des annonces utilisent cette catégorie.");
        }
    };

    const updateCategory = async (id: number) => {
        if (!editingName.trim()) return;
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
            toast.success("Catégorie mise à jour !");
        } catch (error: any) {
            toast.error("Erreur lors de la modification");
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
            toast.success("Nouvelle catégorie ajoutée !");
        } catch (error: any) {
            toast.error("Erreur lors de l'ajout");
        }
    };

    // --- GESTION ANNONCES ---
    const deleteListing = async (id: number) => {
        // Le confirm natif est acceptable, mais on utilise un toast pour le résultat
        if (!confirm("Voulez-vous vraiment supprimer cette annonce ?")) return;

        try {
            await axios.delete(`${API_URL}/api/listings/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setListings(prev => prev.filter((l: any) => l.id !== id));
            toast.success("Annonce supprimée du catalogue");
        } catch (error) {
            toast.error("Erreur lors de la suppression de l'annonce");
        }
    };

    // --- CHARGEMENT INITIAL ---
    useEffect(() => {
        if (!token) return;

        // Catégories
        axios.get(`${API_URL}/api/categories`)
            .then(res => setCategories(res.data.member || res.data["hydra:member"] || []));

        // Annonces
        axios.get(`${API_URL}/api/listings?page=1&itemsPerPage=50`)
            .then(res => setListings(res.data.member || res.data["hydra:member"] || []));

        // Utilisateurs
        axios.get(`${API_URL}/api/users?pagination=false`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setUsers(res.data.member || res.data["hydra:member"] || []))
            .catch(() => toast.error("Erreur de chargement des utilisateurs"));

        // Réservations
        axios.get(`${API_URL}/api/bookings?pagination=false`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setBookings(res.data.member || res.data["hydra:member"] || []))
            .catch(() => toast.error("Erreur de chargement des réservations"));

    }, [token]);

    // Filtres
    const regularUsers = users.filter((u: any) =>
        Array.isArray(u.roles) && u.roles.includes('ROLE_USER') && u.roles.length === 1
    );

    const owners = users.filter((u: any) =>
        u.roles?.includes('ROLE_PROPRIETAIRE')
    );

    const formatDateFr = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

  const statusLabel = (status?: string) => {
  switch ((status || "").toLowerCase()) {
    case "paid":
      return "Payé";
    case "pending":
      return "En attente";
    case "cancelled":
      return "Annulé";
    default:
      return "—";
  }
};


    console.log("Bookings:", bookings);

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
                                            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none"
                                            autoFocus
                                        />
                                    ) : (cat.name)}
                                </td>
                                <td className="p-3 flex gap-2 justify-center">
                                    {editingId === cat.id ? (
                                        <>
                                            <button onClick={() => updateCategory(cat.id)} className="bg-green-100 text-green-700 px-3 py-1 rounded-md font-bold text-xs hover:bg-green-200">Enregistrer</button>
                                            <button onClick={() => setEditingId(null)} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-xs hover:bg-gray-200">Annuler</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }} className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-md text-sm transition">Modifier</button>
                                            <button onClick={() => deleteCategory(cat.id)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-md text-sm transition">Supprimer</button>
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
                            placeholder="Nom de la nouvelle catégorie..."
                            className="border p-3 rounded flex-1 focus:ring-2 focus:ring-green-500 outline-none"
                        />
                        <button type="submit" className="bg-green-600 text-white px-8 py-2 rounded-lg font-medium hover:bg-green-700 transition">Ajouter</button>
                    </form>
                </div>

                {/* SECTION ANNONCES */}
                <div className="bg-white p-6 rounded-xl shadow-sm border mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold">Liste des Annonces</h2>
                            <p className="text-sm text-gray-500">{listings.length} annonces publiées</p>
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
                                <tr key={list.id} className="hover:bg-gray-50 border-b transition">
                                    <td className="p-3 font-medium">{list.title}</td>
                                    <td className="p-3">{list.pricePerNight}€</td>
                                    <td className="p-3"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{list.category?.name || "N/A"}</span></td>
                                    <td className="p-3 flex gap-4 justify-center">
                                        <button onClick={() => router.push(`/listings/${list.id}`)} className="text-blue-600 hover:underline">Voir</button>
                                        <button onClick={() => deleteListing(list.id)} className="text-red-600 hover:underline">Supprimer</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* SECTION UTILISATEURS / PROPRIO */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h2 className="text-xl font-bold mb-1">Utilisateurs</h2>
                        <p className="text-xs text-gray-400 mb-4 uppercase tracking-wider">{regularUsers.length} Clients</p>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50">
                                <tr><th className="p-2 border">Nom</th><th className="p-2 border">Email</th></tr>
                            </thead>
                            <tbody>
                                {regularUsers.map((u: any) => (
                                    <tr key={u.id} className="border-b hover:bg-gray-50 transition"><td className="p-2">{u.name || "—"}</td><td className="p-2 text-gray-500">{u.email}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h2 className="text-xl font-bold mb-1">Propriétaires</h2>
                        <p className="text-xs text-gray-400 mb-4 uppercase tracking-wider">{owners.length} Partenaires</p>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50">
                                <tr><th className="p-2 border">Nom</th><th className="p-2 border">Email</th></tr>
                            </thead>
                            <tbody>
                                {owners.map((u: any) => (
                                    <tr key={u.id} className="border-b hover:bg-gray-50 transition"><td className="p-2 font-medium">{u.name || "—"}</td><td className="p-2 text-gray-500">{u.email}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* SECTION RÉSERVATIONS */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h2 className="text-xl font-bold mb-1">Réservations</h2>
                    <p className="text-xs text-gray-400 mb-4 uppercase tracking-wider">{bookings.length} Réservations</p>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50">
                            <tr><th className="p-2 border">Utilisateur</th><th className="p-2 border">Annonce</th><th className="p-2 border">Dates</th> <th className="p-2 border">Statut</th></tr>
                        </thead>
                        <tbody>
                            {bookings.map((b: any) => (
                                <tr key={b.id} className="border-b hover:bg-gray-50 transition"><td className="p-2">{b.booker?.name || "—"}</td><td className="p-2">{b.listing?.title || "—"}</td><td className="p-2">{formatDateFr(b.startDate)} à {formatDateFr(b.endDate)}</td> <td className="p-2">{statusLabel(b.status)}</td>
 </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </Container>
    );
}