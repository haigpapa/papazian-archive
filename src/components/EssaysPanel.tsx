import * as React from 'react';
import { motion } from 'motion/react';
import { MOTION_DURATION, MOTION_EASE } from '../ui/motion';

interface EssayRecord {
  slug: string;
  title: string;
  eyebrow: string;
  date: string;
  readTime?: string;
  dek: string;
  body: string[];
  externalUrl?: string;
}

const ESSAY_RECORDS: EssayRecord[] = [
  {
    slug: 'systems-of-meaning',
    title: 'Systems of Meaning',
    eyebrow: 'Statement',
    date: '2026',
    readTime: '4 min',
    dek: 'A short operating statement for the archive: treating memory, performance, and cultural translation as systems rather than isolated works.',
    body: [
      'My practice moves across sound, space, code, text, and image because the subject constantly changes scale: a song becomes a public architecture, a building becomes a social protocol, a manuscript becomes a software engine, and a data set becomes a record of cultural pressure.',
      'Systems Choreography defines the method behind this movement. It treats space, time, narrative, and performance as related structures to be rehearsed, tuned, and reassembled. The archive is not a neutral container for finished objects; it is a space that reveals how these objects think together.',
      'The objective is not to make technology look magical, but to make cultural structures visible: who gets translated, what gets flattened, where memory is stored, and how forms of belonging are built under pressure.',
    ],
  },
  {
    slug: 'architecture-in-low-res',
    title: 'Architecture in Low Res',
    eyebrow: 'Architecture / Image / Breakdown',
    date: '2015',
    readTime: '5 min',
    dek: 'A foundational thesis on low resolution, ruin, and systemic breakdown as authentic spatial language.',
    body: [
      'Architecture in Low Res posits that the broken image is often more honest than the polished render. In diasporic and post-conflict spaces, resolution is not merely a technical property—it is a political and emotional condition.',
      'The low-resolution image carries fragmentation, distance, partial memory, and infrastructural failure, refusing the fantasy that architecture is always clean, complete, and available.',
      'This logic dictates much of the subsequent work: glitch, decay, degraded documents, unstable scans, and fractured interfaces are never treated as decorative effects. They are structural evidence.',
    ],
  },
  {
    slug: 'localization-gap',
    title: 'The Localization Gap',
    eyebrow: 'AI / Music / Cultural Bias',
    date: '2024',
    readTime: '6 min',
    dek: 'A forensic argument detailing what generative music systems erase when they treat Arabic music as style instead of structure.',
    body: [
      'The Localization Gap begins from a simple failure: generative models can imitate the surface of Arabic music while entirely missing the underlying systems that make it culturally legible. Maqam, dialect, ornamentation, tuning behavior, and regional memory are compressed into generic global signals.',
      'This failure is infrastructural, not just aesthetic. A model that cannot hear cultural specificity cannot preserve, translate, or build with it responsibly. By treating failed outputs as evidence rather than accidents, this audit compares prompts, phonetic artifacts, tuning assumptions, and genre defaults to expose how computational systems reproduce colonial listening habits under the guise of technical convenience.',
    ],
  },
  {
    slug: 'cartography-of-absence',
    title: 'The Cartography of Absence',
    eyebrow: 'Forms / Exile / Bureaucracy',
    date: '2024',
    readTime: '5 min',
    dek: 'Bureaucratic surrealism as a mechanism to document what ordinary institutional language cannot admit.',
    body: [
      'The Cartography of Absence leverages administrative language as literary material. Intake sheets, redactions, stamps, and impossible applications become tools to map emotional and political conditions that official systems prefer to flatten.',
      'This is not parody; it is a recognition that bureaucracy already writes fiction onto displaced bodies. It invents categories, imposes timelines, edits names, and demands that people render their pain legible within fields too small to contain it.',
      'By exaggerating these forms only slightly, the work exposes the inherent violence of the original structures. The page operates simultaneously as a border, a clinic, an archive, and a stage.',
    ],
  },
  {
    slug: 'why-were-like-this',
    title: "Why We're Like This",
    eyebrow: 'Video Essay / Cultural Mood',
    date: '2026',
    readTime: '4 min',
    dek: 'A scripted essay series examining synthetic culture, contemporary psychological weather, and the systems that make people feel unreal.',
    body: [
      "Why We're Like This utilizes the video essay as a diagnostic instrument. Voice, image, pacing, and performance become methods to read the cultural mood at a moment when attention, identity, intimacy, and belief are heavily mediated by machines.",
      'Operating at the intersection of documentary, performance text, audiovisual therapy, and cultural criticism, its subject is not individual dysfunction, but the systems that make dysfunction feel intensely personal. Within the archive, it serves as a critical bridge between writing, image-making, and interface—an essay that behaves like a sensor.',
    ],
  },
  {
    slug: 'cost-of-being-queer-and-arab',
    title: 'The Cost of Being Queer and Arab',
    eyebrow: 'Visibility / Risk / Public Culture',
    date: '2020',
    readTime: '5 min',
    dek: 'An examination of the threshold where cultural visibility becomes personal, institutional, and physical risk.',
    body: [
      'Visibility is often framed as liberation, but it also establishes coordinates. It dictates where institutions, borders, and hostile systems should look. For queer Arab artists, this contradiction is not theoretical—it is a lived pressure exerted on bodies, families, visas, and futures.',
      'This is not an argument against publicness, but a rejection of a simplified narrative of representation that ignores its cost. Cultural work creates shelter and danger simultaneously: a song can act as a home for one person and as evidence against another.',
      'While this text is deeply rooted in the context of Mashrou’ Leila, it maps the trajectory for subsequent spatial work: if visibility produces risk, cultural infrastructure must be designed for protection, opacity, and repair.',
    ],
    externalUrl: 'https://www.nytimes.com/2020/07/16/opinion/culture/mashrou-leila-fan-suicide.html',
  },
  {
    slug: 'my-band-was-silenced',
    title: 'My Band Was Silenced in the Middle East. But a Global Queer Community Gives Me Strength',
    eyebrow: 'The Guardian',
    date: '2022',
    readTime: '5 min',
    dek: 'A personal account of exile, burnout, and the search for refuge.',
    body: [
      'This op-ed traces the emotional aftermath of displacement—exacerbated by the pandemic and Lebanon’s economic collapse—and the isolation of losing a familiar support system. Rather than ending in despair, it frames the global queer community and shared cultural rituals, like the Armenian andouni lament, as the vital infrastructure for collective survival and healing.',
    ],
    externalUrl: 'https://www.theguardian.com/music/2022/jun/22/my-band-was-silenced-in-the-middle-east-but-a-global-queer-community-gives-me-strength',
  },
  {
    slug: 'beyrouth-et-beyrouth',
    title: 'Beyrouth et Beyrouth, travail en cours',
    eyebrow: 'France Culture',
    date: '2020',
    readTime: '4 min',
    dek: 'A love letter and a lament to a city shattered.',
    body: [
      'Written in the immediate wake of the August 4th port explosion, this essay navigates the profound disorientation of witnessing the destruction of a hometown from afar. It rejects the romanticized “phoenix” myth of endless resilience, asking instead what happens when a culture refuses to endlessly rebuild the past and demands a more just, unburdened future.',
    ],
    externalUrl: 'https://www.radiofrance.fr/franceculture/haig-papazian-beyrouth-et-beyrouth-travail-en-cours-6588833',
  },
  {
    slug: 'the-weather-rehearsal',
    title: 'The Weather Rehearsal',
    eyebrow: 'Installation / Generative Audio',
    date: '2026',
    readTime: '3 min',
    dek: 'An environmental data installation that translates live meteorological telemetry into a continuous microtonal violin score.',
    body: [
      'The Weather Rehearsal operates as a generative audio engine built on Tone.js, converting real-time atmospheric data into precise sonic instructions. By mapping fluctuating environmental parameters directly to a microtonal framework, the system replaces traditional compositional control with automated, climate-driven logic.',
      'The project approaches sonification not as a passive data display, but as an active, ongoing performance. It treats local weather patterns as a structural score, framing the environment itself as a system continuously rehearsing its own conditions.',
    ],
  },
  {
    slug: 'sometimes-i-wake-up-elsewhere',
    title: 'Sometimes I Wake Up Elsewhere',
    eyebrow: 'Autofiction / Dream Cycle',
    date: '2026',
    dek: 'A modular literary manuscript structured as a 100-entry non-linear dream cycle.',
    body: [
      'The narrative maps the disorienting themes of exile, memory, and fractured identity. To ground the shifting coordinates and surreal logic of the text, the story relies on the presence of two real-world anchors—a dachshund named Griffin and a black cat named Beau—who provide emotional continuity amidst the displacement.',
    ],
  },
  {
    slug: 'lilly-and-the-bird-that-grew',
    title: 'Lilly and the Bird That Grew',
    eyebrow: 'Fable / Animation',
    date: '2026',
    dek: 'A 32-page surreal fabled picture book and multimedia animation proposal.',
    body: [
      'The work establishes its own distinct visual positioning and thematic rules, functioning simultaneously as a standalone narrative and a blueprint for dynamic visual storytelling.',
    ],
  },
];

