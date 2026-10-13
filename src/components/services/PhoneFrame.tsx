/** Phone mockup running a live page in an iframe (used for the e-catalog demo). */
export default function PhoneFrame({ src, title }: { src: string; title: string }) {
  return (
    <div className="mx-auto w-full max-w-[22rem] rounded-[2.75rem] bg-ink p-3 shadow-lift">
      <div className="relative h-[min(72vh,42rem)] min-h-[32rem] overflow-hidden rounded-[2.1rem] bg-paper">
        <span
          className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-ink"
          aria-hidden="true"
        />
        <iframe src={src} title={title} loading="lazy" className="h-full w-full border-0 pt-8" />
      </div>
    </div>
  );
}
