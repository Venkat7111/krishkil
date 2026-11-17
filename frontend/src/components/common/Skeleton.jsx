export default function Skeleton({ className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-current/10 skeleton-shimmer ${className}`} />
  )
}
