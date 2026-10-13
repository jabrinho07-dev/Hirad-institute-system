import { modelSteps } from '../../data/site'
import Container from '../common/Container'
import SectionHeading from '../common/SectionHeading'

export default function ModelSection() {
  return (
    <section className="bg-navy-900 py-16 text-white sm:py-20" aria-labelledby="model-title">
      <Container>
        <SectionHeading
          id="model-title"
          eyebrow="Hirad Model"
          title="Learn → Develop → Research → Solve → Connect → Grow"
          light
        />
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {modelSteps.map((step, index) => (
            <li key={step.label} className="border border-white/10 bg-navy-800 p-5">
              <p className="text-xs font-semibold tracking-[0.18em] text-gold-400">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-3 font-serif text-2xl">{step.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{step.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
