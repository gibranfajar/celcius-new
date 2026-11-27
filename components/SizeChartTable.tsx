/**
 * A product's size chart, as the API serves it (a rendered HTML table, or
 * paragraphs for an older free-form chart). Scrolls sideways when wider
 * than its column.
 */
export default function SizeChartTable({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={`overflow-x-auto [&_p]:mb-2 [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs [&_td]:border-b [&_td]:border-zinc-100 [&_td]:px-3 [&_td]:py-2.5 [&_td]:text-center [&_td]:whitespace-nowrap [&_td:first-child]:text-left [&_td:first-child]:font-semibold [&_td:first-child]:text-black [&_th]:bg-zinc-50 [&_th]:px-3 [&_th]:py-2.5 [&_th]:text-center [&_th]:text-[0.625rem] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-zinc-600 [&_th:first-child]:text-left ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
