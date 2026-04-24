import { motion } from 'framer-motion';

const principles = [
  {
    icon: '👤',
    title: 'Human-Centered Design',
    desc: 'Prioritizing usability and clarity for employees above all else — designed for real people in real workflows.',
  },
  {
    icon: '🔍',
    title: 'Transparency',
    desc: "Ensuring users understand why decisions are made — not just what is flagged, but the reasoning behind every violation.",
  },
  {
    icon: '⚡',
    title: 'Efficiency',
    desc: 'Reducing the time and effort required to interpret complex policies — turning minutes of searching into seconds of guidance.',
  },
  {
    icon: '🤝',
    title: 'Trust',
    desc: 'Building employee confidence in AI systems through consistent, accurate guidance and support — not surveillance.',
  },
];

export default function Principles() {
  return (
    <section className="section-padding bg-[#080d18] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-blue-600/8 rounded-full blur-[80px]" />
      </div>

      <div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-400 mb-4">
            Design Philosophy
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Compliance through{' '}
            <span className="gradient-text">informed choice</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Not surveillance-only enforcement. Rather than restricting behavior, the system enables
            employees to make informed, ethical decisions.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {principles.map((principle, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
              className="card-glass p-6 text-center group"
            >
              <span className="text-3xl block mb-4 group-hover:scale-110 transition-transform duration-300">
                {principle.icon}
              </span>
              <h3 className="text-base font-bold text-white mb-2">{principle.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{principle.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center mt-12"
        >
          <p className="text-slate-500 italic text-sm max-w-xl mx-auto">
            "A key insight: employees value clarity, guidance, and support over rigid control mechanisms.
            They benefit from understanding <em>why</em> actions may be problematic and <em>how</em> to improve them."
          </p>
        </motion.div>
      </div>
    </section>
  );
}
