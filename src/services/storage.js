// Thin, namespaced localStorage wrapper. Mock-only.
const NS = 'khamar'

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(`${NS}.${key}`)
      return raw ? JSON.parse(raw) : fallback
    } catch {
      return fallback
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`${NS}.${key}`, JSON.stringify(value))
    } catch {
      /* ignore */
    }
  },
  remove(key) {
    localStorage.removeItem(`${NS}.${key}`)
  },
  clearAll() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(`${NS}.`))
      .forEach((k) => localStorage.removeItem(k))
  },
}