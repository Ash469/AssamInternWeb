"use client";

import { Menu, X, LogOut, ArrowRight, ListChecks } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string>("Citizen");
  const [activeSection, setActiveSection] = useState<string>("home");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const profileStr = localStorage.getItem("userProfile");

    if (token) {
      setIsLoggedIn(true);
      if (profileStr) {
        try {
          const u = JSON.parse(profileStr);
          const fullName =
            u.fullName ||
            (u.firstName ? `${u.firstName} ${u.lastName || ""}`.trim() : "");
          setUserName(fullName || "Citizen");
        } catch { /* noop */ }
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    router.push("/");
  };

  const navLinks = [
    { label: "Home", href: "/", id: "home" },
    { label: "About", href: "/#about", id: "about" },
    { label: "How It Works", href: "/#how-it-works", id: "how-it-works" },
    { label: "Categories", href: "/#categories", id: "categories" },
    { label: "FAQs", href: "/#faqs", id: "faqs" },
    { label: "Contact", href: "/#contact", id: "contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#F7F6F2]/95 backdrop-blur-md border-b border-[#E8E6DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Brand mark */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
              <Image src="/logo.png" alt="Jan Sambad Logo" width={30} height={30} className="object-contain" priority />
            </div>
            <div>
              <span className="text-sm font-heading font-extrabold text-[#111318] tracking-tight block leading-tight">
                Jan Sambad
              </span>
              <span className="text-xs font-bold tracking-widest text-[#687180] uppercase block">
                ASSAM
              </span>
            </div>
          </Link>

          {/* Center: Sleek navigation links with terracotta active dot */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setActiveSection(item.id)}
                className="relative text-xs font-semibold text-[#394454] hover:text-[#111318] transition-colors py-1 tracking-wide"
              >
                {item.label}
                {activeSection === item.id && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#F36D21]" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {isLoggedIn ? (
              <>
                <Link
                  href="/application/status"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#285A91] hover:bg-[#1f4773] text-white text-xs font-semibold transition-all shadow-xs"
                >
                  <ListChecks size={13} />
                  <span>Applications</span>
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#DEDCD5] hover:bg-[#FAF9F5] text-[#111318] text-xs font-semibold transition-all"
                >
                  <div className="w-4 h-4 rounded-full bg-[#111318] text-white flex items-center justify-center text-xs font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate max-w-[100px]">{userName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1 rounded-full text-[#687180] hover:text-rose-600 hover:bg-rose-50 text-xs transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut size={14} />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/userlogin"
                  className="px-4 py-1.5 rounded-full bg-white border border-[#DEDCD5] text-[#111318] hover:bg-[#F0EEE6] text-xs font-semibold transition-all"
                >
                  Citizen Login
                </Link>
                <Link
                  href="/admin/adminlogin"
                  className="px-4 py-1.5 rounded-full bg-[#111318] hover:bg-black text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <span>Admin Login</span>
                  <ArrowRight size={12} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-[#111318] hover:bg-[#EAE8E0] focus:outline-none transition-colors"
            aria-label="Toggle navigation"
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#F7F6F2] border-t border-[#E8E6DF] px-6 py-3 space-y-1">
          {navLinks.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => {
                setActiveSection(item.id);
                setIsMenuOpen(false);
              }}
              className="block px-3 py-2 rounded-lg text-xs font-semibold text-[#111318] hover:bg-[#EAE8E0] transition-colors"
            >
              {item.label}
            </Link>
          ))}

          <div className="pt-2.5 border-t border-[#DEDCD5] space-y-2 mt-1">
            {isLoggedIn ? (
              <>
                <Link
                  href="/application/status"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 w-full px-4 py-2 rounded-full text-xs font-semibold bg-[#285A91] text-white"
                >
                  <ListChecks size={13} />
                  <span>Applications</span>
                </Link>
                <div className="flex items-center justify-between px-2 pt-1">
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 text-xs font-semibold text-[#111318]"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#111318] text-white flex items-center justify-center text-[10px] font-bold">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <span>{userName}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/userlogin"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-3 py-2 text-center rounded-full bg-white border border-[#DEDCD5] text-xs font-semibold text-[#111318]"
                >
                  Citizen Login
                </Link>
                <Link
                  href="/admin/adminlogin"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-3 py-2 text-center rounded-full bg-[#111318] text-white text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <span>Admin Login</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}