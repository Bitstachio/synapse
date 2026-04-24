import { motion } from 'framer-motion';

const steps = [
  {
    num: 1,
    title: 'User Input Interface',
    desc: 'Employee submits a request or ticket via the web portal or Jira.',
    color: 'from-blue-500 to-cyan-500',
    icon: '⌨',
  },
  {
    num: 2,
    title: 'Framework Validation',
    desc: 'The rules engine checks the input against all framework principles.',
    color: 'from-cyan-500 to-teal-500',
    icon: '⚙',
  },
  {
    num: 3,
    title: 'Violation Detection',
    desc: 'Identifies specific sections of the framework that are breached.',
    color: 'from-teal-500 to-green-500',
    icon: '🔍',
  },
  {
    num: 4,
    title: 'Explanation Engine',
    desc: 'Summarizes complex policy into plain, concise explanations.',
    color: 'from-violet-500 to-purple-500',
    icon: '💡',
  },
  {
    num: 5,
    title: 'Suggestion Engine',
    desc: 'Generates multiple revision options to bring input into compliance.',
    color: 'from-purple-500 to-pink-500',
    icon: '✦',
  },
  {
    num: 6,
    title: 'Feedback Interface',
    desc: 'Employee reviews suggestions, revises, and resubmits - closing the loop.',
    color: 'from-pink-500 to-rose-500',
    icon: '↩',
  },
];

export default function Architecture() {
  return (
    <section id="architecture" className="section-padding bg-[#080d18] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent pointer-events-none" />

      <div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-400 mb-4">
            System Architecture
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            A modular{' '}
            <span className="gradient-text">6-step pipeline</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            From user input to compliant, understandable output - every step designed to reduce
            cognitive load and support informed decision-making.
          </p>
        </motion.div>

        {/* Pipeline grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                delay: i * 0.1,
                duration: 0.55,
                ease: "easeOut",
              }}
              className="relative card-glass p-6 group overflow-hidden"
            >
              {/* Step number background watermark */}
              <div className="absolute -bottom-2 -right-2 text-8xl font-black text-white/[.02] leading-none select-none group-hover:text-white/[.04] transition-colors">
                {step.num}
              </div>

              {/* Gradient icon circle */}
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white text-lg mb-5 shadow-glow-sm group-hover:scale-110 transition-transform duration-300`}
              >
                {step.icon}
              </div>

              {/* Step number pill */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${step.color} text-white`}
                >
                  Step {step.num}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>

              {/* Connector arrow (not last in row) */}
              {i < 5 && (i + 1) % 3 !== 0 && (
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 text-slate-600 text-lg hidden lg:block z-10">
                  →
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Flow label */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="text-center text-slate-600 text-sm mt-10"
        >
          Input → Validation → Detection → Explanation → Suggestion → Feedback
        </motion.p>
      </div>
    </section>
  );
}
