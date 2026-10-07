import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowUpRight, Sun, Moon, Monitor, Type, Trash2, Download, ArrowRight } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import config from '../config.json';
import { dataset } from '../data';
import { formatDate } from '../utils/format';
import type { ReactNode } from 'react';
interface InstallPrompt extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
const nav = [{ to: '/test', label: 'Test' }, { to: '/partidos', label: 'Partidos' }, { to: '/resultados', label: 'Resultados' }, { to: '/metodologia', label: 'Metodología' }, { to: '/acerca-de', label: 'Acerca de' }];
export function GitHubLink({ children = <>Ver código en GitHub <ArrowUpRight size={16} aria-hidden="true" /></>, className = 'text-link' }: { children?: ReactNode; className?: string }) {
  return config.githubUrl ? <a href={config.githubUrl} className={className} target="_blank" rel="noopener noreferrer">{children}</a> : <Link to={{pathname:"/acerca-de",hash:"#codigo"}} className={className}>{children}</Link>;
}
export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null);
  const { settings, setTheme, toggleLargeText, erase, notice, dismissNotice, progress } = useAppState();
  const location = useLocation(); const navigate = useNavigate(); const mainRef = useRef<HTMLElement>(null); const menuButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setMenuOpen(false);
    document.title = `${nav.find(item => location.pathname.startsWith(item.to))?.label || (location.pathname === '/' ? 'Tus ideas. Tu criterio.' : 'Explora tus ideas')} · ${config.name}`;
    if (location.hash) { requestAnimationFrame(() => { const target=document.getElementById(location.hash.slice(1)); if(target instanceof HTMLDetailsElement) target.open=true; target?.scrollIntoView(); }); }
    else { window.scrollTo(0, 0); mainRef.current?.focus({ preventScroll: true }); }
  }, [location.pathname, location.hash]);
  useEffect(() => { const handle = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPrompt); }; window.addEventListener('beforeinstallprompt', handle); return () => window.removeEventListener('beforeinstallprompt', handle); }, []);
  async function install() { if (!installPrompt) return; await installPrompt.prompt(); await installPrompt.userChoice; setInstallPrompt(null); }
  function clear() { erase(); navigate('/'); }
  return <>
    <a className="skip-link" href="#main" onClick={event => { event.preventDefault(); mainRef.current?.focus(); mainRef.current?.scrollIntoView(); }}>Saltar al contenido</a>
    <header className="site-header"><div className="nav-shell"><Link to="/" className="brand" aria-label={`${config.name}, inicio`}><span className="brand-icon"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="m8 12 8 10 8-10M12 8h8" /></svg></span>{config.name}<span className="brand-dot">.</span></Link>
      <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label="Navegación principal" id="main-nav" onKeyDown={event => { if (event.key === 'Escape') { setMenuOpen(false); menuButtonRef.current?.focus(); } }}>{nav.map(item => <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>{item.label}</NavLink>)}</nav>
      <div className="nav-actions"><Link className="button primary nav-start" to={progress.completed ? '/resultados' : '/test'}>{progress.completed ? 'Mis resultados' : 'Empezar'}<ArrowRight size={16} aria-hidden="true" /></Link><button ref={menuButtonRef} className="icon-button menu-toggle" onClick={() => setMenuOpen(!menuOpen)} onKeyDown={event => { if (event.key === 'Escape') { setMenuOpen(false); menuButtonRef.current?.focus(); } }} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen} aria-controls="main-nav">{menuOpen ? <X /> : <Menu />}</button></div>
    </div></header>
    {menuOpen && <div className="menu-backdrop" onClick={() => { setMenuOpen(false); menuButtonRef.current?.focus(); }} onKeyDown={event => { if (event.key === 'Escape') { setMenuOpen(false); menuButtonRef.current?.focus(); } }} role="presentation" />}
    <div className="data-strip"><span className="data-dot" aria-hidden="true" />España · Datos comprobados: {formatDate(dataset.lastVerified)} · <Link to="/metodologia">Programas de 2023 y actividad fechada. Convocatoria: {formatDate(dataset.election.date)}.</Link></div>
    {notice && <div className="notice-bar" role="status"><span>{notice}</span><button className="icon-button" onClick={dismissNotice} aria-label="Cerrar aviso"><X size={18} /></button></div>}
    <main id="main" ref={mainRef} tabIndex={-1}><Outlet /></main>
    <footer className="site-footer"><div className="footer-top"><div><Link to="/" className="brand"><span className="brand-icon"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="m8 12 8 10 8-10M12 8h8" /></svg></span>{config.name}<span className="brand-dot">.</span></Link><p>{config.name} es una herramienta independiente para facilitar el acceso y comparación de información política. No está afiliada a ningún partido político y no ofrece recomendaciones de voto.</p></div><nav aria-label="Enlaces del pie"><Link to="/metodologia">Metodología</Link><Link to="/privacidad">Privacidad</Link><Link to="/fuentes">Fuentes</Link><Link to="/admin-data">Estado de los datos</Link><Link to="/candidatos">Candidatos</Link><GitHubLink className="footer-link">GitHub <ArrowUpRight size={14} aria-hidden="true" /></GitHubLink></nav></div>
    <div className="footer-bottom"><span>Hecho para pensar por ti mismo.</span><div className="accessibility-controls"><div className="theme-switch" role="group" aria-label="Apariencia">{([{ value: 'light', title: 'Claro', icon: Sun }, { value: 'dark', title: 'Oscuro', icon: Moon }, { value: 'system', title: 'Sistema', icon: Monitor }] as const).map(({ value, title, icon: Icon }) => <button key={value} onClick={() => setTheme(value)} aria-pressed={settings.theme === value} aria-label={title} title={title}><Icon size={17} aria-hidden="true" /><span>{title}</span></button>)}</div><button className="icon-button" onClick={toggleLargeText} aria-pressed={settings.largeText} aria-label="Aumentar tamaño del texto" title="Aumentar tamaño del texto"><Type size={20} /></button><button className="icon-button" onClick={clear} aria-label="Borrar mis respuestas" title="Borrar mis respuestas"><Trash2 size={18} /></button>{installPrompt && <button className="icon-button" onClick={install} aria-label="Instalar aplicación" title="Instalar aplicación"><Download size={20} /></button>}</div></div></footer>
  </>;
}
