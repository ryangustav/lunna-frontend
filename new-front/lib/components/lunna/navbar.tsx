import Image from "next/image"

const navLinks = [
  { label: "Recursos" },
  { label: "Comandos" },
  { label: "Dashboard" },
  { label: "Suporte" },
]

export function Navbar() {
  return (
    <header
      className="sticky top-0 z-50 w-full bg-white"
      style={{ borderBottom: "0.5px solid rgba(22,22,26,0.08)" }}
    >
      <div
        className="mx-auto flex h-[60px] max-w-[860px] items-center justify-between"
        style={{ paddingInline: "28px" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="relative flex h-[34px] w-[34px] shrink-0 overflow-hidden rounded-full"
            style={{ border: "2px solid #7c3aed" }}
          >
            <Image
              src="/lunna-banner.jpg"
              alt="Avatar da Lunna"
              fill
              className="object-cover object-top"
            />
          </div>
          <span className="text-[17px] font-bold leading-none text-[#16161a]">
            Lu<span className="text-[#7c3aed]">nna</span>
          </span>
        </div>

        {/* Nav links */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href="#"
              className="rounded-full px-[14px] py-[7px] text-sm font-medium text-[#16161a] transition-colors hover:bg-[#f7f7fa]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA button */}
        <a
          href="#"
          className="rounded-full bg-[#7c3aed] px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          Adicionar ao Discord
        </a>
      </div>
    </header>
  )
}
