"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
export default function Footer() {
  const path = usePathname();
  if (path.startsWith("/p/")) return null;
  return <footer className="site-footer"><div className="container footer-inner"><Link href="/" className="brand"><Icon name="spark" size={20} /><span>Portfolio Generator.</span></Link><p>A little more personal. A lot more you.</p><span>© {new Date().getFullYear()}</span><Link href="/p/demo-portfolio">Explore the demo <Icon name="external" size={13} /></Link></div></footer>;
}
