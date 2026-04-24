export default function Hero() {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      aria-label="Hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-950"
    >
      {/* Static ambient glows - CSS only, no JS */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      {/* Dot grid - CSS only */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content - CSS fade-in, no framer-motion */}
      <div className="hero-fade-in relative z-10 section-container pt-24 pb-16 text-center">
        {/* Eyebrow */}
        <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-blue-400 mb-8">
          <span className="w-4 h-px bg-blue-400" />
          TD Bank Capstone · April 2026
          <span className="w-4 h-px bg-blue-400" />
        </p>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.08]">
          Human-Centered{' '}
          <span className="block bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            AI Assurance
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          A governance framework and Jira-integrated MVP that guides employees through responsible
          AI adoption - protecting well-being, privacy, and security in real time.
        </p>

        {/* CTAs - pure CSS hover via .btn-primary / .btn-ghost */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button onClick={() => scrollTo('#solution')} className="btn-primary w-full sm:w-auto">
            Explore the Solution →
          </button>
          <a
            href="/assets/project-poster.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost w-full sm:w-auto"
          >
            View Poster ↗
          </a>
        </div>

        {/* Stats strip */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 mt-16 pt-10 border-t border-white/[.06]">
          {[
            { value: '2', label: 'Core components' },
            { value: '6', label: 'Pipeline steps' },
            { value: '3', label: 'SDGs addressed' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-black bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none" aria-hidden="true">
        <span className="text-xs text-slate-600 tracking-widest uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-slate-600 to-transparent" />
      </div>
    </section>
  );
}
