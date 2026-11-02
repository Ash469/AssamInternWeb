import Footer from '../components/footer'
import NavBar from '../components/nav_bar'
import { FaBuilding, FaUsers, FaHeadset } from 'react-icons/fa'
import Image from 'next/image'

export default function About() {
  return (
    <div className="min-h-screen bg-[#f7f8f5]">
      {/* Navbar */}
      <NavBar />

      {/* Hero Section */}
      <section className="page-hero relative py-20 sm:py-28 px-6">
        <div className="relative z-10 max-w-6xl mx-auto">
          <p className="text-xs font-bold tracking-[.2em] uppercase text-[#f7c6a8] mb-4">People · Districts · Progress</p>
          <h1 className="text-4xl sm:text-6xl font-heading font-extrabold max-w-2xl leading-[1.02]">A clearer path from citizen voice to public action.</h1>
          <p className="text-white/75 text-base sm:text-lg max-w-xl mt-5 leading-relaxed">Jan Sambad connects Assam residents with the district teams responsible for making everyday services better.</p>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16 px-6 md:px-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div>
              <p className="section-kicker mb-3">Why Jan Sambad</p>
              <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#12221f] mb-5">Public services work better when every voice has a route.</h2>
            </div>
            <div className="relative h-64 overflow-hidden rounded-3xl shadow-lg">
              <Image src="/images/brahmaputra.webp" alt="Guwahati on the banks of the Brahmaputra" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-center" />
            </div>
          </div>
          <div>
            <p className="text-[#40524e] mb-8 leading-relaxed text-base">
              A broken road, an interrupted water supply, or a concern about a local service affects real people every day. Jan Sambad gives residents a place to describe the problem, identify their district, and share supporting evidence with the team that can act on it.
            </p>
            <h2 className="text-2xl font-heading font-bold text-[#17745c] mb-4">Our mission</h2>
            <p className="text-[#40524e] mb-8 leading-relaxed text-base">
              Make civic reporting clear and accessible. Citizens can follow their submissions and read official updates, while district teams can review issues, verify profiles, and share public notices in one connected workspace.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="bg-[#eaf2ee] py-16 px-6 md:px-16">
        <div className="max-w-5xl mx-auto">
          <p className="section-kicker text-center mb-2">The Jan Sambad difference</p>
          <h2 className="text-3xl font-heading font-extrabold text-[#12221f] mb-10 text-center">Built for trust, speed, and real-world use.</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="interactive-card bg-white rounded-3xl shadow-md p-7 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-[#fce8dc] rounded-2xl flex items-center justify-center text-[#d95f31] mb-4">
                  <FaBuilding className="text-2xl" />
                </div>
                <h3 className="text-lg font-heading font-bold text-[#12221f] mb-2">Streamlined Workflows</h3>
                <p className="text-sm text-[#71817d]">
                  A guided path from citizen registration to district review and resolution.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="interactive-card bg-white rounded-3xl shadow-md p-7 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-[#e6f2f2] rounded-2xl flex items-center justify-center text-[#1c6680] mb-4">
                  <FaUsers className="text-2xl" />
                </div>
                <h3 className="text-lg font-heading font-bold text-[#12221f] mb-2">User-Centered Design</h3>
                <p className="text-sm text-[#71817d]">
                  Clear forms, photo evidence, and visible status updates at every step.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="interactive-card bg-white rounded-3xl shadow-md p-7 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-[#e4f1e8] rounded-2xl flex items-center justify-center text-[#17745c] mb-4">
                  <FaHeadset className="text-2xl" />
                </div>
                <h3 className="text-lg font-heading font-bold text-[#12221f] mb-2">Dedicated Support</h3>
                <p className="text-sm text-[#71817d]">
                  Get answers and contact the helpdesk when you need a hand.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
