import AboutIntro from '../components/sections/AboutIntro'
import AudienceSection from '../components/sections/AudienceSection'
import ClosingCta from '../components/sections/ClosingCta'
import HeroSection from '../components/sections/HeroSection'
import ModelSection from '../components/sections/ModelSection'
import ServicesPreview from '../components/sections/ServicesPreview'
import SolutionsSection from '../components/sections/SolutionsSection'
import WhyHirad from '../components/sections/WhyHirad'

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutIntro />
      <ServicesPreview />
      <SolutionsSection />
      <ModelSection />
      <AudienceSection />
      <WhyHirad />
      <ClosingCta />
    </>
  )
}
