import type { ReactNode } from "react";

export type FigureProps = { id: string; number: number; title: string };

const countFormat = new Intl.NumberFormat("en-US");
export const count = (value: number) => countFormat.format(value);
export const percent = (value: number) => `${(value * 100).toFixed(2)}%`;

export function DataTable({
  label,
  headings,
  rows,
  disclosure,
}: {
  label: string;
  headings: readonly string[];
  rows: readonly (readonly ReactNode[])[];
  disclosure?: string;
}) {
  const table = (
    <div className="pd-table-scroll" tabIndex={0} role="region" aria-label={label}>
      <table className="pd-table">
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr>{headings.map((heading) => <th key={heading} scope="col">{heading}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map(([first, ...values], index) => (
            <tr key={index}>
              <th scope="row">{first}</th>
              {values.map((value, column) => <td key={column}>{value}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return disclosure ? (
    <details className="pd-details">
      <summary className="bi-focusable rounded-sm">{disclosure}</summary>
      {table}
    </details>
  ) : table;
}

export function ClassLegend({ benign = true, malicious = true }: { benign?: boolean; malicious?: boolean }) {
  return (
    <div className="pd-legend">
      {benign && <span><i className="pd-swatch pd-benign" />Benign</span>}
      {malicious && <span><i className="pd-swatch pd-malicious" />Malicious</span>}
    </div>
  );
}
