"use client"

import {useUser} from "@/app/context/UserProvider";
import {useEffect, useState} from "react";
import axios from "axios";
import AddListingModal from "@/components/modals/AddListingModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL;


export default function AdminPage() {

    const {user} = useUser()
    const [categories, setCategories] = useState([])
    const [newCategoryName, setNewCategoryName] = useState("")
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editingName, setEditingName] = useState("")
    const [listings, setListings] = useState([])
    const [editingListingId, setEditingListingId] = useState<number | null>(null)
    const [editForm, setEditForm] = useState({ title: "", pricePerNight: 0 })
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwtToken') : null

    console.log("Role :",user)

    const deleteCategory = async (id:number) => {  try {
        await axios.delete(`${API_URL}/api/categories/${id}` , {
            headers: { Authorization: `Bearer ${token}` }})

        setCategories(prev =>
            prev.filter((cat: any) => cat.id !== id))
    } catch (error: any) {
        console.error(error)

        if (error.response?.status === 403) {
            alert("Accès refusé (admin uniquement)")
        }}}

    const updateCategory = async (id:number) => {

        try {
            const response = await axios.patch(`${API_URL}/api/categories/${id}`,   { name: editingName }, {

                headers : {
                    Authorization: `Bearer ${token}`,  'Content-Type': 'application/merge-patch+json'
                }
            }
            )

            // @ts-ignore
            setCategories(prev => prev.map((cat:any) =>
                cat.id === id ? response.data : cat
            ))
            setEditingId(null)
            alert("Catégorie mise à jour !")

        } catch (error: any) {
            console.error(error)
            alert("Erreur lors de la modification")
        }
    }

    const addCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newCategoryName.trim()) return

        try {
            const response = await axios.post(`${API_URL}/api/categories`,
                { name: newCategoryName},
                { headers: { Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/ld+json', // Format requis par API Platform
                        'Accept': 'application/ld+json'  }

                }
            )

            // On ajoute la nouvelle catégorie à la liste sans recharger la page
            setCategories((prev) => [...prev, response.data])
            setNewCategoryName("") // On vide le champ
            alert("Catégorie ajoutée !")
        } catch (error: any) {
            console.error(error)
            alert("Erreur lors de l'ajout")
        }
    }


    useEffect(() => {
        if (!token) return

        axios
            .get(`${API_URL}/api/categories`)
            .then(res => {
                setCategories(res.data.member)})
        console.log("categories :",categories)

    }, [token]);


    // ****************************  LISTINGS

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        if (!token) return

        axios
            .get(`${API_URL}/api/listings`)
            .then(res => {
                setListings(res.data.member)})
        console.log("listings :",listings)

    }, [token]);

    // États pour le formulaire d'ajout d'annonce
    const [newListing, setNewListing] = useState({
        title: "",
        description: "",
        pricePerNight: 0,
        capacity: 1,
        categoryId: ""
    })


    const handleAddListing = async (e: React.FormEvent) => {
        e.preventDefault()
        // Logique axios.post à venir...
        console.log("Données à envoyer :", newListing)
    }
    const updateListing = async (id: number) => {
        try {
            const response = await axios.patch(`${API_URL}/api/listings/${id}`,
                {
                    title: editForm.title,
                    pricePerNight: Number(editForm.pricePerNight)
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/merge-patch+json'
                    }
                }
            )

            setListings(prev => prev.map((l: any) => l.id === id ? response.data : l))
            setEditingListingId(null)
            alert("Annonce mise à jour !")
        } catch (error) {
            console.error(error)
            alert("Erreur lors de la modification")
        }
    }




    return (
      <div>      <h1 className="mt-8 text-center text-3xl font-bold mb-6">
        Espace administrateur
      </h1>

        <p className="text-gray-600">
          Bienvenue {user?.name}
        </p>
        <h2 className="text-xl font-bold mb-4">Catégories</h2>
        <table className="w-full border">
            <thead>
            <tr>
                <th>Nom</th>
                <th className="w-32">Actions</th>
            </tr>
            </thead>
            <tbody>
            {categories.map((cat:any)=> (
                <tr key={cat.id}>
                    <td>
                        {editingId === cat.id ? (
                            <input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="border p-1 rounded w-full"
                            />
                        ) : (
                            cat.name
                        )}
                    </td>
                    <td className="flex gap-2 justify-center">
                        {editingId === cat.id ? (
                            <>
                                <button
                                    onClick={() => updateCategory(cat.id)}
                                    className="text-green-600 font-bold"
                                >Enregistrer</button>
                                <button
                                    onClick={() => setEditingId(null)}
                                    className="text-gray-500"
                                >Annuler</button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        setEditingId(cat.id)
                                        setEditingName(cat.name)
                                    }}
                                    className="text-blue-600"
                                >Modifier</button>
                                <button
                                    onClick={() => deleteCategory(cat.id)}
                                    className="text-red-600"
                                >Supprimer</button>
                            </>
                        )}
                    </td>
                </tr>

            ))}
            </tbody>
        </table>
          <section className="mb-12 p-6 border rounded-lg bg-gray-50">
              <h2 className="text-xl font-bold mb-4">Ajouter une catégorie</h2>
              <form onSubmit={addCategory} className="flex gap-4">
                  <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Nom de la catégorie"
                      className="border p-2 rounded flex-1"
                  />
                  <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                      Ajouter
                  </button>
              </form>
              </section>
          <div className="max-w-6xl mx-auto p-4">
              {/* ... Titre et Catégories ... */}

              <h2 className="text-2xl font-bold mt-12 mb-4">Gestion des Annonces</h2>
              <div className="overflow-x-auto shadow-md rounded-lg">
                  <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-100">
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
                              <td className="p-3">
                                  {editingListingId === list.id ? (
                                      <input
                                          className="border p-1 rounded w-full"
                                          value={editForm.title}
                                          onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                      />
                                  ) : (
                                      list.title
                                  )}
                              </td>
                              <td className="p-3">
                                  {editingListingId === list.id ? (
                                      <input
                                          type="number"
                                          className="border p-1 rounded w-24"
                                          value={editForm.pricePerNight}
                                          onChange={(e) => setEditForm({...editForm, pricePerNight: Number(e.target.value)})}
                                      />
                                  ) : (
                                      `${list.pricePerNight}€`
                                  )}
                              </td>
                              <td className="p-3 text-gray-500">
                                  {list.category?.name || "N/A"}
                              </td>
                              <td className="p-3 flex gap-3 justify-center">
                                  {editingListingId === list.id ? (
                                      <>
                                          <button onClick={() => updateListing(list.id)} className="text-green-600 font-bold">Sauver</button>
                                          <button onClick={() => setEditingListingId(null)} className="text-gray-400">Annuler</button>
                                      </>
                                  ) : (
                                      <>
                                          <button
                                              onClick={() => {
                                                  setEditingListingId(list.id)
                                                  setEditForm({ title: list.title, pricePerNight: list.pricePerNight })
                                              }}
                                              className="text-blue-600 hover:underline"
                                          >
                                              Modifier
                                          </button>
                                          <button
                                              onClick={() => deleteListing(list.id)}
                                              className="text-red-600 hover:underline"
                                          >
                                              Supprimer
                                          </button>
                                      </>
                                  )}
                              </td>
                          </tr>
                      ))}
                      </tbody>
                  </table>
              </div>
          </div>
          <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Gestion des Annonces</h2>
              <button
                  onClick={() => setIsAddModalOpen(true)} // 3. Ouverture au clic
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                  + Créer une annonce
              </button>
          </div>
          <AddListingModal
              open={isAddModalOpen}
              onOpenChange={setIsAddModalOpen}
          />

    </div>

            )
}