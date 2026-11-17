export default function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center px-4 py-3 glass rounded-2xl rounded-tl-sm w-fit">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-current/50 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}
