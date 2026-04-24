import { motion } from 'framer-motion';

const members = [
  {
    name: 'Max Catricala',
    role: 'Project Coordination',
    gradient: 'from-blue-500 to-cyan-500',
    initials: 'MC',
  },
  {
    name: 'Alessandro Tesa',
    role: 'Research & Strategy',
    gradient: 'from-cyan-500 to-teal-500',
    initials: 'AT',
  },
  {
    name: 'Natalia Garcia',
    role: 'UX & Documentation',
    gradient: 'from-teal-500 to-green-500',
    initials: 'NG',
  },
  {
    name: 'Amirhossein Mansouri',
    role: 'Full-Stack Development',
    gradient: 'from-violet-500 to-purple-600',
    initials: 'AM',
  },
  {
    name: 'Barbod Habibi',
    role: 'Framework Lead',
    gradient: 'from-blue-500 to-violet-600',
    initials: 'BH',
  },
  {
    name: 'Rameen Kahloon',
    role: 'Advisory & Coordination',
    gradient: 'from-amber-500 to-orange-500',
    initials: 'RK',
  },
  {
    name: 'Aabrar Raiyan',
    role: 'Analysis & Documentation',
    gradient: 'from-rose-500 to-pink-500',
    initials: 'AR',
  },
];

export default function Team() {
  return (
    <section id="team" className="section-padding bg-[#080d18] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/5 rounded-full blur-[150px]" />
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
            The Team
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            <span className="gradient-text">Capstone Collective</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Seven authors. One mission. Authors of the full technical report and the Synapse framework.
          </p>
          <p className="text-sm text-slate-500 mt-2">TD Bank Collaboration · April 2026</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {members.map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.08, duration: 0.55, ease: "easeOut" }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="card-glass p-6 text-center group cursor-default"
            >
              {/* Avatar */}
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white font-bold text-base mx-auto mb-4 shadow-glow-sm group-hover:scale-105 transition-transform duration-300`}
              >
                {member.initials}
              </div>

              <p className="font-bold text-white text-sm">{member.name}</p>
              <p className="text-xs text-slate-500 mt-1">{member.role}</p>

              {/* Subtle gradient line on hover */}
              <div className={`h-0.5 w-0 group-hover:w-full mx-auto mt-4 bg-gradient-to-r ${member.gradient} rounded-full transition-all duration-500`} />
            </motion.div>
          ))}
        </div>

        {/* Supervisor/institution note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-center text-slate-600 text-sm mt-12"
        >
          Capstone 4.0 · C4 6.0 · Team A6 · in partnership with TD Bank
        </motion.p>
      </div>
    </section>
  );
}
