import Nav from '../components/Nav'
import '../styles/globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-brand-dark">
        <Nav />
        <main className="pt-20 lg:pt-24">
          {children}
        </main>
      </body>
    </html>
  )
}