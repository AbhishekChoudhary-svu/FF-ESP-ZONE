import Link from "next/link"
import { Button } from "@/components/ui/button"
import ThemeToggleButton from "../ui/theme-toggle-button"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            FF-ESP-ZONE
          </div>

          <div className="flex gap-4">
            <ThemeToggleButton
                variant="circle-blur"
                
                />
            <Button asChild variant="outline" >
              <Link href="/login" className="hover:bg-yellow-600 ">Login</Link>
            </Button>

            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-4 py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <h1 className="mb-6 text-balance text-5xl font-bold md:text-7xl">
            Dominate the{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Free Fire
            </span>{" "}
            Esports Arena
          </h1>

          <p className="mb-10 text-balance text-xl text-muted-foreground md:text-2xl">
            Join tournaments, recruit elite teammates, and climb the competitive ladder
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="shadow-lg shadow-primary/20">
              <Link href="/signup">Start Your Journey</Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/40 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-16 text-center text-4xl font-bold">Why FF-ESP-ZONE?</h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Free Tournaments",
                description: "Compete in BR and CS tournaments with zero entry fee",
              },
              {
                title: "Paid Tournaments",
                description: "High-stakes competitive events with prize pools",
              },
              {
                title: "Team Recruitment",
                description: "Find skilled players by role and KDA metrics",
              },
              {
                title: "World Chat",
                description: "Connect with the global Free Fire community",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6 transition hover:border-primary/50"
              >
                <h3 className="mb-3 text-xl font-semibold text-primary">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tournament Formats */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-16 text-center text-4xl font-bold">
            Tournament Formats
          </h2>

          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                type: "BR (Battle Royale)",
                modes: ["Solo", "Duo", "Squad"],
                gradient: "from-primary/30",
              },
              {
                type: "CS (Clash Squad)",
                modes: ["1v1", "2v2", "4v4"],
                gradient: "from-accent/30",
              },
            ].map((format) => (
              <div
                key={format.type}
                className={`rounded-xl border border-border bg-gradient-to-br ${format.gradient} to-transparent p-8`}
              >
                <h3 className="mb-4 text-2xl font-bold">{format.type}</h3>

                <div className="flex flex-wrap gap-2">
                  {format.modes.map((mode) => (
                    <span
                      key={mode}
                      className="rounded-full bg-primary/20 px-3 py-1 text-sm"
                    >
                      {mode}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-muted/40 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 text-center md:grid-cols-3">
            {[
              { stat: "10K+", label: "Active Players" },
              { stat: "500+", label: "Monthly Tournaments" },
              { stat: "$1M+", label: "Prize Pool" },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-2 text-4xl font-bold text-primary">
                  {item.stat}
                </div>
                <div className="text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-4xl font-bold">Ready to Compete?</h2>
          <p className="mb-8 text-xl text-muted-foreground">
            Join thousands of Free Fire players competing on FF-ESP-ZONE.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup">Sign Up Now</Link>
            </Button>

            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 text-xl font-bold">FF-ESP-ZONE</div>
              <p className="text-sm text-muted-foreground">
                The ultimate Free Fire esports platform
              </p>
            </div>

            {[
              { title: "Product", links: ["Tournaments", "Recruitment", "Chat"] },
              { title: "Company", links: ["About", "Blog", "Contact"] },
              { title: "Legal", links: ["Privacy", "Terms", "Rules"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 font-semibold">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-muted-foreground transition hover:text-foreground"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
            © 2026 FF-ESP-ZONE. Free Fire is a trademark of Garena.
          </div>
        </div>
      </footer>
    </div>
  )
}
