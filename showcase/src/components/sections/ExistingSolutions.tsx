import { motion } from 'framer-motion';

const limitations = [
  {
    icon: '⚠',
    title: 'Algorithmic Speed Optimization',
    problem: 'Prioritizes short-term efficiency gains, creating institutional fragility.',
    detail:
      'When every second of a worker\'s day is optimized, there is no cognitive room for problem-solving when the system fails. The "human buffer" for crisis and creativity disappears.',
    tag: 'Institutional Fragility',
    tagColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  },
  {
    icon: '👁',
    title: 'Internal AI Surveillance Systems',
    problem: 'Constant monitoring to "ensure safety and productivity."',
    detail:
      "Constant digital surveillance creates profound psychological unsafety. High cost, used as justification for increased monitoring - it backfires into negative effects on employees' psyche.",
    tag: 'Psychological Unsafety',
    tagColor: 'text-red-400 bg-red-400/10 border-red-400/20',
  },
  {
    icon: '🔒',
    title: 'Data Privacy Protections Only',
    problem: 'Addresses macro-level concerns while leaving individual well-being completely exposed.',
    detail:
      'Current approaches protect company assets but ignore how AI affects individual employees day-to-day. The gap between corporate compliance and employee experience remains unaddressed.',
    tag: 'Employee Well-being Gap',
    tagColor: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  },
];

export default function ExistingSolutions() {
  return (
    <section className="section-padding bg-[#080d18] relative overflow-hidden">
      <div
        className="absolute top-0 right-0 w-96 h-96 bg-violet-600/5 rounded-full blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="section-container relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-12 sm:mb-16"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-violet-400 mb-4">
            Existing Solutions
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Current approaches{' '}
            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              leave people behind
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl">
            Most companies take one of two approaches. Both protect the organization - neither protects employees.
          </p>
        </motion.div>

        {/* Cards - single motion wrapper for all three */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6"
        >
          {limitations.map((item, i) => (
            <article key={i} className="card-glass p-6 sm:p-8 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <span className="text-3xl flex-shrink-0">{item.icon}</span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${item.tagColor}`}
                >
                  {item.tag}
                </span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm font-medium text-slate-300 mb-2">{item.problem}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{item.detail}</p>
              </div>
            </article>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-slate-500 text-sm mt-8 sm:mt-10 italic px-4"
        >
          "Although many solutions keep the company and employees 'safe,' the limitations often backfire
          - negatively affecting employees' psyche and leading to distrust."
        </motion.p>
      </div>
    </section>
  );
}
