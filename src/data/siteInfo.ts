export type SiteInfoTabId = 'about' | 'contact' | 'news' | 'colophon';

export interface SiteInfoTab {
  id: SiteInfoTabId;
  label: string;
  eyebrow: string;
  title: string;
  body: string[];
  links?: Array<{
    label: string;
    href: string;
    note?: string;
  }>;
  entries?: Array<{
    date: string;
    title: string;
    text: string;
  }>;
}

export const SITE_INFO_TABS: SiteInfoTab[] = [
  {
    id: 'about',
    label: 'About',
    eyebrow: 'Practice',
    title: 'Systems Choreography',
    body: [
      'Haig Papazian works across music, architecture, software, performance, and cultural infrastructure.',
      'This archive is organized as a spatial index of systems: bands as institutions, buildings as protocols, instruments as memory engines, and software as a way of moving through complexity.',
      'The portfolio is intentionally not a conventional case-study stack. It is a navigable field of works, fragments, relations, and chambers.',
    ],
  },
  {
    id: 'contact',
    label: 'Contact',
    eyebrow: 'Signal',
    title: 'Contact / Collaboration',
    body: [
      'For commissions, residencies, collaborations, talks, and research conversations, use the primary email below.',
    ],
    links: [
      { label: 'Email', href: 'mailto:info@papazian.studio', note: 'info@papazian.studio' },
      { label: 'Instagram', href: 'https://instagram.com/haigpapa', note: '@haigpapa' },
    ],
  },
  {
    id: 'news',
    label: 'News',
    eyebrow: 'Updates',
    title: 'Current Signals',
    body: [
      'A compact update log for launches, performances, publications, and project milestones.',
    ],
    entries: [
      {
        date: '2026',
        title: 'Spatial Archive launched',
        text: 'The portfolio is live as a navigable spatial archive with project rails, atlas views, cinematic essays, and a curated works spine.',
      },
      {
        date: '2026',
        title: 'MEKENA NYC',
        text: 'Cultural infrastructure project in Queens moving through documentation and public positioning.',
      },
      {
        date: '2025-26',
        title: 'DERIVE / HAH-WAS / TEBR',
        text: 'AI music, memory, and cultural-specificity systems moving toward publication and demonstration.',
      },
    ],
  },
  {
    id: 'colophon',
    label: 'More',
    eyebrow: 'Colophon',
    title: 'Archive Notes',
    body: [
      'Built as a React, Vite, and Three.js spatial interface.',
      'Project writing lives in repo-local markdown and CSV files. Images are organized by project folder and prepared as WebP where possible.',
      'Typography set in Cabinet Grotesk, Satoshi, and JetBrains Mono via Fontshare. Spatial engine renders 120 works across five navigable modes.',
    ],
  },
];
