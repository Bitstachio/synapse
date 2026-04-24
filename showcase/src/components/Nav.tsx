import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { label: 'Challenge', href: '#challenge' },
  { label: 'Solution', href: '#solution' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'Results', href: '#results' },
  { label: 'Team', href: '#team' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);

      const sections = NAV_ITEMS.map((item) => item.href.slice(1));
      let current = '';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140) current = id;
        }
      }
      setActive(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-gray-950/90 backdrop-blur-xl border-b border-white/[.06] shadow-[0_4px_30px_rgba(0,0,0,0.6)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 group"
          >
            <div className="h-8 rounded-lg bg-white flex items-center px-1.5 flex-shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
              <img
                src="/assets/synapse-logo.png"
                alt="Synapse logo"
                className="h-5 w-auto object-contain"
                draggable={false}
              />
            </div>
            <span className="font-bold text-white text-base tracking-tight">
              Synapse
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollTo(item.href)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active === item.href.slice(1)
                    ? 'text-white bg-white/[.08]'
                    : 'text-slate-400 hover:text-white hover:bg-white/[.05]'
                }`}
              >
                {item.label}
                {active === item.href.slice(1) && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/assets/project-poster.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200"
            >
              View Poster ↗
            </a>
            <button
              onClick={() => scrollTo('#solution')}
              className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-glow-sm"
            >
              Explore
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 w-6 p-1 text-slate-300 hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span className={`block h-0.5 bg-current transition-transform duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 bg-current transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-current transition-transform duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-gray-950/95 backdrop-blur-xl border-t border-white/[.06] overflow-hidden"
          >
            <nav className="flex flex-col gap-1 p-4" aria-label="Mobile navigation">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollTo(item.href)}
                  className={`px-4 py-3 text-sm font-medium rounded-lg text-left transition-all ${
                    active === item.href.slice(1)
                      ? 'text-white bg-white/[.08]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[.05]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="flex gap-3 pt-2 mt-2 border-t border-white/[.06]">
                <a
                  href="/assets/project-poster.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 text-sm font-medium text-center text-slate-400 hover:text-white border border-white/[.08] rounded-lg transition-colors"
                >
                  View Poster
                </a>
                <button
                  onClick={() => scrollTo('#solution')}
                  className="flex-1 py-3 text-sm font-semibold text-center bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-lg"
                >
                  Explore
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
