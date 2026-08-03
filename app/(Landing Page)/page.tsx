import Hero from "@/components/landing/Hero";
import About from "@/components/landing/About";
import Trails from "@/components/landing/Trails";
import FAQ from "@/components/landing/FAQ";

const LandingPage = () => {
  return (
    <main className="bg-zinc-950">
      <Hero />

      <About />

      <Trails />

      <FAQ />
    </main>
  );
};

export default LandingPage;