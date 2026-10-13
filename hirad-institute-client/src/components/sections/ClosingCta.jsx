import { brand } from '../../data/site'
import ButtonLink from '../common/ButtonLink'
import Container from '../common/Container'

export default function ClosingCta() {
  return (
    <section id="contact" className="bg-navy-950 py-16 text-white sm:py-20">
      <Container className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">
          Contact Hirad
        </p>
        <h2 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">
          {brand.statement}
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75">
          Enquiries can cover the academy, training, research, consultancy, publications, events, or membership. Official contact channels are not listed on this page yet.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink to="/services">Explore Our Services</ButtonLink>
          <ButtonLink to="/about" variant="outlineLight">
            About Hirad
          </ButtonLink>
        </div>
      </Container>
    </section>
  )
}
