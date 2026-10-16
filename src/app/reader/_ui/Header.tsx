import Link from "next/link";
import ForceRefreshBtn from "./ForceRefreshBtn";

export default function Header() {
  return (
    <header className="siteHeader">
      <nav>
        <ul>
          <li><Link className="btn" href="/reader/-">Home</Link></li>
          <li><Link className="btn" href="/reader/settings">Settings</Link></li>
        </ul>
      </nav>
      <menu>
        <li><ForceRefreshBtn /></li>
        <li><a className="btn" href="#mainContent">Skip to content</a></li>
      </menu>
    </header>
  )
}
