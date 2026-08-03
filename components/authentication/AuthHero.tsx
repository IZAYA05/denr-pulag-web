import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
});

type AuthHeroProps = {
  subtitle: string;
  title: string;
  description: string;
};

export default function AuthHero({
  subtitle,
  title,
  description,
}: AuthHeroProps) {
  return (
    <div className="flex flex-col justify-center">
      <p
        className={`${montserrat.className} text-5xl font-light tracking-wide`}
      >
        {subtitle}
      </p>

      <h1
        className={`${montserrat.className} mt-2 text-7xl font-extrabold italic tracking-tight text-emerald-400`}
      >
        {title}
      </h1>

      <p className="mt-8 max-w-xl text-lg leading-8 text-zinc-300">
        {description}
      </p>
    </div>
  );
}