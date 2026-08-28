import Reveal from "@/components/shared/Reveal";
import { WhyChooseUsCardProps } from "@/types";

// ما إلها "use client" — عم تترجم مسبقاً بالسيرفر (WhyChooseUs.tsx) وبتوصلها
// title/description جاهزين. لسا فيها Reveal (client component) كـ child، وهاد شغال
// عادي بالـ RSC — سيرفر كومبوننت فيه يعرض كلاينت كومبوننت جواه بدون أي مشكلة.
export default function WhyChooseUsCard({
  icon: Icon,
  title,
  description,
  index,
}: WhyChooseUsCardProps) {
  return (
    <Reveal
      delay={Math.min(index * 0.08, 0.32)}
      className="group relative overflow-hidden rounded-[28px] border border-white/50 bg-background/25 p-6 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_8px_30px_-12px_rgba(29,6,52,0.15)] backdrop-blur-lg backdrop-saturate-150 transition-[background-color,box-shadow] duration-300 hover:bg-background/40 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_20px_45px_-20px_rgba(29,6,52,0.25)] sm:p-7 sm:text-start"
      whileHover={{
        y: -4,
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      <div className="flex items-center justify-center gap-4 sm:justify-start">
        <span className="font-serif text-5xl font-bold leading-none text-primary transition-colors duration-300 xl:text-6xl">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/20 text-primary transition-colors duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-second">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
      </div>

      <h3 className="mt-4 font-serif text-lg font-bold text-primary">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-[26ch] text-sm leading-relaxed text-foreground/70 sm:mx-0">
        {description}
      </p>

      <span className="mx-auto mt-4 block h-px w-10 bg-primary/25 transition-[width,background-color] duration-300 group-hover:w-16 group-hover:bg-primary sm:mx-0" />
    </Reveal>
  );
}