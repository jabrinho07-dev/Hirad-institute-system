import Container from './Container'

export default function PageHero({ eyebrow, title, text }) {
  return (
    <section className="bg-navy-900 text-white">
      <Container className="py-16 sm:py-20 lg:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-400">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">
          {title}
        </h1>
        <div className="mt-6 h-px w-16 bg-gold-500" aria-hidden="true" />
        {text && (
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            {text}
          </p>
        )}
      </Container>
    </section>
  )
}
