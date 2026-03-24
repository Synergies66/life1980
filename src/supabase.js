import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
)

export default supabase

// ── AUTH ──────────────────────────────────────────────
export const authSignUp = (email, password) =>
  supabase.auth.signUp({ email, password })

export const authSignIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const authSignOut = () => supabase.auth.signOut()

export const getSession = () => supabase.auth.getSession()

export const onAuthChange = (cb) =>
  supabase.auth.onAuthStateChange((_e, session) => cb(session))

// ── MERCHANTS ─────────────────────────────────────────
// Fetch merchants with all language content
export const fetchMerchants = async ({ region, catI, query } = {}) => {
  let q = supabase
    .from('merchants')
    .select('*, merchant_content(*)')
    .eq('status', 'active')
    .order('certified', { ascending: false })
    .order('rating',    { ascending: false })

  if (region && region !== 'all') q = q.contains('regions', [region])
  if (catI  !== null && catI !== undefined) q = q.eq('cat_i', catI)

  const { data, error } = await q
  if (error || !data) return { data: [], error }

  let merchants = data.map(dbToMerchant)

  if (query) {
    const lq = query.toLowerCase()
    merchants = merchants.filter(m =>
      m.name.toLowerCase().includes(lq) ||
      m.nameEn.toLowerCase().includes(lq)
    )
  }

  return { data: merchants, error: null }
}

// Transform DB row → app shape
function dbToMerchant(m) {
  const contentMap = {}
  ;(m.merchant_content || []).forEach(c => {
    contentMap[c.lang] = {
      sub:    c.sub    || '',
      detail: c.detail || '',
      svcs:   c.svcs   || [],
      sk:     c.score_keys || []
    }
  })
  return {
    id:       m.id,
    name:     m.name_zh,
    nameEn:   m.name_en,
    catI:     m.cat_i,
    regions:  m.regions  || [],
    rating:   parseFloat(m.rating)   || 0,
    rev:      m.review_count || 0,
    years:    m.years_exp    || 0,
    cases:    m.case_count   || 0,
    cert:     m.certified    || false,
    local:    m.local_office || false,
    tel:      m.tel    || '',
    wx:       m.wechat || '',
    score:    buildScore(m),
    _content: contentMap,
  }
}

// Build score object from score_keys + fixed values
function buildScore(m) {
  // For now use default keys; override with lang-specific keys in mScore()
  return { 合规性: 95, 服务质量: 92, 成功率: 90, 收费透明: 93 }
}

// ── REVIEWS ───────────────────────────────────────────
export const fetchReviews = async (merchantId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false })
  return { data: data || [], error }
}

export const submitReview = async ({ merchantId, userId, display, rating, content, lang }) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert([{
      merchant_id:  merchantId,
      user_id:      userId,
      user_display: display,
      rating,
      content,
      lang
    }])
  return { data, error }
}

// ── APPLICATIONS ──────────────────────────────────────
export const submitApplication = async (form, userId) => {
  const { data, error } = await supabase
    .from('applications')
    .insert([{ ...form, user_id: userId }])
  return { data, error }
}

// Admin: fetch all applications (needs service role or admin policy)
export const fetchApplications = async () => {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('submitted_at', { ascending: false })
  return { data: data || [], error }
}

export const updateAppStatus = async (id, status) => {
  const { data, error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', id)
  return { data, error }
}

// ── BOOKMARKS ─────────────────────────────────────────
export const fetchBookmarks = async (userId) => {
  const { data, error } = await supabase
    .from('user_bookmarks')
    .select('merchant_id')
    .eq('user_id', userId)
  return { data: (data || []).map(b => b.merchant_id), error }
}

export const toggleBookmark = async (userId, merchantId) => {
  const { data } = await supabase
    .from('user_bookmarks')
    .select('*')
    .eq('user_id', userId)
    .eq('merchant_id', merchantId)
    .maybeSingle()

  if (data) {
    return supabase.from('user_bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('merchant_id', merchantId)
  } else {
    return supabase.from('user_bookmarks')
      .insert([{ user_id: userId, merchant_id: merchantId }])
  }
}

// ── DOCUMENT UPLOAD ───────────────────────────────────
export const uploadDoc = async (file, applicationId, docType) => {
  const path = `${applicationId}/${docType}-${Date.now()}.${file.name.split('.').pop()}`
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(path, file, { upsert: true })
  return { data, error, path }
}
