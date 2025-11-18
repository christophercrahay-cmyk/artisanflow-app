import { Hero } from '@/components/home/Hero';
import { ProblemSection } from '@/components/home/ProblemSection';
import { SolutionFeatures } from '@/components/home/SolutionFeatures';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Benefits } from '@/components/home/Benefits';
import { Stats } from '@/components/home/Stats';
import { Testimonials } from '@/components/home/Testimonials';
import { FAQ } from '@/components/home/FAQ';
import { FinalCTA } from '@/components/home/FinalCTA';

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <SolutionFeatures />
      <HowItWorks />
      <Benefits />
      <Stats />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </>
  );
}

