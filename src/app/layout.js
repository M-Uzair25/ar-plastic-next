import "@/styles/style.scss";

export const metadata = {
  title: 'Abdul Razzaq Plastic Dashboard',
  description: 'Made by Muhammad Uzair',
}

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
