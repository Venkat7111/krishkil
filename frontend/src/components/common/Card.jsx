export default function Card({ children, className = '', glass = true, leaf = false, ...props }) {
  return (
    <div
      className={`${glass ? 'glass' : 'bg-current/5'} ${leaf ? 'leaf-corner' : 'rounded-2xl'} p-5 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
