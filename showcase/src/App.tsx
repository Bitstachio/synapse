import Nav from '@/components/Nav';
import Hero from '@/components/sections/Hero';
import Challenge from '@/components/sections/Challenge';
import ExistingSolutions from '@/components/sections/ExistingSolutions';
import Solution from '@/components/sections/Solution';
import JiraDemo from '@/components/sections/JiraDemo';
import Objectives from '@/components/sections/Objectives';
import Architecture from '@/components/sections/Architecture';
import FunctionalComponents from '@/components/sections/FunctionalComponents';
import Principles from '@/components/sections/Principles';
import Results from '@/components/sections/Results';
import Collaboration from '@/components/sections/Collaboration';
import Conclusion from '@/components/sections/Conclusion';
import SiteFooter from '@/components/sections/SiteFooter';

export default function App() {
  return (
    <div className="dark min-h-screen bg-gray-950">
      <Nav />
      <main>
        <Hero />
        <Challenge />
        <ExistingSolutions />
        <Solution />
        <JiraDemo />
        <Objectives />
        <Architecture />
        <FunctionalComponents />
        <Principles />
        <Results />
        <Collaboration />
        <Conclusion />
      </main>
      <SiteFooter />
    </div>
  );
}
