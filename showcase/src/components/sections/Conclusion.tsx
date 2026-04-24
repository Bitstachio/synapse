import { motion } from 'framer-motion';

const futureWork = [
  'Enhance the suggestion engine to better capture contextual nuances of specific user requests',
  'Further redesign the interface to reduce complexity and improve usability',
  'Expand violation detection modules to cover a wider array of emerging global AI regulations',
  'Extend to healthcare, education, and other high-stakes domains undergoing digital transformation',
];

export default function Conclusion() {
  return (
    <section id="conclusion" className="section-padding bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/8 rounded-full blur-[100px]" />
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
            Conclusion
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Transparency and guidance{' '}
            <span className="gradient-text">scale better than surveillance</span>
          </h2>
        </motion.div>

        {/* Key takeaway */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: 0.15, duration: 0.65 }}
          className="relative card-glass p-10 mb-10 max-w-4xl mx-auto overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

          <p className="text-xl md:text-2xl text-slate-200 leading-relaxed text-center font-medium mb-6">
            This project addresses the <span className="gradient-text font-bold">micro-alignment gap</span> —
            how emerging technologies touch individual well-being, security, and privacy - through an ethical
            framework and tooling that scans work items for gaps against human-centric rules.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            <div className="card-glass p-4">
              <p className="text-sm font-semibold text-white mb-2">For TD Bank</p>
              <p className="text-sm text-slate-400">
                A structured, scalable way to implement AI - one that currently lacks institutional precedent
                at TD, but can now expand across departments.
              </p>
            </div>
            <div className="card-glass p-4">
              <p className="text-sm font-semibold text-white mb-2">For Employees</p>
              <p className="text-sm text-slate-400">
                Reduced cognitive load, empowered ethical decision-making during design, and the support
                to understand complex policy without reading lengthy documents.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Future work */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: 0.3, duration: 0.65 }}
          className="max-w-3xl mx-auto"
        >
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6 text-center">
            Future Iterations
          </p>
          <div className="space-y-3">
            {futureWork.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                className="flex items-start gap-3 card-glass px-5 py-4"
              >
                <span className="text-blue-400 font-bold text-sm flex-shrink-0 mt-0.5">→</span>
                <p className="text-sm text-slate-300">{item}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-14"
        >
          <a
            href="/assets/project-poster.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 font-semibold bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-xl hover:opacity-90 transition-opacity shadow-glow-sm"
          >
            View Project Poster ↗
          </a>
          <a
            href="/assets/demo-day.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 font-semibold text-slate-300 hover:text-white border border-white/10 hover:border-white/25 rounded-xl transition-all duration-300"
          >
            Download Demo Day PDF ↗
          </a>
        </motion.div>
      </div>
    </section>
  );
}
