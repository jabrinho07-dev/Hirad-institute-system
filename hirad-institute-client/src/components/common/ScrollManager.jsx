import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      return undefined
    }

    const id = decodeURIComponent(hash.slice(1))
    const scrollToTarget = () => {
      const target = document.getElementById(id)
      if (!target) return false
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return true
    }

    if (scrollToTarget()) return undefined

    const frame = requestAnimationFrame(scrollToTarget)
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])

  return null
}
