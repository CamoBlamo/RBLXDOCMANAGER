import Link from "next/link";

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <p className="footer-title">Roblox Group Document Manager</p>
                <p className="footer-copy">Built for group leaders and staff teams.</p>
                <div className="footer-links">
                    <Link href="/features">Features</Link>
                    <Link href="/contacts">Contact</Link>
                    <Link href="/sign-in">Sign In</Link>
                    <a href="mailto:camolid93@gmail.com">Support Email</a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;