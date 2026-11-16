export function tripResultKm(currentKm: number, distanceKm: number): number {
  return Math.max(currentKm, Math.round(currentKm + distanceKm));
}
