// Lightweight cross-device account sync endpoint for Vercel.
// Allows accounts registered on laptop to be seamlessly available on phone.

let syncUsers = {}
let syncFarms = {}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      const { user, farm } = body || {}
      if (user && user.contact) {
        syncUsers[user.contact] = user
      }
      if (farm && farm.id) {
        syncFarms[farm.id] = farm
      }
      return res.status(200).json({ ok: true })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === 'GET') {
    const { contact } = req.query || {}
    if (contact && syncUsers[contact]) {
      const user = syncUsers[contact]
      const farm = syncFarms[user.farmId] || null
      return res.status(200).json({ user, farm })
    }
    return res.status(404).json({ error: 'Account not found in remote sync' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
