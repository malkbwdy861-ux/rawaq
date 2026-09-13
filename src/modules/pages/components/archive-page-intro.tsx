type ArchivePageIntroProps = {
  description: string;
};

export function ArchivePageIntro({ description }: ArchivePageIntroProps) {
  return (
    <section className="public-container py-12 md:py-16">
      <p className="max-w-[72ch] text-[1.0625rem] leading-[1.95] text-text-secondary md:text-lg">{description}</p>
    </section>
  );
}
