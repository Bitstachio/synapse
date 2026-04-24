import { motion } from 'framer-motion';

const pillars = [
  {
    icon: '◇',
    gradient: 'from-blue-500 to-cyan-500',
    title: 'Governance Framework',
    description:
      'Structured assurance ensuring AI developed and used in the organization does not undermine psychological safety, employee autonomy, or compliance expectations.',
    points: ['Human-centered design core', 'Ethical psychological safety', 'Adaptable to any organization'],
  },
  {
    icon: '▣',
    gradient: 'from-violet-500 to-purple-600',
    title: 'Jira-Aligned Plug-in',
    description:
      'Scans each ticket created in Jira against the framework. Any non-compliance is flagged to the user with the specific principle breached - making policy operational inside everyday workflows.',
    points: ['Seamless Jira integration', 'Real-time violation detection', 'Specific breach highlighting'],
  },
];

export default function Solution() {
  return (
    <section id="solution" className="section-padding bg-gray-950 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-400 mb-4">
            Our Solution
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Two pillars.{' '}
            <span className="gradient-text">One coherent system.</span>
          </h2>
          <p className="text-lg text-slate-400">
            An ethical governance framework aligned with employee well-being, privacy, and security - and a
            project-management integration that puts that framework inside the tools teams already use.
          </p>
        </motion.div>

        {/* Two main pillars */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {pillars.map((pillar, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.15, duration: 0.65, ease: "easeOut" }}
              className="card-glass p-8 group"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center text-white text-xl mb-6 shadow-glow-sm group-hover:scale-105 transition-transform duration-300`}
              >
                {pillar.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{pillar.title}</h3>
              <p className="text-slate-400 leading-relaxed mb-6">{pillar.description}</p>
              <ul className="space-y-2">
                {pillar.points.map((point, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>

        {/* MVP card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: 0.3, duration: 0.65, ease: "easeOut" }}
          className="relative card-glass p-8 overflow-hidden"
        >
          {/* Gradient accent bar */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-blue-500 via-violet-500 to-transparent" />
          <div className="md:flex items-center gap-8">
            <div className="flex-1">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-cyan-400 mb-2">
                MVP Experience
              </p>
              <h3 className="text-xl font-bold text-white mb-3">AI-Assisted Decision-Support Website</h3>
              <p className="text-slate-400 leading-relaxed">
                An AI-powered website guides users in real time: identify potential violations, understand
                associated risks, and make informed revisions. Combining structured governance with intuitive
                interaction - transforming static policy documents into dynamic, actionable support.
              </p>
            </div>
            <div className="hidden md:flex gap-4 flex-shrink-0">
              <div className="text-center card-glass p-4 min-w-[100px]">
                <p className="text-2xl font-bold text-cyan-400">↓</p>
                <p className="text-xs text-slate-400 mt-1">Confusion</p>
              </div>
              <div className="text-center card-glass p-4 min-w-[100px]">
                <p className="text-2xl font-bold text-blue-400">↑</p>
                <p className="text-xs text-slate-400 mt-1">Confidence</p>
              </div>
              <div className="text-center card-glass p-4 min-w-[100px]">
                <p className="text-2xl font-bold text-violet-400">↑</p>
                <p className="text-xs text-slate-400 mt-1">Efficiency</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
