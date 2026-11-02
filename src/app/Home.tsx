"use client";

import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Bell, Check, CheckCircle2,
  ChevronDown, CircleHelp, ClipboardCheck, Droplets, GraduationCap,
  HeartPulse, Landmark, Mail, MapPin, Phone, Plus, Route, ShieldCheck,
  Sparkles, Sprout, Zap,
} from "lucide-react";
import NavBar from "./components/nav_bar";
import Footer from "./components/footer";
import styles from "./home.module.css";

const steps = [
  { number: "01", title: "Create your profile", description: "Register with your details and choose your Assam district.", icon: Sprout },
  { number: "02", title: "Get verified", description: "Your district administrator reviews your citizen profile.", icon: ShieldCheck },
  { number: "03", title: "Tell us what happened", description: "Describe the issue, add its location, and attach evidence if available.", icon: Plus },
  { number: "04", title: "Follow the progress", description: "See status changes, district remarks, and the action taken.", icon: ClipboardCheck },
];

const categories = [
  { name: "Roads & infrastructure", icon: Route, tint: "coral" },
  { name: "Drinking water", icon: Droplets, tint: "blue" },
  { name: "Electricity & power", icon: Zap, tint: "gold" },
  { name: "Healthcare", icon: HeartPulse, tint: "rose" },
  { name: "Schools & education", icon: GraduationCap, tint: "lavender" },
  { name: "Administration", icon: Landmark, tint: "mint" },
];

const faqList = [
  { q: "How do I submit a civic grievance?", a: "Create a citizen account, wait for district verification, and select Submit a Grievance. Choose a category, give the location and details, and add a photo or document if you have one." },
  { q: "How can I track my application?", a: "Select Track Application from the homepage or Applications in the navigation bar. Your grievance list shows status, district details, and any official response." },
  { q: "Do I need to attach evidence?", a: "Evidence is optional, but a clear photo or relevant document can help the district team understand the issue." },
  { q: "How long does resolution take?", a: "It depends on the district and the nature of the issue. Check the tracking page for the latest review and action updates." },
];

