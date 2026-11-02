"use client";

import { Menu, X, LogOut, ArrowUpRight, ListChecks, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

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
    <header className="sticky top-0 z-50 bg-[#fbfaf6]/95 backdrop-blur-xl border-b border-[#e6eadf]">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-16 xl:px-24">
        <div className="flex items-center justify-between h-[5rem]">
          {/* Left: Brand mark */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-11 h-11 rounded-[14px] bg-[#234a36] text-[#e8edce] flex items-center justify-center flex-shrink-0 group-hover:-rotate-6 transition-transform">
              <MessagesSquare size={25} strokeWidth={1.8} aria-hidden="true" />
            </div>
            <div>
               <span className="text-lg font-heading font-bold text-[#203a2b] tracking-tight block leading-tight">
                Jan Sambad
              </span>
               <span className="text-[10px] font-bold tracking-[.3em] text-[#b86a4d] uppercase block">
                ASSAM
              </span>
            </div>
          </Link>

          {/* Center: Sleek navigation links with terracotta active dot */}
           <nav className="hidden xl:flex items-center gap-7">
            {navLinks.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setActiveSection(item.id)}
                 className="relative text-[13px] font-semibold text-[#526456] hover:text-[#244f37] transition-colors py-1"
              >
                {item.label}
                {activeSection === item.id && (
                   <span className="absolute -bottom-2 left-0 w-full h-0.5 rounded-full bg-[#bd704e]" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="hidden xl:flex items-center gap-2.5">
            {isLoggedIn ? (
              <>
                <Link
                  href="/application/status"
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#234a36] hover:bg-[#326448] text-white text-xs font-semibold transition-all shadow-xs"
                >
                  <ListChecks size={13} />
                  <span>Applications</span>
                </Link>
                <Link
                  href="/profile"
                   className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#dce5df] hover:bg-[#edf5f1] text-[#12221f] text-xs font-semibold transition-all"
                >
                  <div className="w-4 h-4 rounded-full bg-[#111318] text-white flex items-center justify-center text-xs font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate max-w-[100px]">{userName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                   className="p-1.5 rounded-full text-[#71817d] hover:text-rose-600 hover:bg-rose-50 text-xs transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut size={14} />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/userlogin"
                   className="px-4 py-2.5 rounded-full bg-transparent text-[#244936] hover:bg-[#e9efdf] text-xs font-semibold transition-all"
                >
                  Citizen Login
                </Link>
                <Link
                  href="/admin/adminlogin"
                   className="px-4 py-2.5 rounded-full bg-[#234a36] hover:bg-[#326448] text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <span>Admin Login</span>
                   <ArrowUpRight size={14} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="xl:hidden p-2 rounded-xl text-[#12221f] hover:bg-[#eaf2ee] focus:outline-none transition-colors"
            aria-label="Toggle navigation"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {isMenuOpen && (
        <div className="xl:hidden bg-[#fbfaf6] border-t border-[#dce5df] px-6 py-3 space-y-1 shadow-lg">
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
                   <ArrowUpRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
