import { audiences } from '../../data/site'
import Container from '../common/Container'
import SectionHeading from '../common/SectionHeading'

export default function AudienceSection() {
  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="audience-title">
      <Container>
        <SectionHeading
          id="audience-title"
          eyebrow="Who We Serve"
          title="People and institutions"
          text="The brand statement names the two audiences at the centre of Hirad’s purpose."
        />
        <ul className="mt-10 grid gap-5 md:grid-cols-2">
          {audiences.map((audience) => (
            <li key={audience.title} className="border-t-2 border-gold-500 bg-ivory p-6 sm:p-8">
              <h3 className="font-serif text-3xl text-navy-900">{audience.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-navy-800/80 sm:text-base">
                {audience.text}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
