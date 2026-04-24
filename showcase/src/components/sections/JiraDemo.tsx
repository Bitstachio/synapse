import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import { motion } from 'framer-motion';

export default function JiraDemo() {
  return (
    <section className="bg-[#080d18] relative overflow-hidden" aria-label="Jira Plugin Demo">
      {/* Top divider glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-blue-500/30" />

      <ContainerScroll
        titleComponent={
          <div className="pb-8">
            <motion.p
              initial={{ opacity: 0, y: -16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-400 mb-4"
            >
              See it in Action
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4"
            >
              The plug-in lives where{' '}
              <span className="gradient-text">your team works</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-slate-400 max-w-2xl mx-auto"
            >
              Each Jira ticket is scanned against the framework. Non-compliant items are flagged instantly —
              with the specific principle breached highlighted directly in the ticket view.
            </motion.p>
          </div>
        }
      >
        <div className="w-full h-full flex flex-col">
          {/* Jira-style mock header */}
          <div className="flex items-center gap-3 px-4 py-2 bg-[#1a1f2e] border-b border-white/[.08] flex-shrink-0">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 bg-white/5 rounded px-3 py-1 text-xs text-slate-500 font-mono">
              Synapse AI Assurance — Jira Plugin
            </div>
          </div>
          {/* Screenshot */}
          <div className="flex-1 overflow-hidden relative">
            <img
              src="/assets/jira-example.png"
              alt="Jira plugin showing AI assurance framework violation detection in a ticket"
              className="w-full h-full object-cover object-top"
              loading="lazy"
              decoding="async"
            />
            {/* Overlay badge */}
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-3 py-1.5 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-xs font-semibold text-red-300">Violation Detected</span>
            </div>
          </div>
        </div>
      </ContainerScroll>
    </section>
  );
}
