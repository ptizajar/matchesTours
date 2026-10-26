// import { useState } from 'react';

// // Избранные матчи (по id). Хранятся только в памяти, пока открыто приложение.
// export function useFavorites() {
//   const [favorites, setFavorites] = useState<string[]>([]);

//   const isFavorite = (id: string) => Boolean(favorites.indexOf(id));

//   const toggle = (id: string) => {
//     const index = favorites.indexOf(id);
//     if (index === -1) {
//       favorites.push(id);
//     } else {
//       favorites.splice(index, 1);
//     }
//     setFavorites(favorites);
//   };

//   return { favorites, isFavorite, toggle };
// }



import { useState } from 'react';

// Избранные матчи (по id). Хранятся только в памяти, пока открыто приложение.
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  const isFavorite = (id: string) => favorites.includes(id);

  const toggle = (id: string) => {
    setFavorites((currentFavorites) =>
      currentFavorites.includes(id)
        ? currentFavorites.filter((favoriteId) => favoriteId !== id)
        : [...currentFavorites, id]
    );
  };

  return { favorites, isFavorite, toggle };
}
