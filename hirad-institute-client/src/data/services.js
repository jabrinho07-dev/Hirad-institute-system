import {
  BookOpen,
  Briefcase,
  CalendarDays,
  GraduationCap,
  Microscope,
  Presentation,
  Users,
} from 'lucide-react'

export const services = [
  {
    id: 'academy',
    navLabel: 'Academy',
    title: 'Academy',
    summary: 'Learning offered through the Hirad Academy.',
    description:
      'The Academy is Hirad’s learning arm. It sits within the institute’s commitment to building people.',
    icon: GraduationCap,
  },
  {
    id: 'training',
    navLabel: 'Training',
    title: 'Training & Capacity Development',
    summary: 'Training that develops people and institutional capacity.',
    description:
      'Training and capacity development help people and institutions grow the capability the institute’s mission calls for.',
    icon: Presentation,
  },
  {
    id: 'research',
    navLabel: 'Research',
    title: 'Research',
    summary: 'Research as a core part of Hirad’s work.',
    description:
      'Research supports the institute’s attention to evidence and informs training, consultancy, publications, and events.',
    icon: Microscope,
  },
  {
    id: 'consultancy',
    navLabel: 'Consultancy',
    title: 'Consultancy',
    summary: 'Consultancy for institutions with a defined need.',
    description:
      'Consultancy is how Hirad works with institutions on questions that call for advice grounded in its areas of practice.',
    icon: Briefcase,
  },
  {
    id: 'publications',
    navLabel: 'Publications',
    title: 'Publications',
    summary: 'Written work shared by the institute.',
    description:
      'Publications give Hirad a public form for research and ideas connected to its training, consultancy, and events.',
    icon: BookOpen,
  },
  {
    id: 'events',
    navLabel: 'Events',
    title: 'Events',
    summary: 'Gatherings connected to the institute’s work.',
    description:
      'Events bring people together around research, training, consultancy, and innovation.',
    icon: CalendarDays,
  },
  {
    id: 'membership',
    navLabel: 'Membership',
    title: 'Membership',
    summary: 'A way for people and institutions to connect with Hirad.',
    description:
      'Membership is the institute’s connection point for people and institutions who want to stay linked to its work.',
    icon: Users,
  },
]
