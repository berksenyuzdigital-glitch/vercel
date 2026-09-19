/**
 * Content layer.
 *
 * The original build is Nuxt + a headless CMS (the asset hashes in
 * /public/images are Strapi upload hashes), so content lives here rather than
 * hardcoded in components. Swap this composable for a CMS fetch when the
 * backend is wired up — the component API stays identical.
 */

export interface Service { title: string; to: string }
export interface TechItem { title: string; image: string; to: string }
export interface Expert { name: string; role: string; bio: string; image: string }
export interface Testimonial { quote: string; author: string; treatment: string }

export function useSiteContent() {
  const locations = ['Aventura', 'Bay Harbor', 'Coral Gables']

  const services: Service[] = [
    { title: 'Smile Makeovers', to: '/esthetic-dentistry' },
    { title: 'Esthetic Bonding & Contouring', to: '/esthetic-dentistry' },
    { title: 'Teeth Whitening', to: '/esthetic-dentistry' },
    { title: 'Porcelain Veneers', to: '/esthetic-dentistry' },
    { title: 'Implant Restoration', to: '/restorative-dentistry' },
    { title: 'Crowns and Bridges', to: '/restorative-dentistry' },
    { title: 'Full Mouth Rehabilitation', to: '/restorative-dentistry' },
    { title: 'Tooth-Colored Fillings', to: '/restorative-dentistry' },
    { title: 'Oral Cancer Screening', to: '/preventive-care' }
  ]

  const technology: TechItem[] = [
    { title: 'iTero Digital Impressions', image: '/images/intra_oral_pic_e9dbe162cb.webp', to: '/esthetic-dentistry' },
    { title: 'Solea Laser', image: '/images/Solea_Convergent_Dental_3ee452e2c8.webp', to: '/esthetic-dentistry' },
    { title: 'Intra Oral Camera', image: '/images/medium_Intra_Oral_Camera_8_50c3ea5d8d.webp', to: '/preventive-care' },
    { title: 'CT Scanner', image: '/images/CT_Scanner_4ec6304a0d.webp', to: '/restorative-dentistry' },
    { title: 'Digital Smile Design', image: '/images/makeover_13a55bbf44.webp', to: '/esthetic-dentistry' },
    { title: 'Implant Planning', image: '/images/implants_188a0a4d10.webp', to: '/restorative-dentistry' }
  ]

  /** Populate from the CMS — names/roles below are structural placeholders. */
  const experts: Expert[] = [
    {
      name: 'Dr. Joel Gale',
      role: 'Senior partner',
      bio: 'Expert in esthetic and implant dentistry.',
      image: '/images/DSC_03466_2_6fe88d5827.webp'
    },
    {
      name: 'Dr. Grillo',
      role: 'Partner',
      bio: 'Restorative and preventive care.',
      image: '/images/IV_9319_f0a75741be.webp'
    },
    {
      name: 'Clinical Team',
      role: 'Hygiene & support',
      bio: 'Patient care and comfort.',
      image: '/images/1_3f23996a52.webp'
    }
  ]

  /** Replace with the practice's approved, attributed patient reviews. */
  const testimonials: Testimonial[] = [
    { quote: '', author: '', treatment: 'Implant Restoration' },
    { quote: '', author: '', treatment: 'Crowns and Bridges' },
    { quote: '', author: '', treatment: 'Full Mouth Rehabilitation' },
    { quote: '', author: '', treatment: 'Deep Cleanings' }
  ]

  return { locations, services, technology, experts, testimonials }
}
