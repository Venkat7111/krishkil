export default function ProfileCard({ user }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-[var(--color-secondary)]/20 flex items-center justify-center font-display text-xl font-semibold text-[var(--color-primary)]">
        {user?.name?.[0] || 'F'}
      </div>
      <div>
        <p className="font-display font-semibold text-lg">{user?.name || 'Guest Farmer'}</p>
        <p className="text-sm text-current/50">{user?.email || 'guest@krishisahay.app'}</p>
      </div>
    </div>
  )
}
