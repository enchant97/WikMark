import Link from "next/link";

export default function Footer() {
  return (
    <footer className="siteFooter">
      <hr />
      <p>WikMark Reader: E-Ink friendly WikMark viewer.</p>
      <Link className="btn" href="/-">Back To WikMark</Link>
    </footer>
  )
}
