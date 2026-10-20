// The real layout (html, body, providers) is app/[locale]/layout.tsx. This pass-through root layout
// exists so Next can render not-found/error pages on the server (it needs a root layout to exist).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
