import { cn } from "@/lib/utils";

/**
 * A reusable, high-contrast premium table component for medical data
 */
export function DataTable({ columns, data, className }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">No records found</p>
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-separate border-spacing-y-2">
        <thead>
          <tr className="text-left">
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr 
              key={rowIdx} 
              className="group bg-white hover:bg-slate-50 transition-all duration-200 shadow-sm shadow-slate-100"
            >
              {columns.map((col, colIdx) => (
                <td 
                  key={colIdx} 
                  className={cn(
                    "px-6 py-4 text-sm text-slate-600 border-y border-slate-50 first:border-l first:rounded-l-xl last:border-r last:rounded-r-xl transition-colors",
                    colIdx === 0 && "text-slate-900 font-bold"
                  )}
                >
                  {col.cell ? col.cell(row) : row[col.accessorKey]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
