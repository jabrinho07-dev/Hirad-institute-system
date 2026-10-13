import { reasons } from '../../data/site'
import Container from '../common/Container'
import SectionHeading from '../common/SectionHeading'

export default function WhyHirad() {
  return (
    <section className="bg-ivory py-16 sm:py-20" aria-labelledby="why-title">
      <Container>
        <SectionHeading
          id="why-title"
          eyebrow="Why Hirad"
          title="What the profile makes clear"
        />
        <ol className="mt-10 grid gap-5 lg:grid-cols-3">
          {reasons.map((reason, index) => (
            <li key={reason.title} className="bg-white p-6 shadow-sm sm:p-8">
              <p className="font-serif text-gold-600">{String(index + 1).padStart(2, '0')}</p>
              <h3 className="mt-3 font-serif text-2xl text-navy-900">{reason.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-navy-800/80">{reason.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
