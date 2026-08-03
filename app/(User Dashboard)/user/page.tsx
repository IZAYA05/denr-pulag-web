import Image from "next/image";

export default function UserDashboardPage() {
  return (
    <div className="relative z-10 px-8 py-10">

      {/* Background */}
      <Image
        src="/Pulag.jpg"
        alt="Mount Pulag"
        fill
        className="object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/75" />

      {/* Dashboard */}
      <div className="relative z-10">

        <p className="uppercase tracking-[0.3em] text-emerald-400">
          Dashboard
        </p>

        <h1 className="mt-3 text-5xl font-bold">
          Welcome Back,
          <span className="block text-emerald-400">
            User
          </span>
        </h1>

        <p className="mt-5 max-w-2xl text-zinc-400">
          Monitor reservations, users, tours, and reports from
          the official E-PULAG administration dashboard.
        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        {[
          ["Users", "120"],
          ["Reservations", "75"],
          ["Tours", "3"],
          ["Reports", "18"],
        ].map(([title, value]) => (
          <div
            key={title}
            className="rounded-3xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl p-8 transition hover:-translate-y-1 hover:border-emerald-400"
          >
            <p className="text-zinc-400">
              {title}
            </p>

            <h2 className="mt-4 text-5xl font-bold">
              {value}
            </h2>
          </div>
        ))}

      </div>

      <div className="mt-10 rounded-3xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl p-8">

        <h2 className="text-2xl font-bold">
          Recent Activity
        </h2>

        <div className="mt-6 space-y-4 text-zinc-400">

        </div>

      </div>

    </div>
  );
}