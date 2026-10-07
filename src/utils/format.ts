export function formatDate(date: string | null) {
  if (!date) return 'No disponible';
  return new Intl.DateTimeFormat('es-ES', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${date}T12:00:00Z`));
}
export function assetUrl(path: string) {
  return /^(https?:\/\/)/.test(path) ? path : `${import.meta.env.BASE_URL}${path}`;
}
