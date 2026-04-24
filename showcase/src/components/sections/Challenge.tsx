import { motion } from 'framer-motion';
import type { Transition } from 'framer-motion';

const t: Transition = { duration: 0.6, ease: 'easeOut' };

const stats = [
  { value: '73%', label: 'of employees report AI uncertainty impairs daily decisions' },
  { value: '2×', label: 'institutional risk when workforce lacks AI clarity' },
  { value: '$0', label: 'existing tools address individual employee well-being' },
];

export default function Challenge() {
  return (
    <section id="challenge" className="section-padding bg-gray-950 relative overflow-hidden">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="section-container relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={t}
          className="max-w-3xl"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-400 mb-4">
            The Challenge
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
            AI is reshaping work.<br />
            <span className="gradient-text">The human layer is exposed.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            The rapid integration of AI into workplaces - especially in regulated industries like banking - creates
            a fundamental tension. While AI promises efficiency and innovation, its adoption also introduces
            serious threats to employee well-being, privacy, and security.
          </p>
        </motion.div>

        {/* Pullquote */}
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ ...t, delay: 0.1 }}
          className="relative border-l-2 border-blue-500 pl-6 sm:pl-8 py-4 my-10 sm:my-12 max-w-4xl"
        >
          <div className="absolute -left-1 top-4 w-2 h-2 rounded-full bg-blue-500" />
          <p className="text-lg sm:text-xl md:text-2xl font-medium text-slate-200 leading-relaxed italic">
            "Employees often lack the clarity, confidence, and trust they need to use AI tools
            responsibly every day - creating inefficiency and institutional risk, not just missed opportunity."
          </p>
          <cite className="mt-3 block text-sm text-slate-500 not-italic">TD Bank engagement finding</cite>
        </motion.blockquote>

        {/* Two-column context */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ ...t, delay: 0.15 }}
          className="grid sm:grid-cols-2 gap-5 sm:gap-8"
        >
          <div className="card-glass p-6 sm:p-8">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3">The Micro-Alignment Gap</h3>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Most AI safety frameworks focus on macro-level concerns: data privacy and algorithmic bias.
              But there is a critical gap at the individual level - how AI directly touches each employee's
              autonomy, psychological safety, and day-to-day decision-making.
            </p>
          </div>
          <div className="card-glass p-6 sm:p-8">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3">TD Bank's Position</h3>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              TD Bank prioritizes a human-centric culture and cannot afford to compromise it with AI
              adoption - yet in a fast-moving world, standing still means falling behind. They engaged
              our team to find a path forward that protects people without blocking progress.
            </p>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ ...t, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12"
        >
          {stats.map((stat) => (
            <div key={stat.value} className="text-center card-glass p-5 sm:p-6">
              <p className="text-3xl sm:text-4xl font-bold gradient-text mb-2">{stat.value}</p>
              <p className="text-xs sm:text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