export default function Home() {
  const [citizenProfile, setCitizenProfile] = useState<{ name: string; email: string } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [contactForm, setContactForm] = useState({ fullName: "", email: "", contactNumber: "", message: "" });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const profileStr = localStorage.getItem("userProfile");
    if (token && profileStr) {
      try {
        const u = JSON.parse(profileStr);
        setCitizenProfile({
          name: u.fullName || (u.firstName ? `${u.firstName} ${u.lastName || ""}`.trim() : "Citizen"),
          email: u.email || "",
        });
      } catch { /* Ignore invalid cached profiles. */ }
    }
  }, []);

  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setContactError(null);
    if (!contactForm.fullName || !contactForm.email || !contactForm.contactNumber || !contactForm.message) {
      setContactError("Please fill out all required fields.");
      return;
    }
    setContactLoading(true);
    try {
      const res = await axios.post("/api/contactUs", contactForm);
      if (res.status === 200 || res.status === 201) {
        setContactSuccess(true);
        setContactForm({ fullName: "", email: "", contactNumber: "", message: "" });
      } else {
        setContactError("Unable to submit. Please try again.");
      }
    } catch {
      setContactError("Network error. Please try again later.");
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <div className={`${styles.site} min-h-screen`}>
      <NavBar />
      <main>
        <section className={`${styles.hero} relative overflow-hidden`}>
          <div className="mx-auto grid max-w-[1440px] items-stretch lg:grid-cols-[.95fr_1.05fr]">
            <div className="relative z-10 flex flex-col justify-center px-6 py-16 sm:px-10 sm:py-20 lg:py-24 lg:pl-16 xl:pl-24">
              <span className={styles.eyebrow}><span className={styles.pulse} />A public platform for Assam</span>
              <h1 className="mt-7 max-w-[700px] font-heading text-[clamp(3.7rem,7vw,7.8rem)] font-bold leading-[.94] tracking-[-.07em] text-[#f8f5ea]">
                Your voice.<br /><span className="text-[#daebcf]">Our Assam.</span>
              </h1>
              <p className="mt-7 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">
                A simpler way to raise the issues that matter where you live—and see what happens next.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href={citizenProfile ? "/application/new" : "/usersignup"} className={styles.heroPrimary}>
                  <Plus size={18} /> Submit a grievance <ArrowUpRight size={18} />
                </Link>
                <Link href="/application/status" className={styles.heroSecondary}>
                  Track an application <ArrowRight size={18} />
                </Link>
              </div>
              <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/20 pt-6 text-xs font-semibold text-white/65 sm:text-sm">
                <span className="flex items-center gap-2"><CheckCircle2 size={17} className="text-[#cfde9b]" /> Free to use</span>
                <span className="flex items-center gap-2"><MapPin size={17} className="text-[#cfde9b]" /> All Assam districts</span>
                <span className="flex items-center gap-2"><ShieldCheck size={17} className="text-[#cfde9b]" /> District-level review</span>
              </div>
            </div>
            <div className={`${styles.heroVisual} relative min-h-[450px] lg:min-h-[710px]`}>
              <Image src="/images/majuli-home.webp" alt="Traditional bamboo home in Majuli, Assam" fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
              <div className={styles.heroPhotoWash} />
              <div className={styles.photoCaption}><span className={styles.captionLine} /> From every village to every city</div>
              <div className={styles.heroFloatingCard}>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e9f3df] text-[#285a40]"><Bell size={21} /></span>
                <span><strong className="block font-heading text-sm text-[#182a24]">A direct line to action</strong><small className="text-xs text-[#65716b]">Your district. Your community.</small></span>
                <ArrowUpRight size={17} className="ml-auto text-[#d26343]" />
              </div>
            </div>
          </div>
        </section>

        <div className={styles.ribbon} aria-label="Platform highlights">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-6 px-6 py-7 sm:grid-cols-4 sm:px-10">
            <div><strong>35</strong><span>Districts in Assam</span></div>
            <div><strong>12</strong><span>Issue categories</span></div>
            <div><strong>04</strong><span>Clear steps to take</span></div>
            <div><strong>Free</strong><span>For every citizen</span></div>
          </div>
        </div>

        <section id="about" className="mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
            <div>
              <p className={styles.sectionLabel}>01 / The idea</p>
              <h2 className={styles.sectionTitle}>Good governance<br />starts with <em>listening.</em></h2>
              <p className="mt-6 max-w-lg text-base leading-8 text-[#5d6d63]">
                A damaged road. A water supply that stops working. A question that deserves an answer. Jan Sambad gives local concerns a clear path to the district team responsible for addressing them.
              </p>
              <Link href="/about" className={styles.textLink}>More about Jan Sambad <ArrowUpRight size={18} /></Link>
              <div className="mt-10 grid max-w-md grid-cols-2 gap-4">
                <div className={styles.miniFeature}><Route size={24} /><span>Submit with a specific location</span></div>
                <div className={styles.miniFeature}><ClipboardCheck size={24} /><span>Follow official updates</span></div>
              </div>
            </div>
            <div className={styles.aboutComposition}>
              <div className={styles.aboutPhotoMain}>
                <Image src="/images/brahmaputra.webp" alt="Guwahati on the banks of the Brahmaputra" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
              </div>
              <div className={styles.aboutPhotoInset}>
                <Image src="/images/tea-estate.webp" alt="Tea estate in North Lakhimpur, Assam" fill sizes="(max-width: 1024px) 45vw, 20vw" className="object-cover" />
              </div>
              <div className={styles.aboutStamp}><span>ASSAM</span><strong>Every voice<br />matters.</strong><ArrowDownRight size={25} /></div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className={styles.journey}>
          <div className="mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:py-32">
            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <div><p className={styles.sectionLabel}>02 / Your journey</p><h2 className={styles.sectionTitle}>From concern<br />to <em>action.</em></h2></div>
              <p className="max-w-sm text-base leading-7 text-[#66756a]">A clear process, so you always know what comes next.</p>
            </div>
            <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {steps.map(({ number, title, description, icon: Icon }) => (
                <div className={styles.stepCard} key={number}>
                  <div className="flex items-start justify-between"><span className={styles.stepNumber}>{number}</span><Icon size={25} strokeWidth={1.7} className="text-[#346c56]" /></div>
                  <div><h3 className="font-heading text-xl font-bold text-[#1a3027]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#68766c]">{description}</p></div>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-between gap-5 border-t border-[#d7ded1] pt-7">
              <p className="text-sm text-[#68766c]">Already submitted an application?</p>
              <Link href="/application/status" className={styles.textLink}>See your application status <ArrowUpRight size={18} /></Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:py-32">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div><p className={styles.sectionLabel}>03 / Get started</p><h2 className={styles.sectionTitle}>The right space<br />for <em>your role.</em></h2></div>
            <p className="max-w-sm text-base leading-7 text-[#65736b]">Whether you are raising an issue or responding to one, there is a place for you here.</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className={styles.roleCitizen}>
              <div className="relative z-10 flex h-full flex-col justify-between p-8 sm:p-10">
                <div className="flex items-start justify-between"><span className={styles.roleTag}>For residents</span><span className="rounded-full bg-white/80 p-3 text-[#244e3a]"><Sprout size={23} /></span></div>
                <div><span className="mb-5 block text-xs font-bold uppercase tracking-[.2em] text-[#4b674e]">Your community, your voice</span>
                  <h3 className="max-w-sm font-heading text-3xl font-bold leading-tight text-[#213b2b] sm:text-4xl">Make your concern count.</h3>
                  <p className="mt-4 max-w-sm text-sm leading-6 text-[#4b604d]">Create a profile, share evidence, and stay informed as your district reviews the issue.</p>
                  <div className="mt-7 flex flex-wrap gap-3"><Link href="/usersignup" className={styles.roleButtonDark}>Create an account <ArrowUpRight size={17} /></Link><Link href="/userlogin" className={styles.roleButtonLight}>Citizen sign in</Link></div>
                </div>
              </div>
              <Image src="/images/tea-estate.webp" alt="Tea leaves in North Lakhimpur" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover opacity-[.22]" />
            </div>
            <div className={styles.roleOfficial}>
              <Image src="/images/brahmaputra.webp" alt="The Brahmaputra river and Guwahati" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover opacity-30" />
              <div className={styles.roleOverlay} />
              <div className="relative z-10 flex h-full flex-col justify-between p-8 sm:p-10">
                <div className="flex items-start justify-between"><span className={styles.roleTagOfficial}>For district officials</span><span className="rounded-full bg-white/15 p-3 text-white"><Landmark size={23} /></span></div>
                <div><span className="mb-5 block text-xs font-bold uppercase tracking-[.2em] text-[#d8d69c]">An organized path to resolution</span>
                  <h3 className="max-w-sm font-heading text-3xl font-bold leading-tight text-white sm:text-4xl">Turn local reports into local action.</h3>
                  <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">Review profiles, manage grievances, and share updates with the people you serve.</p>
                  <Link href="/admin/adminlogin" className={styles.roleButtonWhite}>Official sign in <ArrowUpRight size={17} /></Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="categories" className={styles.categoriesSection}>
          <div className="mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:py-28">
            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <div><p className={styles.sectionLabel}>04 / What you can report</p><h2 className={styles.sectionTitle}>Everyday issues.<br /><em>A place to start.</em></h2></div>
              <p className="max-w-sm text-base leading-7 text-[#66756a]">Select the right category when you submit. Your report will include the district and location you provide.</p>
            </div>
            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map(({ name, icon: Icon, tint }, index) => (
                <div className={styles.categoryCard} key={name}>
                  <span className={`${styles.categoryIcon} ${styles[tint]}`}><Icon size={25} strokeWidth={1.7} /></span>
                  <div><span className="text-[11px] font-bold tracking-widest text-[#9baca0]">0{index + 1}</span><h3 className="mt-1 font-heading text-lg font-bold text-[#213b2b]">{name}</h3></div>
                  <ArrowUpRight size={19} className="ml-auto self-start text-[#b1bcb1] transition-colors group-hover:text-[#2c6849]" />
                </div>
              ))}
            </div>
            <p className="mt-7 text-sm text-[#647267]">Also covering floods, sanitation, public safety, welfare, agriculture, and more.</p>
          </div>
        </section>

        <section className={styles.storyBand}>
          <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-20 sm:px-10 lg:grid-cols-[.95fr_1.05fr] lg:items-center lg:py-28">
            <div className="relative h-[320px] overflow-hidden rounded-[2rem] sm:h-[440px]">
              <Image src="/images/tea-estate.webp" alt="Rows of tea plants in North Lakhimpur" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
            </div>
            <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#b3dca3]">Connected by community</p>
              <h2 className="mt-5 font-heading text-[clamp(2.5rem,4vw,4.5rem)] font-bold leading-[1.05] tracking-tight text-white">Across the river.<br />Across the district.<br /><span className="text-[#dce9ba]">One conversation.</span></h2>
              <p className="mt-6 max-w-md text-base leading-8 text-white/70">Jan Sambad brings the reporting and follow-up together so a local problem does not get lost between people and departments.</p>
              <Link href={citizenProfile ? "/application/new" : "/usersignup"} className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#e2eabf] px-6 py-3 text-sm font-bold text-[#233c2c] transition hover:bg-white">Raise an issue <ArrowUpRight size={17} /></Link>
            </div>
          </div>
        </section>

        <section id="faqs" className="mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
            <div><p className={styles.sectionLabel}>05 / Good to know</p><h2 className={styles.sectionTitle}>Questions?<br /><em>We&apos;ve got you.</em></h2>
              <p className="mt-5 max-w-sm text-base leading-7 text-[#66756a]">Find a quick answer here or explore the complete help page.</p>
              <Link href="/faq" className={styles.textLink}>Explore all FAQs <ArrowUpRight size={18} /></Link>
              <div className="mt-12 hidden h-44 w-44 rounded-full bg-[#eff1e3] p-8 lg:flex"><CircleHelp size={95} strokeWidth={.8} className="m-auto text-[#8eac8b]" /></div>
            </div>
            <div className="border-t border-[#d7ded1]">
              {faqList.map((faq, index) => (
                <div key={faq.q} className="border-b border-[#d7ded1]">
                  <button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index} className="flex w-full items-center justify-between gap-6 py-6 text-left font-heading text-base font-bold text-[#203729] sm:text-lg">
                    <span className="flex items-start gap-4"><span className="pt-1 font-body text-xs font-bold text-[#c9694b]">0{index + 1}</span>{faq.q}</span>
                    <ChevronDown size={20} className={`shrink-0 text-[#64806b] transition-transform ${openFaq === index ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === index && <p className="max-w-xl pb-6 pl-9 text-sm leading-7 text-[#66756a]">{faq.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="contact" className={styles.contactSection}>
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-24 sm:px-10 lg:grid-cols-2 lg:gap-20 lg:py-32">
            <div className="flex flex-col justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#d4dea9]">06 / Get in touch</p>
                <h2 className="mt-5 font-heading text-[clamp(2.8rem,5vw,5.5rem)] font-bold leading-[1.02] tracking-tight text-white">We&apos;re here<br />to <span className="text-[#d4dea9]">listen.</span></h2>
                <p className="mt-6 max-w-md text-base leading-8 text-white/70">Need help using the portal or have a question? Send us a message and the support team can follow up.</p>
              </div>
              <div className="mt-12 space-y-4 text-sm text-white/80">
                <div className="flex items-center gap-3"><Mail size={18} className="text-[#d4dea9]" /><span>support@portal.assam</span></div>
                <div className="flex items-center gap-3"><Phone size={18} className="text-[#d4dea9]" /><span>1800-345-3677</span></div>
                <div className="flex items-center gap-3"><MapPin size={18} className="text-[#d4dea9]" /><span>Dispur, Guwahati, Assam</span></div>
              </div>
            </div>
            <div className={styles.contactCard}>
              <div className="mb-8 flex items-start justify-between gap-4"><div><p className={styles.sectionLabel}>Send an inquiry</p><h3 className="mt-2 font-heading text-2xl font-bold text-[#203729]">Tell us how we can help.</h3></div><span className="rounded-2xl bg-[#f3f0dd] p-3 text-[#476847]"><Sparkles size={23} /></span></div>
              {contactSuccess ? (
                <div role="status" className="flex items-start gap-3 rounded-2xl bg-[#eef5e9] p-5 text-sm leading-6 text-[#2b6746]"><Check size={21} className="shrink-0" />Thank you! Your inquiry has been submitted to the support team.</div>
              ) : (
                <form onSubmit={handleContactSubmit} className="grid gap-5 sm:grid-cols-2">
                  {contactError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 sm:col-span-2">{contactError}</p>}
                  <label className={styles.formLabel}>Full name<input name="fullName" required autoComplete="name" value={contactForm.fullName} onChange={(e) => setContactForm({ ...contactForm, fullName: e.target.value })} placeholder="Your full name" className={styles.formControl} /></label>
                  <label className={styles.formLabel}>Email address<input name="email" type="email" required autoComplete="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} placeholder="you@example.com" className={styles.formControl} /></label>
                  <label className={styles.formLabel}>Phone number<input name="contactNumber" type="tel" required autoComplete="tel" value={contactForm.contactNumber} onChange={(e) => setContactForm({ ...contactForm, contactNumber: e.target.value })} placeholder="Your contact number" className={styles.formControl} /></label>
                  <label className={`${styles.formLabel} sm:col-span-2`}>Your message<textarea name="message" required rows={4} value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} placeholder="How can we help?" className={styles.formControl} /></label>
                  <button type="submit" disabled={contactLoading} className={`${styles.submitButton} sm:col-span-2`}>{contactLoading ? "Sending…" : "Send your message"}<ArrowUpRight size={18} /></button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
