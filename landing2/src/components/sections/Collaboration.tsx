import { motion } from 'framer-motion';

const highlights = [
  {
    name: 'Barbod Habibi',
    role: 'Framework Lead',
    contribution:
      'Developed the AI Safety & Wellbeing Assurance Framework, coordinated team direction, and led the coding and organization of the framework for the website.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Amirhossein Mansouri',
    role: 'Full-Stack Development',
    contribution:
      'Co-developed the framework with Barbod, contributed creative approaches, and collaborated on ideas for the Capstone Day presentation.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    name: 'Max Catricala',
    role: 'Project Coordination',
    contribution:
      'Took charge of initiating group assignments, communicating deliverable ownership, and keeping the team aligned on milestones.',
    gradient: 'from-cyan-500 to-teal-500',
  },
  {
    name: 'Alessandro Tesa',
    role: 'Research & Strategy',
    contribution:
      'Consistently brought positive energy and expanded on ideas — driving deeper exploration of the problem space and solution design.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    name: 'Rameen Kahloon',
    role: 'Advisory & Coordination',
    contribution:
      'Drew on prior C4 experience to advise on goals and standards, offering direct and constructive guidance on team direction.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    name: 'Aabrar Raiyan',
    role: 'Analysis & Documentation',
    contribution:
      'Organized, detail-oriented contributions to the analysis pipeline and documentation — with a strong commitment to quality and thoroughness.',
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    name: 'Natalia Garcia',
    role: 'UX & Documentation',
    contribution:
      'Creative and open-minded approach to UX considerations — always working carefully and identifying opportunities to contribute meaningfully.',
    gradient: 'from-fuchsia-500 to-violet-500',
  },
];

export default function Collaboration() {
  return (
    <section className="section-padding bg-[#080d18] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[140px]" />
      </div>

      <div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="text-center mb-6"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-violet-400 mb-4">
            Collaboration
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Multidisciplinary,{' '}
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              mission-driven
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            The diversity of academic backgrounds allowed the team to approach the problem from technical,
            organizational, and human-centred perspectives — with open communication throughout.
          </p>
        </motion.div>

        {/* Team narrative */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: 0.15, duration: 0.65 }}
          className="card-glass p-8 mb-10 max-w-4xl mx-auto"
        >
          <p className="text-slate-300 leading-relaxed text-center italic">
            "As this is our final report, our progress has evolved significantly. Each team member's contributions
            became more specialized over time. Even when team members felt lost on unfamiliar subjects,
            others stepped up to teach and support — ensuring everyone was prepared and confident for Capstone Day."
          </p>
        </motion.div>

        {/* Individual contribution cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {highlights.map((member, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: "easeOut" }}
              className="card-glass p-5 group"
            >
              {/* Avatar */}
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white font-bold text-sm mb-4 group-hover:scale-105 transition-transform duration-300`}
              >
                {member.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <p className="text-sm font-bold text-white mb-0.5">{member.name}</p>
              <p className="text-xs text-slate-500 mb-3">{member.role}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{member.contribution}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
