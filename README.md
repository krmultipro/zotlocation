Liste de nos Entités : 

- User
- Listing (table parent)
- HouseListing (table enfant →heritage)
- ApartementListing (table enfant→heritage)
- Booking
- Category
- Profile
- Review
- Image

**Relations de nos Entités :** 

**Relations User** 

**OneToMany → Listing**

*Un utilisateur peut publier plusieurs annonces.*

**OneToMany → Booking**

*Un utilisateur peut effectuer plusieurs réservations.*

**OneToMany → Review**

*Un utilisateur peut écrire plusieurs avis.*

**OneToOne → Profile**

*Un utilisateur possède un seul profil détaillé.*

**ManyToMany → Listing (favoris)**

*Un utilisateur peut avoir plusieurs annonces favorites, et chaque annonce peut être dans les favoris de plusieurs utilisateurs.*

**Relations Listing**

**ManyToOne → User (owner)**

*Chaque annonce appartient à un utilisateur (l’hôte).*

**OneToMany → Image**

*Une annonce possède plusieurs images.*

**OneToMany → Booking**

*Une annonce peut recevoir plusieurs réservations.*

**OneToMany → Review**

*Une annonce peut recevoir plusieurs avis.*

**ManyToMany → Option**

*Chaque annonce peut avoir plusieurs options*

**Relations Booking :**

**ManyToOne → User**

*Plusieurs réservations appartiennent à un même utilisateur.*

**ManyToOne → Listing**

*Plusieurs réservations appartiennent à une même annonce.*

**Relations Image :**

**ManyToOne → Listing**

Plusieurs images appartiennent à une annonce

**Relations Reviews :**

**ManyToOne → User**

Plusieurs avis appartiennent à un utilisateur 

**ManyToOne → Listing**

Plusieurs avis appartiennent à une annonce

**Relations Option :**

**ManyToMany → Listing**

Une option appartient à plusieurs annonces. Une annonce possède plusieurs options.

**Relation Profile**

**OneToOne**

Un utilisateur possède un profil.
