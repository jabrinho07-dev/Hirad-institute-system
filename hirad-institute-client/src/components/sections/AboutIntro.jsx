import { overview } from '../../data/site'
import ButtonLink from '../common/ButtonLink'
import Container from '../common/Container'
import SectionHeading from '../common/SectionHeading'

export default function AboutIntro() {
  return (
    <section className="bg-ivory py-16 sm:py-20" aria-labelledby="about-intro-title">
      <Container className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
        <SectionHeading
          id="about-intro-title"
          eyebrow="About Hirad"
          title="An institute for people, institutions, and impact"
          text={overview}
        />
        <div className="border border-navy-900/10 bg-white p-6 shadow-sm sm:p-8">
          <p className="font-serif text-2xl leading-snug text-navy-900">
            Building People · Strengthening Institutions · Creating Impact
          </p>
          <div className="mt-8">
            <ButtonLink to="/about" variant="navy">
              About Hirad
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  )
}
