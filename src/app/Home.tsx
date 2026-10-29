"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import {
  ArrowRight,
  Plus,
  ListChecks,
  Check,
  Shield,
  UserCheck,
  Compass,
} from "lucide-react";
import NavBar from "./components/nav_bar";
import Footer from "./components/footer";

const faqList = [
  {
    q: "How do I submit a new civic grievance?",
    a: "Sign in with your citizen account, click 'Submit a Grievance', choose the category (Roads, Water, Electricity, Healthcare etc.), select your district and local village/ward, and provide photos or location details.",
  },
  {
    q: "How can I track the status of my application?",
    a: "Click on 'Track Application' or navigate to 'Applications' in the navigation bar to see live progress, official district remarks, and verified inspection updates.",
  },
  {
    q: "What evidence should I provide with my complaint?",
    a: "Clear on-ground photos of the issue (such as road damage, contaminated drinking water, or fallen wires) significantly accelerate field verification and action by municipal teams.",
  },
  {
    q: "How long does district resolution typically take?",
    a: "Immediate emergencies are dispatched within 24 hours. General municipal works are verified in 3–5 working days and scheduled for execution with regular status updates.",
  },
  {
    q: "What if my complaint is rejected?",
    a: "The district official records a specific explanation (such as out-of-jurisdiction, duplicate entry, or insufficient details). You can review their notes and submit a revised complaint.",
  },
  {
    q: "Is this service free for all Assam residents?",
    a: "Yes. Jan Sambad is a 100% free public grievance redressal platform open to all citizens across all 35 districts of Assam with no filing charges.",
  },
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
      } catch { /* noop */ }
    }
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
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
    <div className="min-h-screen bg-[#F7F6F2] text-[#111318] flex flex-col font-sans overflow-x-hidden">
      <NavBar />

      <main className="flex-1">
        {/* ══════════════════════════════════════════════════════════
            HERO SECTION
        ══════════════════════════════════════════════════════════ */}
        <section className="relative pt-6 sm:pt-10 pb-8 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Heading, Subtitle, Actions, Trust Indicators */}
            <div className="lg:col-span-5 z-10">
              <div className="text-xs font-bold tracking-wider text-[#687180] uppercase mb-3">
                PEOPLE · DISTRICTS · A STRONGER ASSAM
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-[#111318] leading-[1.05] tracking-tight mb-4">
                Every
                Concern<br />
                Builds a<br />
                <span className="font-script text-5xl sm:text-6xl lg:text-6xl text-[#285A91] font-bold block mt-0.5 leading-none">
                  Better Assam
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-[#394454] leading-relaxed max-w-md mb-6 font-normal">
                Jan Sambad is a unified platform for Assamese citizens to report, track, and resolve civic issues directly with district officials — ensuring a more responsive, accountable, and people-centric governance.
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-6">
                {citizenProfile ? (
                  <>
                    <Link
                      href="/application/new"
                      className="inline-flex items-center gap-2 bg-[#111318] hover:bg-black text-white px-6 py-3 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-xs"
                    >
                      <Plus size={15} />
                      <span>Submit a Grievance</span>
                      <ArrowRight size={13} />
                    </Link>
                    <Link
                      href="/application/status"
                      className="inline-flex items-center gap-2 bg-transparent border border-[#DEDCD5] text-[#111318] hover:bg-[#EAE8E0] px-5 py-3 rounded-full text-xs sm:text-sm font-semibold transition-all"
                    >
                      <ListChecks size={15} />
                      <span>Track Application</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/usersignup"
                      className="inline-flex items-center gap-2 bg-[#111318] hover:bg-black text-white px-6 py-3 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-xs"
                    >
                      <span>Submit a Grievance</span>
                      <ArrowRight size={14} />
                    </Link>
                    <Link
                      href="/application/status"
                      className="inline-flex items-center gap-2 bg-transparent border border-[#DEDCD5] text-[#111318] hover:bg-[#EAE8E0] px-5 py-3 rounded-full text-xs sm:text-sm font-semibold transition-all"
                    >
                      <ListChecks size={15} />
                      <span>Track Application</span>
                    </Link>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-5 text-xs text-[#394454] font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#FBE9DA] flex items-center justify-center text-[#F36D21]">
                    <UserCheck size={13} />
                  </div>
                  <span>Free for all citizens</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#E8F0F8] flex items-center justify-center text-[#285A91]">
                    <Shield size={13} />
                  </div>
                  <span>Secure &amp; encrypted</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#E3F5EC] flex items-center justify-center text-[#23845B]">
                    <Compass size={13} />
                  </div>
                  <span>Direct district routing</span>
                </div>
              </div>
            </div>

            {/* Right Column: Filled Assam Landscape Composition */}
            <div className="lg:col-span-7 relative w-full">
              <div className="relative w-full h-[380px] sm:h-[440px] lg:h-[480px] rounded-3xl overflow-hidden border border-[#DEDCD5] shadow-sm bg-[#EAE8E0]">
                
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/d/d8/Brahmaputra_River_Guwahati_Assam.jpg"
                  alt="Scenic Brahmaputra River and Hills, Guwahati, Assam"
                  fill
                  className="object-cover object-center"
                  priority
                />
                <div className="absolute top-4 left-6 z-20 flex items-center gap-2 bg-[#F7F6F2]/85 backdrop-blur-xs px-3 py-1 rounded-full border border-[#DEDCD5]/60 shadow-xs">
                  <span className="font-script text-xl sm:text-2xl text-[#111318] font-bold">
                    Assam for its People
                  </span>
                  <svg className="w-12 h-6 text-[#111318] opacity-80" viewBox="0 0 100 40" fill="currentColor" aria-hidden="true">
                    <path d="M10 20 Q15 10 20 20 Q25 10 30 20 Q20 18 10 20 Z" />
                    <path d="M40 12 Q44 4 48 12 Q52 4 56 12 Q48 10 40 12 Z" />
                    <path d="M70 16 Q73 8 76 16 Q79 8 82 16 Q76 14 70 16 Z" />
                  </svg>
                </div>

                {/* Regional Motto Tag (Bottom Left) */}
                <div className="absolute bottom-4 left-5 z-20 bg-white/95 backdrop-blur-sm border border-[#DEDCD5] rounded-xl px-3 py-1.5 text-xs text-[#394454] font-semibold leading-tight shadow-xs">
                  <div>OUR DISTRICTS</div>
                  <div>OUR COMMUNITIES</div>
                  <div className="text-[#111318] font-bold">OUR TOMORROW</div>
                </div>

              </div>
            </div>

          </div>
        </section>

        <section className="px-4 sm:px-8 max-w-7xl mx-auto mb-20 sm:mb-28 lg:mb-32">
          <div className="bg-[#F0EEE6] border border-[#DEDCD5] rounded-3xl p-5 sm:p-6 shadow-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y md:divide-y-0 md:divide-x divide-[#DEDCD5]">
              {/* Stat 1: Assam Map Silhouette Badge */}
              <div className="flex items-center gap-3.5 pt-3 md:pt-0">
                <div className="relative w-11 h-11 rounded-2xl bg-[#F5DECE] flex items-center justify-center flex-shrink-0 shadow-2xs overflow-hidden p-1.5">
                  <Image
                    src="/assamMap.png"
                    alt="Assam Map"
                    fill
                    className="object-contain p-1 z-10"
                    priority
                  />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-heading font-extrabold text-[#111318] leading-none">35</div>
                  <div className="text-xs text-[#394454] font-medium mt-1">Districts Covered</div>
                </div>
              </div>

              {/* Stat 2: Document / Categories Badge */}
              <div className="flex items-center gap-3.5 pt-3 md:pt-0 md:pl-6">
                <div className="w-11 h-11 rounded-2xl bg-[#F5DECE] flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#A84A1A]">
                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-heading font-extrabold text-[#111318] leading-none">100+</div>
                  <div className="text-xs text-[#394454] font-medium mt-1">Grievance Categories</div>
                </div>
              </div>

              {/* Stat 3: Clock Badge */}
              <div className="flex items-center gap-3.5 pt-3 md:pt-0 md:pl-6">
                <div className="w-11 h-11 rounded-2xl bg-[#F5DECE] flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#A84A1A]">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-heading font-extrabold text-[#111318] leading-none">72 hr</div>
                  <div className="text-xs text-[#394454] font-medium mt-1">Avg. Resolution Time</div>
                </div>
              </div>

              {/* Stat 4: Community / Citizens Badge */}
              <div className="flex items-center gap-3.5 pt-3 md:pt-0 md:pl-6">
                <div className="w-11 h-11 rounded-2xl bg-[#F5DECE] flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#A84A1A]">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 3s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-heading font-extrabold text-[#111318] leading-none">Free</div>
                  <div className="text-xs text-[#394454] font-medium mt-1">For Every Citizen</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            ACCESS PORTALS — Background Artwork & Blended Images
        ══════════════════════════════════════════════════════════ */}
        <section id="about" className="relative px-4 sm:px-8 max-w-7xl mx-auto mb-24 sm:mb-32 lg:mb-36">
          
          {/* Subtle Assamese botanical foliage sketch in background */}
          <div className="absolute left-1/3 top-0 w-64 h-full pointer-events-none opacity-25 z-0">
            <svg viewBox="0 0 100 200" className="w-full h-full stroke-[#9E9584] fill-none" strokeWidth="1.2">
              <path d="M20,200 Q25,120 40,40 M40,40 Q45,20 50,0 M22,140 Q45,130 65,138 M28,100 Q55,90 75,102 M34,60 Q60,50 80,62 M36,55 Q15,45 5,50" />
            </svg>
          </div>

          {/* Deep blue watercolor ink splash in background right */}
          <div className="absolute -right-4 -bottom-6 w-72 h-72 pointer-events-none opacity-30 z-0">
            <svg viewBox="0 0 200 200" className="w-full h-full fill-[#204975]">
              <path d="M40,120 C20,80 60,30 110,40 C160,50 180,90 170,140 C160,190 90,180 50,170 C30,165 45,130 40,120 Z" filter="blur(18px)" />
            </svg>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Introduction Column */}
            <div className="lg:col-span-4 pr-2 flex flex-col justify-center">
              <span className="text-xs font-bold tracking-wider uppercase text-[#687180] block mb-1.5">
                ACCESS PORTALS
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#111318] leading-tight tracking-tight mb-2">
                Choose<br />Your Role
              </h2>
              <div className="w-10 h-1 bg-[#F36D21] rounded-full mb-3" />
              
              <p className="text-xs text-[#394454] leading-relaxed mb-4">
                Different access for citizens and district officials to ensure secure, efficient, and accountable grievance redressal.
              </p>

              <div className="hidden lg:flex items-center gap-3">
                <div className="grid grid-cols-4 gap-1.5 opacity-25">
                  {[...Array(16)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#111318]" />
                  ))}
                </div>
                <svg className="w-12 h-6 text-[#687180]" viewBox="0 0 80 40" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M10 20 Q40 5 65 25" strokeLinecap="round" />
                  <path d="M55 25 L65 25 L62 15" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Middle: Citizen Portal Card with Image in Background & Text Over It */}
            <div className="lg:col-span-4 bg-[#FAF7F2] border border-[#EBE3D5] rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-xs min-h-[380px]">
              {/* Full Background Image */}
              <div className="absolute inset-0 pointer-events-none z-0">
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/c/c5/Village_Life_of_Assam_3.jpg"
                  alt="Assam rural community background"
                  fill
                  className="object-cover object-center"
                />
                {/* Translucent warm cream paper wash so text is 100% legible */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2]/90 via-[#FAF7F2]/95 to-[#FAF7F2]" />
              </div>

              <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold tracking-wider uppercase text-[#394454]">
                      FOR RESIDENTS
                    </span>
                    {/* Illustrated Citizen Badge */}
                    <div className="w-8 h-8 rounded-full bg-[#FBE9DA] flex items-center justify-center shadow-xs">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#F36D21]">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                  </div>

                  <h3 className="text-2xl font-heading font-extrabold text-[#111318] mb-4 leading-tight">
                    Citizen Portal
                  </h3>

                  <div className="space-y-3 text-xs text-[#394454] font-medium mb-6">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#E3F5EC] text-[#23845B] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={11} strokeWidth={3} />
                      </div>
                      <span className="text-xs leading-normal">Register and submit civic grievances</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#E3F5EC] text-[#23845B] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={11} strokeWidth={3} />
                      </div>
                      <span className="text-xs leading-normal">Upload ground photos &amp; documents</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#E3F5EC] text-[#23845B] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={11} strokeWidth={3} />
                      </div>
                      <span className="text-xs leading-normal">Track live status and official updates</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-[#DEDCD5]/70">
                  <Link
                    href="/userlogin"
                    className="w-full flex items-center justify-center gap-1.5 bg-[#111318] hover:bg-black text-white text-xs font-semibold py-2.5 px-4 rounded-full transition-all text-center shadow-xs"
                  >
                    <span>Sign In</span>
                    <ArrowRight size={13} />
                  </Link>
                  <Link
                    href="/usersignup"
                    className="w-full block bg-white hover:bg-[#F0EEE6] border border-[#DEDCD5] text-[#111318] text-xs font-semibold py-2 px-4 rounded-full transition-all text-center"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: District Administrator Card with Architecture Image in Background */}
            <div className="lg:col-span-4 bg-[#102A43] text-white rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-md min-h-[380px]">
              {/* Architecture Background Image */}
              <div className="absolute inset-0 pointer-events-none z-0">
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/2/26/Assam_Secretariat%2C_Dispur%2C_August%2C_2008.jpg"
                  alt="Assam Secretariat Building"
                  fill
                  className="object-cover object-center opacity-40 mix-blend-luminosity"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#102A43]/85 via-[#102A43]/90 to-[#102A43]" />
              </div>

              <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold tracking-wider uppercase text-white">
                      FOR OFFICIALS
                    </span>
                    {/* Illustrated Colonnade Emblem Badge */}
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shadow-xs">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                        <path d="M12 1L2 6v2h20V6L12 1zm-7 9v8h2v-8H5zm4 0v8h2v-8H9zm4 0v8h2v-8h-2zm4 0v8h2v-8h-2zM2 20v2h20v-2H2z"/>
                      </svg>
                    </div>
                  </div>

                  <h3 className="text-2xl font-heading font-extrabold text-white mb-4 leading-tight">
                    District Administrator
                  </h3>

                  <div className="space-y-3 text-xs text-white/90 mb-6">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500/30 text-blue-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={11} strokeWidth={3} />
                      </div>
                      <span className="text-xs leading-normal">Verify resident registrations</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500/30 text-blue-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={11} strokeWidth={3} />
                      </div>
                      <span className="text-xs leading-normal">Manage and inspect complaints</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500/30 text-blue-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={11} strokeWidth={3} />
                      </div>
                      <span className="text-xs leading-normal">Publish updates &amp; official advisories</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <Link
                    href="/admin/adminlogin"
                    className="w-full flex items-center justify-center gap-1.5 bg-white hover:bg-slate-100 text-[#102A43] text-xs font-bold py-2.5 px-4 rounded-full transition-all text-center shadow-xs"
                  >
                    <span>Official Login</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section id="how-it-works" className="px-4 sm:px-8 max-w-7xl mx-auto mb-24 sm:mb-32 lg:mb-36">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left: Rural Assam Photo fading naturally into background (NO rigid box) */}
            <div className="lg:col-span-5 relative">
              <div className="relative w-full h-64 sm:h-72 mask-blend-right">
                <Image
                  src="/Village_Road_in_Assam.jpg"
                  alt="Rural Assam community life"
                  fill
                  className="object-cover object-left"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#F7F6F2] via-transparent to-transparent" />
              </div>
              <div className="absolute bottom-2 left-4 z-10 bg-[#F7F6F2]/90 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                <span className="font-script text-2xl sm:text-3xl text-[#111318] font-bold block leading-tight">
                  From Villages to a Stronger Assam
                </span>
              </div>
            </div>

            {/* Right: 4-Step Process Timeline with Graphic Badges */}
            <div className="lg:col-span-7">
              <div className="mb-4">
                <span className="text-xs font-bold tracking-wider uppercase text-[#A84A1A] block mb-1">
                  A Simple 4-Step Process
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#111318] tracking-tight">
                  How It Works
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
                {/* Step 1: Terracotta */}
                <div className="relative flex flex-col items-start bg-[#FAF9F5] border border-[#DEDCD5] rounded-2xl p-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#FBE9DA] text-[#A84A1A] flex items-center justify-center font-heading font-bold text-xs mb-2 shadow-xs">
                    01
                  </div>
                  <h3 className="text-xs font-heading font-bold text-[#111318] mb-1">Register Your Profile</h3>
                  <p className="text-xs text-[#687180] leading-relaxed">
                    Create your citizen account and specify your district and village/ward.
                  </p>
                </div>

                {/* Step 2: Assam Blue */}
                <div className="relative flex flex-col items-start bg-[#FAF9F5] border border-[#DEDCD5] rounded-2xl p-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#E8F0F8] text-[#285A91] flex items-center justify-center font-heading font-bold text-xs mb-2 shadow-xs">
                    02
                  </div>
                  <h3 className="text-xs font-heading font-bold text-[#111318] mb-1">Admin Verification</h3>
                  <p className="text-xs text-[#687180] leading-relaxed">
                    Your district administrator reviews and verifies your profile.
                  </p>
                </div>

                {/* Step 3: Tea Green */}
                <div className="relative flex flex-col items-start bg-[#FAF9F5] border border-[#DEDCD5] rounded-2xl p-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#E3F5EC] text-[#186343] flex items-center justify-center font-heading font-bold text-xs mb-2 shadow-xs">
                    03
                  </div>
                  <h3 className="text-xs font-heading font-bold text-[#111318] mb-1">Lodge Your Complaint</h3>
                  <p className="text-xs text-[#687180] leading-relaxed">
                    Submit your grievance with location, category and supporting evidence.
                  </p>
                </div>

                {/* Step 4: Deep Navy */}
                <div className="relative flex flex-col items-start bg-[#FAF9F5] border border-[#DEDCD5] rounded-2xl p-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#E8EEF5] text-[#102A43] flex items-center justify-center font-heading font-bold text-xs mb-2 shadow-xs">
                    04
                  </div>
                  <h3 className="text-xs font-heading font-bold text-[#111318] mb-1">Resolution &amp; Closure</h3>
                  <p className="text-xs text-[#687180] leading-relaxed">
                    Field teams inspect, take action and mark the issue resolved.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            GRIEVANCE CATEGORIES — Rich Illustrated Graphic Badges
        ══════════════════════════════════════════════════════════ */}
        <section id="categories" className="px-4 sm:px-8 max-w-7xl mx-auto mb-24 sm:mb-32 lg:mb-36">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            <div className="lg:col-span-4 pr-2">
              <span className="text-xs font-bold tracking-wider text-[#687180] block mb-1">
                Departmental Coverage
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#111318] tracking-tight leading-tight mb-2">
                Grievance<br />Categories
              </h2>
              <p className="text-xs text-[#394454] leading-relaxed">
                Complaints are organized for immediate routing to the appropriate technical teams.
              </p>
            </div>

            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                
                {/* 1. Roads & Bridges */}
                <div className="bg-[#FAF7F0] border border-[#DEDCD5] rounded-2xl p-3 text-center hover:shadow-xs transition-all flex flex-col items-center justify-center min-h-[105px]">
                  <div className="w-9 h-9 rounded-full bg-[#FBE9DA] flex items-center justify-center mb-2 shadow-2xs">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#F36D21]">
                      <path d="M19 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm-8 14H6v-2h5v2zm0-4H6v-2h5v2zm0-4H6V8h5v2zm7 8h-5v-2h5v2zm0-4h-5v-2h5v2zm0-4h-5V8h5v2z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-heading font-bold text-[#111318] leading-tight">Roads &amp;<br />Bridges</span>
                </div>

                {/* 2. Drinking Water */}
                <div className="bg-[#F0F7FF] border border-[#D2E4F5] rounded-2xl p-3 text-center hover:shadow-xs transition-all flex flex-col items-center justify-center min-h-[105px]">
                  <div className="w-9 h-9 rounded-full bg-[#E8F0F8] flex items-center justify-center mb-2 shadow-2xs">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#285A91]">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-heading font-bold text-[#111318] leading-tight">Drinking<br />Water</span>
                </div>

                {/* 3. Electricity & Power */}
                <div className="bg-[#FFFDF0] border border-[#F5EFC7] rounded-2xl p-3 text-center hover:shadow-xs transition-all flex flex-col items-center justify-center min-h-[105px]">
                  <div className="w-9 h-9 rounded-full bg-[#FEF08A] flex items-center justify-center mb-2 shadow-2xs">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#A16207]">
                      <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-heading font-bold text-[#111318] leading-tight">Electricity<br />&amp; Power</span>
                </div>

                {/* 4. Healthcare */}
                <div className="bg-[#FFF5F5] border border-[#FCDCDC] rounded-2xl p-3 text-center hover:shadow-xs transition-all flex flex-col items-center justify-center min-h-[105px]">
                  <div className="w-9 h-9 rounded-full bg-[#FEE2E2] flex items-center justify-center mb-2 shadow-2xs">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#DC2626]">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-heading font-bold text-[#111318] leading-tight">Health<br />care</span>
                </div>

                {/* 5. Schools & Education */}
                <div className="bg-[#F8F5FF] border border-[#E9DFF7] rounded-2xl p-3 text-center hover:shadow-xs transition-all flex flex-col items-center justify-center min-h-[105px]">
                  <div className="w-9 h-9 rounded-full bg-[#EDE9FE] flex items-center justify-center mb-2 shadow-2xs">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#7C3AED]">
                      <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-heading font-bold text-[#111318] leading-tight">Schools &amp;<br />Education</span>
                </div>

                {/* 6. Sanitation & Waste */}
                <div className="bg-[#F2FAF4] border border-[#D5EEDC] rounded-2xl p-3 text-center hover:shadow-xs transition-all flex flex-col items-center justify-center min-h-[105px]">
                  <div className="w-9 h-9 rounded-full bg-[#E3F5EC] flex items-center justify-center mb-2 shadow-2xs">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#23845B]">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-heading font-bold text-[#111318] leading-tight">Sanitation<br />&amp; Waste</span>
                </div>

                {/* 7. More Categories */}
                <div className="bg-white border border-[#DEDCD5] rounded-2xl p-3 text-center hover:shadow-xs transition-all flex flex-col items-center justify-center min-h-[105px]">
                  <div className="w-9 h-9 rounded-full bg-[#F0EEE6] flex items-center justify-center mb-2 shadow-2xs">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#687180]">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-heading font-bold text-[#687180] leading-tight">More<br />Categories</span>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            FAQS AND CITIZEN SUPPORT HELPDESK
        ══════════════════════════════════════════════════════════ */}
        <section id="faqs" className="px-4 sm:px-8 max-w-7xl mx-auto mb-20 sm:mb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Frequently Asked Questions */}
            <div className="lg:col-span-6">
              <span className="text-xs font-bold tracking-wider uppercase text-[#687180] block mb-1">
                COMMON INQUIRIES
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#111318] tracking-tight mb-1.5">
                Frequently<br />Asked Questions
              </h2>
              <p className="text-xs text-[#394454] leading-relaxed mb-4">
                Clear answers about grievance submission, tracking, and resolution.
              </p>

              <div className="space-y-1.5 mb-5">
                {faqList.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="bg-white border border-[#DEDCD5] rounded-xl overflow-hidden transition-all shadow-xs"
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        aria-expanded={isOpen}
                        className="w-full px-4 py-3 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                      >
                        <span className="text-xs font-heading font-semibold text-[#111318] pr-3">
                          {faq.q}
                        </span>
                        <span aria-hidden="true" className="text-base font-bold text-[#111318] flex-shrink-0">
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-3.5 text-xs text-[#394454] leading-relaxed border-t border-[#F0EEE6] pt-2.5">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <Link
                href="/userlogin"
                className="inline-flex items-center gap-1.5 bg-[#111318] hover:bg-black text-white px-4 py-2 rounded-full text-xs font-semibold shadow-xs"
              >
                <span>View All FAQs</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {/* Right Column: Citizen Support & Helpdesk Form */}
            <div id="contact" className="lg:col-span-6 bg-white border border-[#DEDCD5] rounded-3xl p-5 sm:p-6 shadow-xs">
              <div className="mb-4">
                <span className="text-xs font-bold tracking-wider uppercase text-[#A84A1A] block mb-0.5">
                  GET IN TOUCH
                </span>
                <h3 className="text-xl font-heading font-extrabold text-[#111318] tracking-tight">
                  Citizen Support &amp; Helpdesk
                </h3>
                <p className="text-xs text-[#687180] mt-0.5">
                  Have questions or need assistance? Our team is here to help.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                <form onSubmit={handleContactSubmit} className="md:col-span-7 space-y-2.5">
                  {contactSuccess ? (
                    <div className="p-3.5 rounded-xl bg-[#E3F5EC] border border-[#23845B]/30 text-[#23845B] text-xs font-medium">
                      Thank you! Your inquiry has been submitted to the state support team.
                    </div>
                  ) : (
                    <>
                      {contactError && (
                        <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                          {contactError}
                        </div>
                      )}

                      <div>
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={contactForm.fullName}
                          onChange={(e) => setContactForm({ ...contactForm, fullName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#DEDCD5] text-xs text-[#111318] placeholder-[#687180]/60 focus:outline-none focus:border-[#111318] bg-[#F7F6F2]"
                        />
                      </div>

                      <div>
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#DEDCD5] text-xs text-[#111318] placeholder-[#687180]/60 focus:outline-none focus:border-[#111318] bg-[#F7F6F2]"
                        />
                      </div>

                      <div>
                        <input
                          type="tel"
                          placeholder="Contact Number"
                          value={contactForm.contactNumber}
                          onChange={(e) => setContactForm({ ...contactForm, contactNumber: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#DEDCD5] text-xs text-[#111318] placeholder-[#687180]/60 focus:outline-none focus:border-[#111318] bg-[#F7F6F2]"
                        />
                      </div>

                      <div>
                        <textarea
                          rows={3}
                          placeholder="Your Message"
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#DEDCD5] text-xs text-[#111318] placeholder-[#687180]/60 focus:outline-none focus:border-[#111318] bg-[#F7F6F2] resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={contactLoading}
                        className="w-full flex items-center justify-center gap-1.5 bg-[#111318] hover:bg-black text-white text-xs font-semibold py-2 px-4 rounded-full transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                      >
                        <span>{contactLoading ? "Sending..." : "Send Inquiry"}</span>
                        <ArrowRight size={12} />
                      </button>
                    </>
                  )}
                </form>

                {/* Right Helpdesk Info Panel */}
                <div className="md:col-span-5 bg-[#FAF9F5] border border-[#DEDCD5] rounded-2xl p-3.5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#FBE9DA] text-[#F36D21] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#F36D21]">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-heading font-bold text-[#111318]">support@portal.assam</div>
                        <div className="text-xs text-[#687180]">Support Email</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#FBE9DA] text-[#F36D21] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#F36D21]">
                          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-heading font-bold text-[#111318]">1800-345-3677</div>
                        <div className="text-xs text-[#687180]">Toll-Free Helpline</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#FBE9DA] text-[#F36D21] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#F36D21]">
                          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-heading font-bold text-[#111318]">Mon – Sat: 9AM – 5PM</div>
                        <div className="text-xs text-[#687180]">Operational Hours</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-[#DEDCD5] flex justify-center opacity-30">
                    <svg viewBox="0 0 100 80" className="w-12 h-10 fill-[#687180]" aria-hidden="true">
                      <polygon points="50,10 20,40 80,40" />
                      <polygon points="50,30 15,65 85,65" />
                      <rect x="40" y="65" width="20" height="15" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
