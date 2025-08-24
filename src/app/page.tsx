import { Button } from "@/components/ui/button";
import Link from 'next/link'

export default function Home() {
  return (
    <div className="absolute top-0 z-[-2] h-screen w-screen bg-white bg-[radial-gradient(100%_50%_at_50%_0%,rgba(0,163,255,0.13)_0,rgba(0,163,255,0)_50%,rgba(0,163,255,0)_100%)]">
      <main>
        <nav>

        </nav>
        <header className="flex flex-col items-center justify-center bg-white/20 p-8 rounded-lg w-9/12 md:w-1/2 mx-auto mt-30 text-center backdrop-blur-2xl shadow-lg border border-white/30">
        <span>Ace Every Interview with</span>
          <h1 className="text-xl md:text-4xl lg:text-5xl font-medium">Your Personal AI Interviewer</h1>
          <p className="mt-4">Practice real, job-specific interviews, get instant feedback, and improve with AI-driven insights.</p>
          <section className="mt-4">
            <Link href="/login"><Button>Get Started Free</Button></Link>
            <Button variant="secondary" className="ml-2">Sign In</Button>
          </section>
        </header>
      </main>
    </div>
  );
}
