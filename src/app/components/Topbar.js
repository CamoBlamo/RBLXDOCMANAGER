import Link from "next/link";

function Topbar() {
    return (
<div className="Topbar">
    <div className="topbar-inner">
      <nav>
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/features">Features</Link></li>
          <li><Link href="/started">Getting Started</Link></li>
          <li><Link href="/contacts">Contact Us</Link></li>
          <li><Link href="/testimonials">Testimonials</Link></li>
          <li><Link href="/staff">Staff</Link></li>
          <li><Link href="/sign-in">Sign In</Link></li>
        </ul>
      </nav>
    </div>
  </div>
    );
}

export default Topbar;