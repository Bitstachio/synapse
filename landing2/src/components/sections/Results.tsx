import { motion } from 'framer-motion';

const findings = [
  {
    metric: '↓',
    label: 'Navigation Time',
    desc: 'Reduced time spent navigating framework documents',
    color: 'text-green-400',
    bg: 'from-green-500/10 to-emerald-500/5',
    border: 'border-green-500/20',
  },
  {
    metric: '↑',
    label: 'Risk Understanding',
    desc: 'Improved comprehension of AI-related risks and implications',
    color: 'text-blue-400',
    bg: 'from-blue-500/10 to-cyan-500/5',
    border: 'border-blue-500/20',
  },
  {
    metric: '↑',
    label: 'Decision Confidence',
    desc: 'Increased confidence in making compliant, ethical decisions',
    color: 'text-violet-400',
    bg: 'from-violet-500/10 to-purple-500/5',
    border: 'border-violet-500/20',
  },
];

const sdgs = [
  {
    num: '3',
    title: 'Good Health & Well-Being',
    desc: 'Protects employees from AI-caused psychological harm. The framework supports mental health and allows human creativity to continue to flourish.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    dot: 'bg-green-400',
  },
  {
    num: '8',
    title: 'Decent Work & Economic Growth',
    desc: 'The framework must be created and maintained by humans, giving departments like HR the ability to define ethical protections — allowing AI and employees to work side by side.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    dot: 'bg-amber-400',
  },
  {
    num: '9',
    title: 'Industry, Innovation & Infrastructure',
    desc: 'Starting with an ethical framework lets institutions like TD Bank stay ahead of the curve. A modular architecture means the system can scale across departments and industries.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    dot: 'bg-blue-400',
  },
];

export default function Results() {
  return (
    <section id="results" className="section-padding bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-green-400 mb-4">
            Results & Impact
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            What we observed —{' '}
            <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              and why it matters
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Preliminary testing confirmed the approach's effectiveness, with direct alignment to
            three UN Sustainable Development Goals.
          </p>
        </motion.div>

        {/* Findings row */}
        <div className="grid md:grid-cols-3 gap-5 mb-12">
          {findings.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.12, duration: 0.6, ease: "easeOut" }}
              className={`card-glass p-6 bg-gradient-to-br ${f.bg} border ${f.border}`}
            >
              <p className={`text-5xl font-black mb-2 ${f.color}`}>{f.metric}</p>
              <p className="text-lg font-bold text-white mb-1">{f.label}</p>
              <p className="text-sm text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* SDG cards */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: 0.3, duration: 0.65 }}
          className="mb-8"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-6 text-center">
            UN Sustainable Development Goals Alignment
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {sdgs.map((sdg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: 0.4 + i * 0.12, duration: 0.6 }}
                className={`card-glass p-6 ${sdg.bg} border ${sdg.border}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${sdg.bg} border ${sdg.border} flex items-center justify-center`}>
                    <span className={`text-lg font-black ${sdg.color}`}>{sdg.num}</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">SDG {sdg.num}</p>
                    <p className={`text-sm font-bold ${sdg.color}`}>{sdg.title}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{sdg.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
