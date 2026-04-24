import { motion } from 'framer-motion';

const objectives = [
  {
    num: '01',
    title: 'Map the Micro-Alignment Gap',
    body: 'Identify and characterize the gap in current AI safety frameworks as it pertains to individual employee well-being, privacy, and security - not just organizational compliance.',
  },
  {
    num: '02',
    title: 'Build Ethics-First Governance',
    body: 'Develop a framework that integrates ethical psychological safety and human autonomy as core AI safety features - not afterthoughts to corporate policy.',
  },
  {
    num: '03',
    title: 'Deliver an Adaptable System',
    body: 'Produce tooling that any company can integrate into their emerging technologies ecosystem, with customizable rules to match how their framework is defined and applied.',
  },
  {
    num: '04',
    title: 'Human-in-Command by Design',
    body: 'Create a human-in-command solution that uses AI to ensure ethical guidelines are followed - maintaining employee well-being, not replacing human judgment.',
  },
];

export default function Objectives() {
  return (
    <section id="objectives" className="section-padding bg-gray-950 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />

      <div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-cyan-400 mb-4">
            Project Objectives
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Four guiding{' '}
            <span className="gradient-text-cyan">principles</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {objectives.map((obj, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.12, duration: 0.65, ease: "easeOut" }}
              className="card-glass p-8 group relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 text-6xl font-black text-white/[.03] leading-none select-none group-hover:text-white/[.05] transition-colors">
                {obj.num}
              </div>
              <span className="text-sm font-bold gradient-text-cyan block mb-3">{obj.num}</span>
              <h3 className="text-xl font-bold text-white mb-3">{obj.title}</h3>
              <p className="text-slate-400 leading-relaxed">{obj.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
