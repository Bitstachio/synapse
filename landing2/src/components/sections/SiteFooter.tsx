import { motion } from 'framer-motion';

const links = [
  { label: 'Challenge', href: '#challenge' },
  { label: 'Solution', href: '#solution' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'Results', href: '#results' },
  { label: 'Team', href: '#team' },
];

export default function SiteFooter() {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-950 border-t border-white/[.06] relative overflow-hidden">
      {/* Top gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

      <div className="section-container py-16">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-white text-base">Synapse</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Human-Centered AI Assurance Framework — a governance framework and MVP for responsible
              AI adoption.
            </p>
            <p className="text-xs text-slate-600">
              TD Bank Capstone · April 2026
            </p>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-500 mb-4">
              Navigation
            </p>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-500 mb-4">
              Resources
            </p>
            <div className="space-y-3">
              <a
                href="/assets/project-poster.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 card-glass group"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">📄</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">Project Poster</p>
                  <p className="text-xs text-slate-500">C4 6.0 · Team A6</p>
                </div>
                <span className="ml-auto text-slate-600 group-hover:text-slate-400 transition-colors text-xs">↗</span>
              </a>
              <a
                href="/assets/demo-day.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 card-glass group"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">🎤</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white group-hover:text-violet-300 transition-colors">Demo Day Deck</p>
                  <p className="text-xs text-slate-500">Capstone presentation</p>
                </div>
                <span className="ml-auto text-slate-600 group-hover:text-slate-400 transition-colors text-xs">↗</span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Team list */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="border-t border-white/[.06] pt-8"
        >
          <p className="text-xs text-slate-600 text-center mb-3 uppercase tracking-wider">
            Capstone Collective — Authors
          </p>
          <p className="text-xs text-slate-500 text-center">
            Max Catricala · Alessandro Tesa · Natalia Garcia · Amirhossein Mansouri · Barbod Habibi · Rameen Kahloon · Aabrar Raiyan
          </p>
          <p className="text-xs text-slate-700 text-center mt-4">
            © 2026 Synapse Capstone Collective. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
