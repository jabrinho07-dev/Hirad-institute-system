import { Link } from 'react-router-dom'
import { services } from '../../data/services'
import Container from '../common/Container'
import SectionHeading from '../common/SectionHeading'

export default function ServicesPreview() {
  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="services-preview-title">
      <Container>
        <SectionHeading
          id="services-preview-title"
          eyebrow="Services"
          title="Seven ways Hirad works"
          text="Academy, training, research, consultancy, publications, events, and membership."
        />
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <li key={service.id}>
                <Link
                  to={`/services#${service.id}`}
                  className="flex h-full flex-col border border-navy-900/10 bg-ivory p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-gold-500/60 hover:shadow-md"
                >
                  <span className="flex h-11 w-11 items-center justify-center border border-gold-500/50 text-navy-900">
                    <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-serif text-2xl text-navy-900">{service.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-800/80">
                    {service.summary}
                  </p>
                  <span className="mt-5 text-sm font-semibold text-gold-600">
                    View {service.navLabel}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
