import Hero from "@/components/landing/Hero";
import About from "@/components/landing/About";
import MountPulagInfo from "@/components/landing/MountPulagInfo";
import FAQ from "@/components/landing/FAQ";

const LandingPage = () => {
  return (
    <main className="bg-zinc-950">
      <Hero />

      <About />

      <MountPulagInfo />

      <FAQ />
    </main>
  );
};

export default LandingPage;