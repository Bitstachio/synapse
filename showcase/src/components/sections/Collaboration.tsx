import { motion } from 'framer-motion';

const members = [
  {
    name: 'Barbod Habibi',
    major: 'Computer Science',
    intro: 'Framework architect and full-stack developer with a focus on AI systems and ethical governance.',
    photo: '/assets/barbod.png',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Amirhossein Mansouri',
    major: 'Computer Science',
    intro: 'Full-stack developer with a passion for human-centered design and creative problem solving.',
    photo: '/assets/amirhossein.png',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    name: 'Max Catricala',
    major: 'Business Technology Management',
    intro: 'Project coordinator bridging technical and business perspectives to keep the team aligned.',
    photo: '/assets/max.png',
    gradient: 'from-cyan-500 to-teal-500',
  },
  {
    name: 'Natalia Garcia',
    major: 'Information Technology',
    intro: 'UX-minded contributor focused on accessibility, documentation, and creative approaches.',
    photo: '/assets/natalia.png',
    gradient: 'from-fuchsia-500 to-violet-500',
  },
  {
    name: 'Rameen Kahloon',
    major: 'Information Technology',
    intro: 'Advisor and coordinator drawing on prior capstone experience to guide the team forward.',
    photo: '/assets/rameen.png',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    name: 'Aabrar Raiyan',
    major: 'Computer Science',
    intro: 'Detail-oriented analyst and technical writer committed to accuracy and thoroughness.',
    photo: '/assets/aabrar.png',
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    name: 'Alessandro Tesa',
    major: 'Business Technology Management',
    intro: 'Researcher and strategist with an eye for expanding ideas and exploring the problem space.',
    photo: '/assets/alessandro.png',
    gradient: 'from-green-500 to-emerald-500',
  },
];

export default function Collaboration() {
  return (
    <section id="team" className="section-padding bg-[#080d18] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[140px]" />
      </div>

      <div className="section-container relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="text-center mb-6"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-violet-400 mb-4">
            Capstone Collective · Team A6
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Multidisciplinary,{' '}
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              mission-driven
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            Seven students across Computer Science, Business Technology Management, and Information
            Technology - approaching responsible AI from every angle.
          </p>
        </motion.div>

        {/* Narrative quote */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: 0.15, duration: 0.65 }}
          className="card-glass p-8 mb-10 max-w-4xl mx-auto"
        >
          <p className="text-slate-300 leading-relaxed text-center italic">
            "The diversity of academic backgrounds allowed the team to approach the problem from technical,
            organizational, and human-centred perspectives. Even when members felt lost on unfamiliar
            subjects, others stepped up to teach and support - ensuring everyone was prepared and
            confident for Capstone Day."
          </p>
        </motion.div>

        {/* Member cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {members.map((member, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: 'easeOut' }}
              className="card-glass p-5 group"
            >
              {/* Photo avatar with gradient ring */}
              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${member.gradient} p-[2px] mb-4 group-hover:scale-105 transition-transform duration-300 flex-shrink-0`}>
                <div className="w-full h-full rounded-[22px] overflow-hidden bg-gray-900">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-full h-full object-cover object-top"
                    draggable={false}
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.classList.add('flex', 'items-center', 'justify-center');
                        parent.innerHTML = `<span class="text-white font-bold text-sm">${member.name.split(' ').map((n: string) => n[0]).join('')}</span>`;
                      }
                    }}
                  />
                </div>
              </div>
              <p className="text-sm font-bold text-white mb-0.5">{member.name}</p>
              <p className="text-xs text-slate-500 mb-3">{member.major}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{member.intro}</p>
            </motion.article>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-center text-slate-600 text-sm mt-10"
        >
          C4 6.0 · Team A6 · in partnership with TD Bank · April 2026
        </motion.p>
      </div>
    </section>
  );
}
