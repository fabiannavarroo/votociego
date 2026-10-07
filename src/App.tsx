import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import ErrorBoundary from './components/ErrorBoundary';
import { EmptyState } from './components/ui';
import { dataErrors } from './data';
const Results = lazy(() => import('./pages/Results'));
const Compare = lazy(() => import('./pages/Compare'));
const Reveal = lazy(() => import('./pages/Reveal'));
const Candidates = lazy(() => import('./pages/Candidates'));
const Parties = lazy(() => import('./pages/Parties').then(module => ({ default: module.Parties })));
const PartyDetail = lazy(() => import('./pages/Parties').then(module => ({ default: module.PartyDetail })));
const Methodology = lazy(() => import('./pages/Information').then(module => ({ default: module.Methodology })));
const Privacy = lazy(() => import('./pages/Information').then(module => ({ default: module.Privacy })));
const Sources = lazy(() => import('./pages/Information').then(module => ({ default: module.Sources })));
const About = lazy(() => import('./pages/Information').then(module => ({ default: module.About })));
const AdminData = lazy(() => import('./pages/AdminData'));
export default function App() {
  if (dataErrors.length) return <main className="container page"><h1>El conjunto de datos necesita revisión</h1><p>No se muestran comparaciones para evitar resultados incorrectos.</p><ul>{dataErrors.map(error => <li key={error}>{error}</li>)}</ul></main>;
  return <ErrorBoundary><Suspense fallback={<div className="loading-state" role="status"><span className="loading-spinner" aria-hidden="true" />Preparando tus ideas…</div>}><Routes><Route element={<Layout />}><Route index element={<Home />} /><Route path="test" element={<Quiz />} /><Route path="resultados" element={<Results />} /><Route path="comparar" element={<Compare />} /><Route path="partidos" element={<Parties />} /><Route path="partidos/:slug" element={<PartyDetail />} /><Route path="revelacion" element={<Reveal />} /><Route path="candidatos" element={<Candidates />} /><Route path="metodologia" element={<Methodology />} /><Route path="privacidad" element={<Privacy />} /><Route path="fuentes" element={<Sources />} /><Route path="admin-data" element={<AdminData />} /><Route path="acerca-de" element={<About />} /><Route path="*" element={<div className="container page"><EmptyState headingLevel={1} title="Esta página se ha perdido en el mapa" text="La dirección no corresponde a una sección disponible. Vuelve al inicio para seguir explorando." action="Volver al inicio" to="/" /></div>} /></Route></Routes></Suspense></ErrorBoundary>;
}
