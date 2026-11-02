import Link from "next/link";
import NavBar from "../components/nav_bar";
import Footer from "../components/footer";

const photos = [
  {
    title: "Bamboo home in Majuli",
    author: "Joli Rumi",
    source: "https://commons.wikimedia.org/wiki/File:A_bamboo_and_thatch_house_in_Majuli,_Assam.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  {
    title: "Tea estate in North Lakhimpur",
    author: "Joli",
    source: "https://commons.wikimedia.org/wiki/File:A_tea_estate_in_North_Lakhimpur,_Assam.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  {
    title: "Guwahati city and Brahmaputra river",
    author: "Arnab Ganguly",
    source: "https://commons.wikimedia.org/wiki/File:Guwahati_City_Off_Brahmaputra_Coast_(189246519).jpeg",
    license: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
];

export default function PhotoCreditsPage() {
  return (
    <div className="min-h-screen bg-[#fbfaf6]">
      <NavBar />
      <main className="mx-auto max-w-4xl px-6 py-20 sm:px-10">
        <Link href="/" className="text-sm font-semibold text-[#35614a] hover:underline">← Back to home</Link>
        <p className="mt-10 text-xs font-bold uppercase tracking-[.2em] text-[#bc664b]">About the imagery</p>
        <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-[#213b2b] sm:text-5xl">Photo credits</h1>
        <p className="mt-5 max-w-2xl leading-7 text-[#647267]">These photographs of Assam were sourced from Wikimedia Commons, resized, and converted to WebP for the website. Original photographers retain credit under their respective licenses.</p>
        <div className="mt-10 divide-y divide-[#dce4d9] rounded-3xl border border-[#dce4d9] bg-white px-7">
          {photos.map((photo) => (
            <div key={photo.title} className="py-7">
              <h2 className="font-heading text-xl font-bold text-[#213b2b]">{photo.title}</h2>
              <p className="mt-2 text-sm text-[#647267]">Photo by {photo.author} · <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-[#2a684b]">{photo.license}</a></p>
              <a href={photo.source} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-[#2a684b] underline">View original on Wikimedia Commons ↗</a>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
