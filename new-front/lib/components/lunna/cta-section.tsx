export function CtaSection() {
  return (
    <section
      className="mx-auto mt-[52px] w-full max-w-[860px] pb-16"
      style={{ paddingInline: "28px" }}
    >
      <div
        className="rounded-[14px] px-8 py-11 text-center"
        style={{
          backgroundColor: "#ede9fe",
          border: "0.5px solid rgba(124,58,237,0.2)",
        }}
      >
        <h2 className="mb-4 text-balance text-[26px] font-bold leading-tight tracking-[-0.5px] text-[#16161a]">
          Pronto para transformar seu servidor?
        </h2>
        <p className="mx-auto mb-7 text-[15px] leading-[1.7] text-[#5a5a72]" style={{ maxWidth: "420px" }}>
          Junte-se a mais de 2.400 servidores que já usam a Lunna para criar comunidades mais engajadas e divertidas.
        </p>
        <a
          href="#"
          className="inline-block rounded-full bg-[#7c3aed] px-7 py-3.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          Adicionar ao Discord grátis
        </a>
      </div>
    </section>
  )
}
