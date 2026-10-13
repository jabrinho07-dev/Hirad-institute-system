import { Outlet } from 'react-router-dom'
import ScrollManager from '../components/common/ScrollManager'
import Footer from '../components/layout/Footer'
import Header from '../components/layout/Header'

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-ivory text-navy-900">
      <ScrollManager />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-navy-900"
      >
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
