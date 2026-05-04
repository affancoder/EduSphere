import Link from "next/link";
import { Diamond, Globe, Mail, MessageCircle, Share2 } from "lucide-react";

const footerLinks = [
  {
    title: "Platform",
    links: ["Courses", "Mentors", "Community", "Pricing"],
  },
  {
    title: "Company",
    links: ["About Us", "Careers", "Press", "Contact"],
  },
  {
    title: "Resources",
    links: ["Blog", "Case Studies", "Guidelines", "FAQ"],
  },
];

export default function Footer() {
  return (
    <footer className="bg-background border-t border-gold/10 pt-20 pb-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <Diamond className="w-5 h-5 text-gold transition-transform duration-500 group-hover:rotate-45" />
              <span className="font-display text-2xl tracking-wide text-text-primary">
                Edu<span className="text-gold">Sphere</span>
              </span>
            </Link>
            <p className="font-body text-text-muted text-sm leading-relaxed max-w-sm mb-8">
              An exclusive digital sanctuary for those who seek mastery. 
              Bridging the gap between potential and peak performance.
            </p>
            <div className="flex items-center gap-5">
              {[Globe, Mail, MessageCircle, Share2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="text-text-muted hover:text-gold transition-colors duration-300"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {footerLinks.map((column, i) => (
            <div key={i}>
              <h4 className="font-display text-lg text-text-primary mb-6">
                {column.title}
              </h4>
              <ul className="space-y-4">
                {column.links.map((link, j) => (
                  <li key={j}>
                    <Link
                      href="#"
                      className="font-body text-sm text-text-muted hover:text-gold transition-colors duration-300"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-gold/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-body text-[10px] tracking-widest uppercase text-text-muted">
            © 2024 EduSphere. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link href="#" className="font-body text-[10px] tracking-widest uppercase text-text-muted hover:text-gold transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="font-body text-[10px] tracking-widest uppercase text-text-muted hover:text-gold transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
