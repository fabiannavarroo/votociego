import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { questions, categories, dataErrors } from '../data';
import config from '../config.json';
import type { Answer, Importance, Progress } from '../types';

const PROGRESS_KEY = 'votociego:progress:v1';
const SETTINGS_KEY = 'votociego:settings:v1';
const emptyProgress = (): Progress => ({ version: config.dataVersion, answers: {}, importance: {}, index: 0, completed: false });
type Theme = 'light' | 'dark' | 'system';
interface Settings { theme: Theme; largeText: boolean }
function readProgress(): { progress: Progress; notice: string } {
  if (dataErrors.length) return { progress: emptyProgress(), notice: '' };
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { progress: emptyProgress(), notice: '' };
    const parsed = JSON.parse(raw) as Progress;
    if (parsed.version !== config.dataVersion) return { progress: emptyProgress(), notice: 'El conjunto de propuestas ha cambiado. Comienza un nuevo cuestionario para comparar los mismos datos.' };
    if (!parsed.answers || typeof parsed.answers !== 'object') throw new Error('Invalid progress');
    const answers = Object.fromEntries(Object.entries(parsed.answers).filter(([id, value]) => questions.some(question => question.id === id) && (value === null || [-2, -1, 0, 1, 2].includes(value))));
    const importance = Object.fromEntries(Object.entries(parsed.importance || {}).filter(([id, value]) => categories.some(category => category.id === id) && [1, 2, 3].includes(value))) as Importance;
    return { progress: { version: config.dataVersion, answers, importance, index: Math.min(Math.max(Number.isInteger(parsed.index) ? parsed.index : 0, 0), Math.max(0, questions.length - 1)), completed: parsed.completed === true && Object.keys(answers).length === questions.length }, notice: '' };
  } catch { return { progress: emptyProgress(), notice: 'No se pudo recuperar el progreso guardado. Puedes comenzar de nuevo; tus respuestas se mantendrán en esta sesión.' }; }
}
function readSettings(): Settings {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return { theme: ['light', 'dark', 'system'].includes(parsed.theme) ? parsed.theme : 'system', largeText: parsed.largeText === true };
  } catch { return { theme: 'system', largeText: false }; }
}
function useStateValue() {
  const [initial] = useState(readProgress);
  const [progress, setProgress] = useState(initial.progress);
  const [notice, setNotice] = useState(initial.notice);
  const [settings, setSettings] = useState(readSettings);
  useEffect(() => {
    if (dataErrors.length) return;
    try {
      if (Object.keys(progress.answers).length || Object.keys(progress.importance).length) localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
      else localStorage.removeItem(PROGRESS_KEY);
    } catch { setNotice('Tu navegador no permite guardar el progreso. Puedes usar el cuestionario, pero las respuestas se perderán al cerrar esta página.'); }
  }, [progress]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => { document.documentElement.dataset.theme = settings.theme === 'system' ? (media.matches ? 'dark' : 'light') : settings.theme; };
    apply(); media.addEventListener('change', apply);
    document.documentElement.classList.toggle('large-text', settings.largeText);
    try { if (settings.theme !== 'system' || settings.largeText) localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); else localStorage.removeItem(SETTINGS_KEY); } catch { /* Preferences remain usable in memory. */ }
    return () => media.removeEventListener('change', apply);
  }, [settings]);
  return {
    progress, settings, notice,
    dismissNotice: () => setNotice(''),
    answer: (id: string, value: Answer) => setProgress(previous => ({ ...previous, answers: { ...previous.answers, [id]: value } })),
    setIndex: (index: number) => setProgress(previous => ({ ...previous, index })),
    finish: () => setProgress(previous => ({ ...previous, completed: true })),
    restart: () => setProgress(emptyProgress()),
    setImportance: (id: string, value: 1 | 2 | 3) => setProgress(previous => ({ ...previous, importance: { ...previous.importance, [id]: value } })),
    setTheme: (theme: Theme) => setSettings(previous => ({ ...previous, theme })),
    toggleLargeText: () => setSettings(previous => ({ ...previous, largeText: !previous.largeText })),
    erase: () => {
      setProgress(emptyProgress()); setSettings({ theme: 'system', largeText: false });
      try { localStorage.removeItem(PROGRESS_KEY); localStorage.removeItem(SETTINGS_KEY); setNotice('Tus respuestas y preferencias se han borrado de este dispositivo.'); }
      catch { setNotice('Las respuestas de esta sesión se han borrado. El navegador impide acceder al almacenamiento; comprueba sus ajustes para eliminar los datos guardados.'); }
    },
  };
}
type AppState = ReturnType<typeof useStateValue>;
const AppContext = createContext<AppState | null>(null);
export function AppProvider({ children }: { children: ReactNode }) { const value = useStateValue(); return <AppContext.Provider value={value}>{children}</AppContext.Provider>; }
export function useAppState() { const state = useContext(AppContext); if (!state) throw new Error('AppProvider no disponible'); return state; }
