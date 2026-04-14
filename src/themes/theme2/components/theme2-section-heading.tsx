type Theme2SectionHeadingProps = {
  title: string;
};

export function Theme2SectionHeading({ title }: Theme2SectionHeadingProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <div className="border-t border-[#b6bebb] pt-8 text-center">
        <h2 className="text-xl uppercase tracking-[0.32em] text-[#2f3f3c]">{title}</h2>
      </div>
    </div>
  );
}
