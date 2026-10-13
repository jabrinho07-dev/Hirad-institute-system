export default function SectionHeading({
  id,
  eyebrow,
  title,
  text,
  light = false,
  align = 'left',
}) {
  const alignment = align === 'center' ? 'mx-auto text-center' : 'text-left'

  return (
    <div className={`max-w-3xl ${alignment}`}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-600">
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className={`mt-3 font-serif text-3xl leading-tight sm:text-4xl ${
          light ? 'text-white' : 'text-navy-900'
        }`}
      >
        {title}
      </h2>
      {text && (
        <p
          className={`mt-4 text-base leading-relaxed ${
            light ? 'text-white/75' : 'text-navy-800/80'
          }`}
        >
          {text}
        </p>
      )}
    </div>
  )
}
