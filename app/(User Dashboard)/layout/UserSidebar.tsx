"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    name: "Home",
    href: "/user",
  },
  {
    name: "Reservations",
    href: "/user/reservations",
  },
  {
    name: "Trails",
    href: "/user/trails",
  },
    {
    name: "Contacts",
    href: "/user/contacts",
  },

];

export default function UserSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-20 h-[calc(100vh-5rem)] w-72 border-r border-zinc-800 bg-zinc-900">

      <div className="flex flex-col gap-4 p-6">

        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-xl px-4 py-4 font-medium transition ${
              pathname === link.href
                ? "bg-emerald-500 text-black"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            {link.name}
          </Link>
        ))}

      </div>

    </aside>
  );
}