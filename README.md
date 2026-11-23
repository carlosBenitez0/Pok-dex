# Pokédex Advance

Pokédex de las 1025 especies hecha con React, Vite y Tailwind. La ficha de cada Pokémon se muestra dentro de una Game Boy Advance en 3D (React Three Fiber, animada con GSAP).

## Funciones

- **Lista:** las 1025 especies con scroll infinito, pestañas por generación, filtro de hasta 2 tipos, orden por número, nombre, total de stats, peso o altura, y filtro de favoritos.
- **Buscador:** autocompletado por nombre, número o tipo (en español o inglés). `/` enfoca el buscador y Enter abre la primera sugerencia.
- **Favoritos, equipo y comparador:** se guardan en el navegador (`localStorage`), sin backend ni base de datos.
  - **Equipo (`/equipo`):** tabla defensiva, cobertura ofensiva por STAB, aviso de tipos peligrosos y stats medias.
  - **Comparador (`/comparar`):** dos Pokémon lado a lado con sus stats y los multiplicadores de tipo entre ellos.
- **Ficha GBA (`/pokemon/:id`):** 7 pestañas (info, stats, datos, movimientos con tipo y potencia, evolución, tipos y dónde encontrarlo).
  - Formas regionales, Mega y Gigamax.
  - Sprites de Rojo Fuego/Verde Hoja, Rubí/Zafiro, Esmeralda o modernos.
  - Sonidos sintetizados y 5 colores de carcasa.
  - Se controla con teclado, ratón o el mando táctil.
- **Idioma:** español e inglés.
- **PWA:** se puede instalar y funciona sin conexión.

## Datos

La lista no consulta ninguna API: usa `src/data/pokedex.json` y `src/data/moves.json`, que genera una sola vez el script `npm run data` a partir de PokéAPI y que están versionados en el repositorio. Solo la ficha de la GBA pide a PokéAPI los textos de la Pokédex, la cadena evolutiva y las zonas donde aparece. El service worker guarda esas respuestas en caché para poder verlas sin conexión.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (incluye el service worker con la lista de archivos a precachear) |
| `npm run preview` | Sirve el build |
| `npm test` | Tests (Vitest) de filtros, búsqueda, tabla de tipos y cobertura del equipo |
| `npm run lint` | ESLint |
| `npm run data` | Regenera los datos estáticos desde PokéAPI |

## Despliegue

Es una SPA: el servidor tiene que devolver `index.html` en cualquier ruta (por ejemplo, con `rewrites` en Vercel o el fallback de Netlify).
