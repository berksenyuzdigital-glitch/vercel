import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Manifesto from "@/components/Manifesto";
import Services from "@/components/Services";
import Team from "@/components/Team";
import Process from "@/components/Process";
import Atelier from "@/components/Atelier";
import Testimonials from "@/components/Testimonials";
import Booking from "@/components/Booking";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import { clinic, doctors, services } from "@/lib/clinic";

const schema = {
  "@context": "https://schema.org",
  "@type": "Dentist",
  name: `${clinic.name} ${clinic.tagline}`,
  telephone: clinic.phone,
  email: clinic.mail,
  address: {
    "@type": "PostalAddress",
    streetAddress: clinic.address,
    addressLocality: "İstanbul",
    addressCountry: "TR",
  },
  openingHours: ["Mo-Fr 09:00-19:00", "Sa 10:00-16:00"],
  employee: doctors.map((doctor) => ({
    "@type": "Person",
    name: doctor.name,
    jobTitle: doctor.role,
  })),
  makesOffer: services.map((service) => ({
    "@type": "Offer",
    itemOffered: { "@type": "Service", name: service.title },
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Manifesto />
        <Services />
        <Team />
        <Process />
        <Atelier />
        <Testimonials />
        <Booking />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
