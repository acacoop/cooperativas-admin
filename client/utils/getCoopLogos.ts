export interface Logo {
  src: string;
  alt: string;
}

const coopLogos: Logo[] = [
  { src: '/logos/coops/poe2.jpg', alt: 'Cooperativa 1' },
  { src: '/logos/coops/WoW_icon.svg.png', alt: 'Cooperativa 2' },
];

export function getCoopLogos(): Logo[] {
  return coopLogos;
}
