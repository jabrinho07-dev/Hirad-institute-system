import ButtonLink from '../components/common/ButtonLink'
import Container from '../components/common/Container'
import PageHero from '../components/common/PageHero'
import { services } from '../data/services'

export default function Services() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="How Hirad works with people and institutions"
        text="Academy, training, research, consultancy, publications, events, and membership."
      />

      <div className="bg-white">
        {services.map((service, index) => {
          const Icon = service.icon
          const tone = index % 2 === 0 ? 'bg-white' : 'bg-ivory'

          return (
            <section
              key={service.id}
              id={service.id}
              aria-labelledby={`${service.id}-title`}
              className={`scroll-mt-24 border-b border-navy-900/10 py-14 sm:py-16 ${tone}`}
            >
              <Container className="grid gap-6 md:grid-cols-[auto_1fr] md:items-start md:gap-10">
                <span className="flex h-14 w-14 items-center justify-center border border-gold-500/60 bg-white text-navy-900">
                  <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div className="max-w-3xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">
                    {service.navLabel}
                  </p>
                  <h2
                    id={`${service.id}-title`}
                    className="mt-3 font-serif text-3xl text-navy-900 sm:text-4xl"
                  >
                    {service.title}
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-navy-800/80">
                    {service.description}
                  </p>
                  <div className="mt-6">
                    <ButtonLink to="/#contact" variant="navy">
                      Contact Hirad
                    </ButtonLink>
                  </div>
                </div>
              </Container>
            </section>
          )
        })}
      </div>
    </>
  )
}
