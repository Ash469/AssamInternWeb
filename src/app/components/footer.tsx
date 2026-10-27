import React from "react";
import Link from "next/link";
import { MapPin, Mail, Phone, ShieldCheck } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#111318] text-[#F7F6F2] border-t border-[#262A33]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#262A33]">
          {/* Brand info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg font-heading font-extrabold text-white tracking-tight">
                Jan Sambad
              </span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#F36D21] bg-[#F36D21]/15 px-2 py-0.5 rounded border border-[#F36D21]/30">
                ASSAM
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed max-w-md mb-4">
              A unified digital public infrastructure for Assamese citizens to report, track, and resolve civic grievances directly with district officials across all 35 districts.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
              <ShieldCheck size={15} className="text-[#23845B]" />
              <span>Official Citizen Grievance Redressal System</span>
            </div>
          </div>

          {/* Citizen Links */}
          <div>
            <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-[#94A3B8] mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/userlogin" className="text-[#CBD5E1] hover:text-white transition-colors">
                  Citizen Login
                </Link>
              </li>
              <li>
                <Link href="/usersignup" className="text-[#CBD5E1] hover:text-white transition-colors">
                  New Citizen Registration
                </Link>
              </li>
              <li>
                <Link href="/application/status" className="text-[#CBD5E1] hover:text-white transition-colors">
                  Track Application Status
                </Link>
              </li>
              <li>
                <Link href="/application/new" className="text-[#CBD5E1] hover:text-white transition-colors">
                  Submit Grievance
                </Link>
              </li>
              <li>
                <Link href="/admin/adminlogin" className="text-[#94A3B8] hover:text-white transition-colors">
                  Official Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Helpdesk */}
          <div>
            <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-[#94A3B8] mb-4">
              State Helpdesk
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2 text-[#CBD5E1]">
                <MapPin size={14} className="text-[#F36D21] mt-0.5 flex-shrink-0" />
                <span>Dispur, Guwahati, Assam - 781006</span>
              </div>
              <div className="flex items-start gap-2 text-[#CBD5E1]">
                <Mail size={14} className="text-[#F36D21] mt-0.5 flex-shrink-0" />
                <span>support@portal.assam</span>
              </div>
              <div className="flex items-start gap-2 text-[#CBD5E1]">
                <Phone size={14} className="text-[#F36D21] mt-0.5 flex-shrink-0" />
                <span>1800-345-3677 (Toll-Free)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <p>© {new Date().getFullYear()} Jan Sambad Assam. People · Districts · A Stronger Assam.</p>
          <div className="flex items-center gap-4">
            <Link href="/#about" className="hover:text-[#94A3B8]">About</Link>
            <span>•</span>
            <Link href="/#how-it-works" className="hover:text-[#94A3B8]">How It Works</Link>
            <span>•</span>
            <Link href="/#faqs" className="hover:text-[#94A3B8]">FAQs</Link>
            <span>•</span>
            <Link href="/#contact" className="hover:text-[#94A3B8]">Helpdesk</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
