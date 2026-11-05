export function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="23" fill="currentColor" />
      <path d="M8 31c7-8 16-12 32-10-8 3-13 7-17 15H8v-5Z" fill="#f6b94a" />
      <circle cx="33" cy="13" r="4" fill="#f8e5bc" />
      <path d="M14 29V18m0 4-5 4m5-3 5 3m-5-7-4-3m4 2 4-3" stroke="#f8e5bc" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function MenuIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {open ? (
        <path d="m6 6 12 12M18 6 6 18" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" />
      )}
    </svg>
  )
}

export function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14m-5-5 5 5-5 5" />
    </svg>
  )
}

export function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </svg>
  )
}
