import * as React from 'react';
import { motion } from 'motion/react';
import { MOTION_DURATION, MOTION_EASE } from '../ui/motion';

const ESSAY_RECORDS = [
  {
    slug: 'systems-of-meaning',
    title: 'Systems of Meaning',
    eyebrow: 'Statement',
    date: '2026',
    readTime: '4 min',
    dek: 'A short operating statement for the archive: memory, performance, and cultural translation as systems rather than isolated works.',
    body: [
      'I build systems for memory, performance, and cultural translation. The work moves across sound, space, code, text, image, and systems because the subject keeps changing scale: a song becomes a public architecture, a building becomes a social protocol, a manuscript becomes a software engine, and a data set becomes a record of cultural pressure.',
      'Systems Choreography names the method behind that movement. It treats space, time, code, narrative, and performance as related structures that can be rehearsed, tuned, and reassembled. The archive is not a neutral container for finished objects. It is a way of showing how the objects think together.',
      'The point is not to make technology look magical. It is to make cultural structure visible: who gets translated, what gets flattened, where memory is stored, and how people build forms of belonging under pressure.',
    ],
  },
  {
    slug: 'localization-gap',
    title: 'The Localization Gap',
    eyebrow: 'AI / Music / Cultural Bias',
    date: '2024',
    readTime: '6 min',
    dek: 'A forensic argument about what generative music systems erase when they treat Arabic music as style instead of structure.',
    body: [
      'The Localization Gap begins from a simple failure: generative music systems can often imitate the surface of Arabic music while missing the systems that make the music culturally legible. Maqam, dialect, ornamentation, tuning behavior, phrasing, and regional memory are compressed into generic global signals.',
      'That failure is not only aesthetic. It is infrastructural. A model that cannot hear cultural specificity cannot preserve it, translate it, or build with it responsibly. The audit treats failed outputs as evidence rather than accidents.',
      'The work compares prompts, outputs, phonetic artifacts, tuning assumptions, and genre defaults to show how computational systems can reproduce colonial listening habits through technical convenience.',
    ],
  },
  {
    slug: 'cost-of-being-queer-and-arab',
    title: 'The Cost of Being Queer and Arab',
    eyebrow: 'Visibility / Risk / Public Culture',
    date: '2020',
    readTime: '5 min',
    dek: 'A public argument about the point where cultural visibility becomes personal, institutional, and physical risk.',
    body: [
      'Visibility is often framed as liberation, but visibility also creates coordinates. It tells institutions, publics, borders, and hostile systems where to look. For queer Arab artists, that contradiction is not theoretical. It is lived as pressure on bodies, families, venues, visas, stages, and futures.',
      'The argument is not against publicness. It is against a simple story of representation that ignores cost. Cultural work can create shelter and danger at the same time. A song can become a home for one person and evidence against another.',
      'This writing sits close to Mashrou’ Leila, but it also points toward later spatial work: if visibility produces risk, then cultural infrastructure has to design for protection, opacity, gathering, and repair.',
    ],
  },
  {
    slug: 'cartography-of-absence',
    title: 'The Cartography of Absence',
    eyebrow: 'Forms / Exile / Bureaucracy',
    date: '2024',
    readTime: '5 min',
    dek: 'Bureaucratic surrealism as a way to document what ordinary institutional language cannot admit.',
    body: [
      'The Cartography of Absence uses administrative language as literary material. Forms, intake sheets, redactions, stamps, and impossible applications become tools for mapping emotional and political conditions that official systems prefer to flatten.',
      'The project is not parody. It is a recognition that bureaucracy already writes fiction onto displaced bodies. It invents categories, imposes timelines, edits names, and asks people to make their pain legible in fields too small to hold it.',
      'By exaggerating those forms only slightly, the work shows the violence already present in the original structure. The page becomes a border, a clinic, an archive, and a stage.',
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
      'Architecture in Low Res argues that the broken image can be more honest than the polished render. For diasporic and post-conflict space, resolution is not just a technical property. It is a political and emotional condition.',
      'The low-resolution image carries fragmentation, distance, partial memory, and infrastructural failure. It refuses the fantasy that architecture can always be represented as clean, complete, and available.',
      'Much of the later work inherits this logic: glitch, decay, degraded documents, unstable scans, and fractured interfaces are not decorative effects. They are structural evidence.',
    ],
  },
  {
    slug: 'why-were-like-this',
    title: "Why We're Like This",
    eyebrow: 'Video Essay / Cultural Mood',
    date: '2026',
    readTime: '4 min',
    dek: 'A scripted essay series about synthetic culture, contemporary psychological weather, and the systems that make people feel unreal.',
    body: [
      "Why We're Like This treats the video essay as a diagnostic instrument. Voice, image, pacing, and performance become a way to read cultural mood at a moment when attention, identity, intimacy, and belief are increasingly mediated by machines.",
      'The work sits between documentary, performance text, audiovisual therapy, and cultural criticism. Its subject is not individual dysfunction, but the systems that make dysfunction feel personal.',
      'In the archive, it becomes one of the clearest bridges between writing, image-making, and interface: an essay that behaves like a sensor.',
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
      className="mobile-safe-panel pointer-events-auto fixed bottom-[112px] left-0 right-0 top-[64px] z-[140] flex overflow-hidden border-y border-white/16 bg-black/86 shadow-2xl backdrop-blur-xl md:left-1/2 md:right-auto md:top-[74px] md:bottom-[108px] md:w-[min(900px,calc(100vw-32px))] md:-translate-x-1/2 md:z-[88] md:border md:border-white/16"
    >
      <div className="grid h-full w-full grid-rows-1 md:grid-cols-[240px_1fr]">
        <aside className={`${isMobileViewport && mobileEssayView === 'reader' ? 'hidden' : 'flex'} min-h-0 flex-col border-ui-border md:flex md:border-r`}>
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
                  <span className="mt-2 block font-display text-base font-bold uppercase leading-none">
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
          className={`${isMobileViewport && mobileEssayView === 'index' ? 'hidden' : 'block'} h-full overflow-y-auto custom-scrollbar md:block`}
        >
          <div className="sticky top-0 z-10 grid grid-cols-3 border-b border-ui-border bg-black/95 md:hidden">
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

          <div className="p-5 md:p-8">
          <div className="mb-7 border-b border-ui-border pb-7">
            <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-accent md:text-[9px] md:tracking-[0.26em]">
              {activeEssay.eyebrow} / {activeEssay.date} / {activeEssay.readTime}
            </p>
            <h3 className="mt-4 font-display text-5xl font-bold uppercase leading-[0.86] tracking-tight text-white md:text-7xl">
              {activeEssay.title}
            </h3>
            <p className="mt-5 max-w-[680px] text-base leading-[1.6] text-white/78 md:text-lg md:leading-[1.6]">
              {activeEssay.dek}
            </p>
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

