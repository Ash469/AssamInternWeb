import Image from "next/image";
import { ArrowUpRight, CheckCircle2, MapPin } from "lucide-react";

type AuthShowcaseProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export default function AuthShowcase({ eyebrow, title, description }: AuthShowcaseProps) {
  return (
    <aside className="relative hidden lg:flex min-h-[600px] flex-col justify-between overflow-hidden rounded-[2rem] bg-[#123b47] p-10 text-white shadow-[0_25px_70px_rgba(18,59,71,.18)]">
      <Image
        src="/images/tea-estate.webp"
        alt="Tea estate in North Lakhimpur, Assam"
        fill
        sizes="(max-width: 1024px) 0px, 50vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#123b47]/75 via-[#123b47]/25 to-[#082523]/90" />
      <div className="relative flex items-center justify-between">
        <span className="rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-bold tracking-[.14em] uppercase backdrop-blur-md">{eyebrow}</span>
        <ArrowUpRight className="text-white/80" size={22} aria-hidden="true" />
      </div>
      <div className="relative">
        <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#ffd1af]"><MapPin size={16} aria-hidden="true" /> Built for Assam</div>
        <h2 className="max-w-md font-heading text-5xl font-extrabold leading-[1.05] tracking-tight">{title}</h2>
        <p className="mt-5 max-w-sm text-base leading-relaxed text-white/80">{description}</p>
        <div className="mt-10 flex flex-wrap gap-3 text-xs font-semibold">
          <span className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 backdrop-blur-md"><CheckCircle2 size={15} /> Transparent tracking</span>
          <span className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 backdrop-blur-md"><CheckCircle2 size={15} /> District-level action</span>
        </div>
      </div>
    </aside>
  );
}
