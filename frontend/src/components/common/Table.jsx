export default function Table({ columns, data, keyField = 'id' }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-current/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-current/5 text-left">
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 font-medium text-current/60">{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row[keyField]} className="border-t border-current/10 hover:bg-current/5">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3">{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
