export const primaryNav = [
  { label: 'Home', to: '/' },
  { label: 'About Hirad', to: '/about' },
  { label: 'Academy', to: '/services#academy' },
  { label: 'Training', to: '/services#training' },
  { label: 'Research', to: '/services#research' },
  { label: 'Consultancy', to: '/services#consultancy' },
  { label: 'Publications', to: '/services#publications' },
  { label: 'Events', to: '/services#events' },
  { label: 'Membership', to: '/services#membership' },
]

export const serviceNav = primaryNav.filter((item) => item.to.startsWith('/services#'))
