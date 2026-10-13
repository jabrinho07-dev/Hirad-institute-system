import { solutions } from '../../data/solutions'
import Container from '../common/Container'
import SectionHeading from '../common/SectionHeading'

export default function SolutionsSection() {
  return (
    <section className="bg-ivory py-16 sm:py-20" aria-labelledby="solutions-title">
      <Container>
        <SectionHeading
          id="solutions-title"
          eyebrow="Hirad Solutions"
          title="Named solutions"
          text="These solutions are part of the institute profile. Fuller descriptions will follow the official material for each one."
        />
        <ul className="mt-10 grid gap-5 md:grid-cols-2">
          {solutions.map((solution) => {
            const Icon = solution.icon
            return (
              <li
                key={solution.title}
                className="border border-navy-900/10 bg-white p-6 shadow-sm sm:p-8"
              >
                <span className="flex h-11 w-11 items-center justify-center bg-navy-900 text-gold-400">
                  <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-serif text-2xl text-navy-900">{solution.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-800/80">
                  {solution.text}
                </p>
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
