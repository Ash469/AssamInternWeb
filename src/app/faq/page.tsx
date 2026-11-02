'use client'
import { useState } from 'react';
import NavBar from '../components/nav_bar';
import { FaChevronDown, FaChevronUp} from 'react-icons/fa';
import Footer from '../components/footer';
import Link from 'next/link';

export default function FAQPage() {
  // State to track which FAQ is open
  const [openFaq, setOpenFaq] = useState<number | null>(null);



  // Toggle FAQ open/close
  const toggleFaq = (index: number) => {
    if (openFaq === index) {
      setOpenFaq(null);
    } else {
      setOpenFaq(index);
    }
  };

  // FAQ data
  const faqItems = [
    {
      question: "How do I submit a civic grievance?",
      answer: "Create a citizen account and wait for district verification. Then select Submit a Grievance, choose a category and district, describe the issue, and attach a photo or document if you have one."
    },
    {
      question: "How can I check the status of my application?",
      answer: "Select Track Application from the homepage or Applications in the navigation bar. Your grievance list shows current status, district details, and official responses."
    },
    {
      question: "Do I need to upload a document?",
      answer: "An attachment is optional. If you have a clear photo of the issue or a relevant document, include it to give the district team helpful context."
    },
    {
      question: "How long does it take to process my application?",
      answer: "Timing depends on the issue and your district's review process. You can see the most recent status and any official remarks on the tracking page."
    },
    {
      question: "What should I do if my application is rejected?",
      answer: "Open the grievance details to review the district response. If you need to provide clearer information, you can submit a new grievance with updated details."
    },
    {
      question: "Can I update a grievance after submitting it?",
      answer: "Submitted grievances cannot be edited from the portal. If something important is missing, contact the helpdesk or submit a new grievance with the correct information."
    },
    {
      question: "Can I keep a copy of my grievance details?",
      answer: "Yes. Open your application on the tracking page and use Print Receipt to save or print its details and status."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f7f8f5]">
      {/* Navbar */}
      <NavBar />

      {/* Hero Section */}
      <section className="page-hero page-hero--faq relative py-20 sm:py-24 px-6">
        <div className="relative z-10 max-w-5xl mx-auto">
          <p className="text-xs font-bold tracking-[.2em] uppercase text-[#f7c6a8] mb-4">Citizen helpdesk</p>
          <h1 className="text-4xl sm:text-6xl font-heading font-extrabold max-w-2xl leading-[1.02]">Answers before you need to ask.</h1>
          <p className="text-white/75 text-base max-w-xl mt-5 leading-relaxed">Learn how to register, submit a grievance, share evidence, and follow district action.</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="bg-[#eaf2ee] py-16 px-6 md:px-16 min-h-screen">
        <div className="max-w-3xl mx-auto">

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {faqItems.map((faq, index) => (
              <div 
                key={index} 
                className="interactive-card bg-white rounded-2xl border border-[#dce5df] shadow-sm overflow-hidden"
              >
                <button
                  className="w-full px-6 py-4 flex justify-between items-center focus:outline-none"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-heading font-semibold text-left text-[#12221f]">{faq.question}</span>
                  {openFaq === index ? (
                    <FaChevronUp className="text-[#d95f31]" />
                  ) : (
                    <FaChevronDown className="text-[#d95f31]" />
                  )}
                </button>
                
                {openFaq === index && (
                  <div className="px-6 pb-4 text-[#40524e] border-t border-[#eaf0eb] pt-3 leading-relaxed">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="bg-[#123b47] text-white rounded-3xl shadow-sm p-7 mt-8 border border-[#1e5963] flex flex-col md:flex-row items-center justify-between">
            <div className="mb-3 md:mb-0">
                <h3 className="text-lg font-heading font-bold text-white mb-1">
                Still have questions?
              </h3>
                <p className="text-white/65 text-sm">
                Our support team is here to help with any questions.
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/#contact"
                className="px-4 py-2.5 bg-[#d95f31] text-white rounded-full hover:bg-[#bd4d25] transition text-sm font-semibold flex items-center justify-center"
              >
                Ask a Question
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2.5 bg-white border border-white/30 text-[#123b47] rounded-full hover:bg-[#edf5f1] transition text-sm font-semibold flex items-center justify-center"
              >
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
