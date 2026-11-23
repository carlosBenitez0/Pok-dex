import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./best-css-reset.css";
import "./App.css";
import "./index.css";
import HomePage from "./pages/HomePage";
import { Loader } from "./components/Loader";
import { LangProvider } from "./i18n";
import { registerServiceWorker } from "./pwa";

// three / R3F / GSAP solo se descargan al abrir el detalle.
const PokemonDetailPage = lazy(() => import("./pages/PokemonDetailPage"));
const TeamPage = lazy(() => import("./pages/TeamPage"));
const ComparePage = lazy(() => import("./pages/ComparePage"));

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
    (theme === null && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.getElementById("root")?.classList.toggle("dark", dark);
};
applyInitialTheme();

const page = (node: React.ReactNode, dark = false) => (
  <Suspense
    fallback={
      <div className={`flex min-h-screen items-center justify-center ${dark ? "bg-[#0e1217]" : "bg-slate-100 dark:bg-[#0e1217]"}`}>
        <Loader />
      </div>
    }
  >
    {node}
  </Suspense>
);

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/pokemon/:id", element: page(<PokemonDetailPage />, true) },
  { path: "/equipo", element: page(<TeamPage />) },
  { path: "/comparar", element: page(<ComparePage />) },
  { path: "*", element: <HomePage /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LangProvider>
      <RouterProvider router={router} />
    </LangProvider>
  </StrictMode>,
);

registerServiceWorker();