interface EssaysPanelProps {
  isMobileViewport: boolean;
  onEssayChange?: (slug: string) => void;
}

export default function EssaysPanel({ isMobileViewport, onEssayChange }: EssaysPanelProps) {
  const [activeEssaySlug, setActiveEssaySlug] = React.useState(ESSAY_RECORDS[0].slug);
  const [mobileEssayView, setMobileEssayView] = React.useState<'index' | 'reader'>('index');
  const readerScrollRef = React.useRef<HTMLElement>(null);
  const activeEssay = ESSAY_RECORDS.find((essay) => essay.slug === activeEssaySlug) || ESSAY_RECORDS[0];
  const activeIndex = ESSAY_RECORDS.findIndex((essay) => essay.slug === activeEssay.slug);
  
  React.useEffect(() => {
    onEssayChange?.(ESSAY_RECORDS[0].slug);
  }, []);

  const selectEssay = (slug: string) => {
    setActiveEssaySlug(slug);
    if (isMobileViewport) setMobileEssayView('reader');
    onEssayChange?.(slug);
  };
  const stepEssay = (direction: -1 | 1) => {
    const nextEssay = ESSAY_RECORDS[(activeIndex + direction + ESSAY_RECORDS.length) % ESSAY_RECORDS.length];
    setActiveEssaySlug(nextEssay.slug);
    setMobileEssayView('reader');
    onEssayChange?.(nextEssay.slug);
  };

  React.useEffect(() => {
    if (isMobileViewport) {
      setMobileEssayView('index');
    }
  }, [isMobileViewport]);

  React.useEffect(() => {
    readerScrollRef.current?.scrollTo({ top: 0 });
  }, [activeEssay.slug, mobileEssayView]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.99 }}
      transition={{ duration: MOTION_DURATION.slow, ease: MOTION_EASE }}
      className={`essays-panel ${isMobileViewport ? 'essays-panel--mobile' : 'essays-panel--desktop'} mobile-safe-panel pointer-events-auto fixed bottom-[112px] left-0 right-0 top-[64px] z-[140] flex overflow-hidden border-y border-white/16 bg-black/86 shadow-2xl backdrop-blur-xl md:left-1/2 md:right-auto md:top-[74px] md:bottom-[108px] md:w-[min(900px,calc(100vw-32px))] md:-translate-x-1/2 md:z-[88] md:border md:border-white/16`}
    >
      <div className="essays-panel__layout grid h-full w-full grid-rows-1 md:grid-cols-[240px_1fr]">
        <aside className={`essays-panel__index ${isMobileViewport && mobileEssayView === 'reader' ? 'hidden' : 'flex'} min-h-0 flex-col border-ui-border md:flex md:border-r`}>
          <div className="border-b border-ui-border p-4 md:p-5">
            <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-accent md:text-[9px] md:tracking-[0.28em]">
              Essays / Writings
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase leading-[0.9] text-white md:text-4xl">
              Reading<br />Panel
            </h2>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3 md:block md:p-0">
            {ESSAY_RECORDS.map((essay, index) => {
              const active = essay.slug === activeEssay.slug;
              return (
                <button
                  key={essay.slug}
                  type="button"
                  onClick={() => selectEssay(essay.slug)}
                  className={`mb-2 w-full border border-ui-border border-l-2 p-3 text-left transition-all last:mb-0 md:mb-0 md:border-t-0 md:border-r-0 md:border-b md:border-l-2 ${
                    active
                      ? 'bg-accent/15 border-accent text-white'
                      : 'bg-white/[0.025] border-transparent text-white hover:bg-white/8 hover:border-l-white/40'
                  }`}
                >
                  <span className={`font-mono text-[11px] uppercase tracking-[0.16em] md:text-[8px] md:tracking-[0.18em] ${active ? 'text-accent-2 font-semibold' : 'text-accent'}`}>
                    {String(index + 1).padStart(2, '0')} / {essay.date}
                  </span>
                  <span className="mt-2 line-clamp-2 font-display text-base font-bold uppercase leading-none">
                    {essay.title}
                  </span>
                  <span className={`mt-2 block truncate font-mono text-[8px] uppercase tracking-[0.14em] ${active ? 'text-white/70' : 'text-text-muted'}`}>
                    {essay.eyebrow}
                  </span>
                  <span className={`mt-3 block text-xs leading-relaxed md:hidden ${active ? 'text-white/60' : 'text-text-muted'}`}>
                    {essay.dek}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <article
          ref={readerScrollRef}
          className={`essays-panel__reader ${isMobileViewport && mobileEssayView === 'index' ? 'hidden' : 'block'} h-full overflow-y-auto custom-scrollbar md:block`}
        >
          <div className="essays-panel__mobile-nav sticky top-0 z-10 grid grid-cols-3 border-b border-ui-border bg-black/95 md:hidden">
            <button
              type="button"
              onClick={() => setMobileEssayView('index')}
              className="min-h-[44px] border-r border-ui-border px-3 py-3 text-left font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted transition-colors hover:bg-ui-bg hover:text-white"
            >
              Return
            </button>
            <button
              type="button"
              onClick={() => stepEssay(-1)}
              className="min-h-[44px] border-r border-ui-border px-3 py-3 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted transition-colors hover:bg-ui-bg hover:text-white"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => stepEssay(1)}
              className="min-h-[44px] px-3 py-3 text-right font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted transition-colors hover:bg-ui-bg hover:text-white"
            >
              Next
            </button>
          </div>

          <div className="essays-panel__body p-5 md:p-8">
          <div className="mb-7 border-b border-ui-border pb-7">
            <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-accent md:text-[9px] md:tracking-[0.26em]">
              {[activeEssay.eyebrow, activeEssay.date, activeEssay.readTime].filter(Boolean).join(' / ')}
            </p>
            <h3 className="essays-panel__title mt-4 font-display text-5xl font-bold uppercase leading-[0.86] tracking-tight text-white md:text-7xl">
              {activeEssay.title}
            </h3>
            <p className="mt-5 max-w-[680px] text-base leading-[1.6] text-white/78 md:text-lg md:leading-[1.6]">
              {activeEssay.dek}
            </p>
            {activeEssay.externalUrl && (
              <a
                href={activeEssay.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex min-h-[44px] items-center border border-ui-border px-4 font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted transition-colors hover:border-ui-border-hover hover:bg-ui-bg hover:text-white"
              >
                Read original ↗
              </a>
            )}
          </div>

          <div className="space-y-5">
            {activeEssay.body.map((paragraph) => (
              <p key={paragraph} className="max-w-[680px] text-[15px] leading-[1.7] text-[#dddddd] font-body">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-10 hidden grid-cols-2 border border-ui-border md:grid">
            <button
              type="button"
              onClick={() => stepEssay(-1)}
              className="border-r border-ui-border px-5 py-4 text-left transition-colors hover:bg-ui-bg group"
            >
              <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-text-muted group-hover:text-white transition-colors">
                ← PREVIOUS
              </span>
              <span className="mt-1.5 block font-display text-xs font-bold uppercase tracking-wide text-white/50 group-hover:text-white transition-colors truncate">
                {ESSAY_RECORDS[(activeIndex - 1 + ESSAY_RECORDS.length) % ESSAY_RECORDS.length].title}
              </span>
            </button>
            <button
              type="button"
              onClick={() => stepEssay(1)}
              className="px-5 py-4 text-right transition-colors hover:bg-ui-bg group"
            >
              <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-text-muted group-hover:text-white transition-colors">
                NEXT →
              </span>
              <span className="mt-1.5 block font-display text-xs font-bold uppercase tracking-wide text-white/50 group-hover:text-white transition-colors truncate">
                {ESSAY_RECORDS[(activeIndex + 1) % ESSAY_RECORDS.length].title}
              </span>
            </button>
          </div>
          </div>
        </article>
      </div>
    </motion.section>
  );
}
