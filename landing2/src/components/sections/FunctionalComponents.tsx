import { motion } from 'framer-motion';

const features = [
  {
    gradient: 'from-red-500 to-orange-500',
    icon: '⚡',
    title: 'Violation Detection Module',
    body: 'Identifies exactly which sections of the framework are violated when a user submits a request. Direct links to relevant sections eliminate the need for manual searching through documentation.',
    highlight: 'Zero manual searching',
  },
  {
    gradient: 'from-blue-500 to-cyan-500',
    icon: '◎',
    title: 'Explanation Engine',
    body: 'Summarizes complex policy sections into concise, plain-language explanations. Reduces cognitive load so users can quickly understand issues without reading lengthy documents.',
    highlight: 'Plain-language summaries',
  },
  {
    gradient: 'from-violet-500 to-purple-600',
    icon: '✦',
    title: 'Suggestion Engine',
    body: 'Provides multiple revision options to help users bring their input into compliance. Transforms a traditionally manual, time-consuming process into an efficient, guided experience.',
    highlight: 'Guided compliance path',
  },
];

export default function FunctionalComponents() {
  return (
    <section className="section-padding bg-gray-950 relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />

      <div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-violet-400 mb-4">
            Functional Components
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            How the system{' '}
            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              helps employees
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Three intelligent modules work together to surface issues, explain them clearly,
            and guide users toward compliant outcomes.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.15, duration: 0.65, ease: "easeOut" }}
              className="card-glass p-8 group flex flex-col"
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white text-2xl mb-6 shadow-glow-sm group-hover:scale-105 transition-transform duration-300`}
              >
                {feature.icon}
              </div>

              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed flex-1">{feature.body}</p>

              {/* Highlight badge */}
              <div className="mt-6 pt-4 border-t border-white/[.06]">
                <span
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r ${feature.gradient} text-white/90`}
                >
                  ✓ {feature.highlight}
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
