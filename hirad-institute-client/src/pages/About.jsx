import PageHero from '../components/common/PageHero'
import Container from '../components/common/Container'
import { brand, mission, modelSteps, overview, values, vision } from '../data/site'

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About Hirad"
        title={brand.name}
        text={overview}
      />

      <section className="bg-white py-16 sm:py-20" aria-labelledby="overview-title">
        <Container className="grid gap-6 lg:grid-cols-2">
          <article className="border border-navy-900/10 p-6 sm:p-8">
            <h2 id="overview-title" className="font-serif text-3xl text-navy-900">
              Institute overview
            </h2>
            <p className="mt-4 text-base leading-relaxed text-navy-800/80">{overview}</p>
            <p className="mt-4 text-sm font-medium tracking-wide text-gold-600">{brand.tagline}</p>
          </article>
          <article className="bg-navy-900 p-6 text-white sm:p-8">
            <h2 className="font-serif text-3xl">Brand statement</h2>
            <p className="mt-4 font-serif text-2xl leading-snug text-gold-400">{brand.statement}</p>
          </article>
        </Container>
      </section>

      <section className="bg-ivory py-16 sm:py-20" aria-labelledby="vision-title">
        <Container className="grid gap-5 md:grid-cols-2">
          <article className="bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">Vision</p>
            <h2 id="vision-title" className="mt-3 font-serif text-3xl text-navy-900">
              {vision}
            </h2>
          </article>
          <article className="bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">Mission</p>
            <h2 className="mt-3 font-serif text-3xl text-navy-900">{mission}</h2>
          </article>
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-20" aria-labelledby="values-title">
        <Container>
          <h2 id="values-title" className="font-serif text-3xl text-navy-900 sm:text-4xl">
            Core values
          </h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => (
              <li key={value.title} className="border border-navy-900/10 p-6">
                <h3 className="font-serif text-2xl text-navy-900">{value.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-800/80">{value.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-ivory py-16 sm:py-20" aria-labelledby="founder-title">
        <Container className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <article className="border border-gold-500/40 bg-navy-900 p-6 text-white sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
              Founder and President
            </p>
            <h2 id="founder-title" className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">
              {brand.founder.name}
            </h2>
            <p className="mt-3 text-sm text-white/75">{brand.founder.role}</p>
          </article>
          <article>
            <h2 className="font-serif text-3xl text-navy-900 sm:text-4xl">Organizational approach</h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-navy-800/80">
              Hirad’s approach follows a stated sequence: learn, develop, research, solve, connect, and grow.
            </p>
            <ol className="mt-6 grid gap-3 sm:grid-cols-2">
              {modelSteps.map((step, index) => (
                <li key={step.label} className="flex gap-3 bg-white px-4 py-3 shadow-sm">
                  <span className="font-serif text-gold-600">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-medium text-navy-900">{step.label}</span>
                </li>
              ))}
            </ol>
          </article>
        </Container>
      </section>
    </>
  )
}
