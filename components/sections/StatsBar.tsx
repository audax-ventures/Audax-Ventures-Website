import Image from "next/image";

const trustedBy: { name: string; logo: string; logoOnly: boolean; url: string }[] = [
  { name: "LinkGlobal Network", logo: "/logos/linkglobal.avif",     logoOnly: true, url: "https://www.linkglobalnetwork.io/" },
  { name: "Verclara",           logo: "/logos/verclara.png",        logoOnly: true, url: "https://www.verclara.io/"          },
  { name: "H2MB",               logo: "/logos/h2mb.avif",           logoOnly: true, url: "https://www.h2mb.ca/"              },
  { name: "Jetz Aviation",      logo: "/logos/jetzaviationlogo.png", logoOnly: true, url: "https://jetzaviation.com/"        },
  { name: "FundEze",            logo: "/logos/fundeze.png",         logoOnly: true, url: "https://www.fundeze.io/"           },
  { name: "MigrateEzy",         logo: "/logos/migrateezy.png",      logoOnly: true, url: "https://www.migrateezy.com/"       },
];

export default function StatsBar() {
  return (
    <section className="bg-white py-14 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[10px] tracking-widest uppercase text-[#9CA3AF] font-semibold mb-8">
          Trusted by Innovative Organizations
        </p>
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-x-6 gap-y-5 sm:gap-x-8 lg:gap-x-14">
          {trustedBy.map((co) => (
            <a
              key={co.name}
              href={co.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={co.name}
              className="flex items-center gap-2 flex-shrink-0 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all duration-300"
            >
              <div className="relative h-6 w-14 sm:h-9 sm:w-24 lg:h-10 lg:w-28 flex-shrink-0">
                <Image src={co.logo} alt={co.name} fill className="object-contain" sizes="(max-width: 640px) 56px, (max-width: 1024px) 96px, 128px" />
              </div>
              {!co.logoOnly && (
                <span className="text-[#374151] font-heading font-bold text-sm tracking-tight select-none">
                  {co.name}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
