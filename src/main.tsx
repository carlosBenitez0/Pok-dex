import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./best-css-reset.css";
import "./App.css";
import "./index.css";
import HomePage from "./pages/HomePage";
import { Loader } from "./components/Loader";

// three / R3F / GSAP solo se descargan al abrir el detalle.
const PokemonDetailPage = lazy(() => import("./pages/PokemonDetailPage"));

// Aplica el tema antes del primer render (también al entrar directo a /pokemon/:id).
const applyInitialTheme = () => {
  let theme: string | null = null;
  try {
    theme = window.localStorage.getItem("theme");
  } catch {
    /* storage no disponible */
  }
  const dark =
    theme === "dark" ||
    (theme === null &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.getElementById("root")?.classList.toggle("dark", dark);
};
applyInitialTheme();

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  {
    path: "/pokemon/:id",
    element: (
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[#0e1217]">
            <Loader label="Encendiendo la consola…" />
          </div>
        }
      >
        <PokemonDetailPage />
      </Suspense>
    ),
  },
  { path: "*", element: <HomePage /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
