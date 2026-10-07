import type { PartyPosition } from '../types';

export function documentedPositionLabel(position: PartyPosition | undefined): string {
  if (position?.conflict) return 'Posturas contradictorias';
  if (position?.position == null) return position?.proposalIds.length ? 'Documentación relacionada' : 'Sin posición documentada';
  const direction = position.position > 0 ? 'A favor' : 'En contra';
  return position.stance === 'conditional' ? `${direction} con condiciones` : direction;
}
