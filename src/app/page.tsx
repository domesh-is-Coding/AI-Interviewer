
import { Button } from "@/components/ui/button";
import Link from 'next/link'
import FeatureCard from "@/components/landing-page/feature-card";

export default function Home() {
  return (
    <div className="absolute top-0 z-[-2] min-h-screen w-screen bg-white bg-[radial-gradient(100%_50%_at_50%_0%,rgba(0,163,255,0.13)_0,rgba(0,163,255,0)_50%,rgba(0,163,255,0)_100%)]">
      <main>
        <nav>
          {/* Navigation here if needed */}
        </nav>
        <header className="flex flex-col items-center justify-center bg-white/20 p-8 rounded-lg w-9/12 md:w-1/2 mx-auto my-30 text-center backdrop-blur-2xl shadow-lg border border-white/30">
          <span>Ace Every Interview with</span>
          <h1 className="text-xl md:text-4xl lg:text-5xl font-medium">Your Personal AI Interviewer</h1>
          <p className="mt-4">Practice real, job-specific interviews, get instant feedback, and improve with AI-driven insights.</p>
          <section className="mt-4">
            <Button>Get Started Free</Button>
            <Button variant="secondary" className="ml-2">Sign In</Button>
          </section>
        </header>
        <section className="flex justify-center w-full">
          <div className="w-full md:w-10/12 lg:w-8/12 xl:w-7/12 mx-auto">
            <FeatureCard />
          </div>
        </section>
      </main>
    </div>
  );
}
