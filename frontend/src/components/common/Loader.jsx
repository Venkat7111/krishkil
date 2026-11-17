export default function Loader({ size = 40, label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <svg width={size} height={size} viewBox="0 0 50 50" className="animate-spin">
        <circle cx="25" cy="25" r="20" fill="none" stroke="var(--color-paper-dim)" strokeWidth="5" />
        <circle
          cx="25" cy="25" r="20" fill="none"
          stroke="var(--color-secondary)" strokeWidth="5"
          strokeDasharray="90 40" strokeLinecap="round"
        />
      </svg>
      {label && <p className="text-sm text-current/60">{label}</p>}
    </div>
  )
}
