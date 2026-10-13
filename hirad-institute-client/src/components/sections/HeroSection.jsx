import { brand, modelSteps } from '../../data/site'
import ButtonLink from '../common/ButtonLink'
import Container from '../common/Container'

export default function HeroSection() {
  return (
    <section className="bg-navy-900 text-white">
      <Container className="grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.3fr_0.7fr] lg:py-24">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-400">
            {brand.tagline}
          </p>
          <h1 className="mt-5 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
            {brand.statement}
          </h1>
          <div className="mt-6 h-px w-16 bg-gold-500" aria-hidden="true" />
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            Hirad Institute brings research, training, consultancy, events, and innovation into one professional home.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink to="/services">Explore Our Services</ButtonLink>
            <ButtonLink to="/#contact" variant="outlineLight">
              Contact Hirad
            </ButtonLink>
          </div>
        </div>

        <aside className="border border-white/10 bg-navy-800/70 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
            The Hirad Model
          </p>
          <ol className="mt-5 space-y-3">
            {modelSteps.map((step, index) => (
              <li key={step.label} className="flex items-baseline gap-4">
                <span className="w-6 font-serif text-gold-400">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="font-serif text-xl">{step.label}</span>
              </li>
            ))}
          </ol>
        </aside>
      </Container>
    </section>
  )
}
