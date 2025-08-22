import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import movies from '../src/data/movies.js'

let OpenAI = null
const hasKey = !!process.env.OPENAI_API_KEY
if (hasKey) {
  ({ OpenAI } = await import('openai'))
}

const app = express()
const PORT = process.env.PORT || 8787

app.use(cors())
app.use(express.json())

const openai = hasKey ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

const DIM = 512
function hashToken(t) {
  let h = 2166136261
  for (let i = 0; i < t.length; i++) {
    h ^= t.charCodeAt(i)
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
  }
  return Math.abs(h) % DIM
}
function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}
function localEmbed(text) {
  const vec = new Array(DIM).fill(0)
  for (const tok of tokenize(text)) vec[hashToken(tok)] += 1
  const norm = Math.sqrt(vec.reduce((s, x) => s + x * x, 0)) || 1
  for (let i = 0; i < DIM; i++) vec[i] /= norm
  return vec
}
function cosine(a, b) {
  let d = 0
  for (let i = 0; i < a.length; i++) d += a[i] * b[i]
  return d
}
async function embed(text) {
  if (hasKey) {
    const out = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    })
    return out.data[0].embedding
  }
  return localEmbed(text)
}

const GENRE_MAP = {
  action: ['action', 'superhero', 'fight', 'battle', 'spy', 'war'],
  adventure: ['adventure', 'quest', 'journey', 'epic'],
  animation: ['animation', 'anime', 'cartoon'],
  comedy: ['comedy', 'funny', 'light', 'feel good', 'hilarious', 'romcom'],
  crime: ['crime', 'mafia', 'gangster', 'heist'],
  drama: ['drama', 'serious', 'emotional', 'tearjerker', 'intense'],
  fantasy: ['fantasy', 'magic', 'myth', 'fairy'],
  horror: ['horror', 'scary', 'thriller', 'slasher'],
  music: ['music', 'musical', 'band', 'jazz'],
  romance: ['romance', 'love', 'romcom', 'heartwarming'],
  'sci-fi': ['sci-fi', 'science', 'space', 'robot', 'ai', 'future', 'futuristic'],
  thriller: ['thriller', 'suspense', 'twist'],
  family: ['family', 'kids', 'pixar', 'disney'],
}

function parseYearHints(text) {
  const s = (text || '').toLowerCase()
  const after = /after\s*(\d{4})/.exec(s)?.[1]
  const before = /before\s*(\d{4})/.exec(s)?.[1]
  const decade = /(\d{2})(?:\s*)0s|\b(19|20)(\d)0s/.exec(s)
  let decadeStart = null
  if (/\b\d0s\b/.test(s)) {
    const m = /\b(19|20)?(\d)0s\b/.exec(s)
    if (m) {
      if (!m[1]) {
        const tens = m[2]
        decadeStart = tens === '9' ? 1990 : tens === '8' ? 1980 : null
      } else {
        decadeStart = Number(m[1] + m[2] + '0')
      }
    }
  }
  const exactYear = /\b(19|20)\d{2}\b/.exec(s)?.[0]
  return {
    after: after ? Number(after) : null,
    before: before ? Number(before) : null,
    decadeStart,
    exactYear: exactYear ? Number(exactYear) : null,
  }
}

function extractDesiredGenres(text) {
  const s = (text || '').toLowerCase()
  const out = new Set()
  for (const [genre, keys] of Object.entries(GENRE_MAP)) {
    if (keys.some((k) => s.includes(k))) out.add(normalizeGenre(genre))
  }
  if (/feel[\s-]?good|cozy|light|chill/g.test(s)) out.add('comedy')
  if (/dark|gritty|serious|heavy/g.test(s)) out.add('drama')
  if (/space|cosmic|astronaut/g.test(s)) out.add('sci-fi')
  if (/animated|pixar|ghibli/g.test(s)) out.add('animation')
  return Array.from(out)
}

function normalizeGenre(g) {
  return g.toLowerCase().replace(/\s+/g, '-')
}

function movieHasGenre(movie, wants) {
  const mgs = (movie.genres || []).map((g) => normalizeGenre(g))
  return wants.some((w) => mgs.includes(w))
}

let movieVectors = []
let lastMovieCount = 0

async function ensureVectors() {
  if (movieVectors.length && lastMovieCount === movies.length) return
  movieVectors = []
  for (const m of movies) {
    const text = `${m.title} (${m.year})\nGenres: ${m.genres?.join(', ')}\n${m.overview}`
    const vec = await embed(text)
    movieVectors.push({ movie: m, vec })
  }
  lastMovieCount = movies.length
}

function scoreMovie({ profile, qvec, wantsGenres, yearHints }, mv) {
  const { movie, vec } = mv
  const base = cosine(qvec, vec)
  const genreBoost = movieHasGenre(movie, wantsGenres) ? 0.12 : 0
  let eraBoost = 0
  if (yearHints.after && movie.year > yearHints.after) eraBoost += 0.08
  if (yearHints.before && movie.year < yearHints.before) eraBoost += 0.06
  if (yearHints.exactYear && movie.year === yearHints.exactYear) eraBoost += 0.12
  if (yearHints.decadeStart) {
    const center = yearHints.decadeStart + 5
    const dist = Math.abs(movie.year - center)
    eraBoost += Math.max(0, 0.1 - dist * 0.01)
  }
  const s = (profile || '').toLowerCase()
  const wantsFun = /fun|stupid|light|comedy|feel[\s-]?good|cozy/.test(s)
  const wantsSerious = /serious|drama|heavy|intense|dark|gritty/.test(s)
  const movieGenresNorm = (movie.genres || []).map(normalizeGenre)
  if (wantsFun && movieGenresNorm.includes('comedy')) eraBoost += 0.06
  if (wantsSerious && movieGenresNorm.includes('drama')) eraBoost += 0.04
  if (/new|recent|latest|modern/.test(s) && movie.year >= 2015) eraBoost += 0.03
  if (/cozy|feel[\s-]?good|light|comfort/.test(s) && movieGenresNorm.includes('horror')) eraBoost -= 0.08
  const total = base + genreBoost + eraBoost
  return total
}

function buildOfflineReason({ fav, era, mood }, movie) {
  const user = `${fav} ${era} ${mood}`.trim()
  const wantsFun = /fun|stupid|light|comedy|feel[\s-]?good|cozy/i.test(user)
  const serious = /serious|drama|heavy|intense|dark|gritty/i.test(user)
  const yearHint = /after\s*(\d{4})/i.exec(user)
  const beforeHint = /before\s*(\d{4})/i.exec(user)
  const decade = /\b(19|20)?(\d)0s\b/i.exec(user)
  const wants = extractDesiredGenres(user)
  const bits = []
  if (wantsFun) bits.push('light and rewatchable')
  if (serious) bits.push('more serious and character-driven')
  if (wants.length) bits.push(`your ${wants.slice(0, 2).join('/')} mood`)
  if (yearHint) bits.push(`released after ${yearHint[1]}`)
  if (beforeHint) bits.push(`from before ${beforeHint[1]}`)
  if (decade && !yearHint && !beforeHint) {
    const decadeTxt = decade[1] ? `${decade[1]}${decade[2]}0s` : `${decade[2]}0s`
    bits.push(`your ${decadeTxt} vibe`)
  }
  const genreTxt = movie.genres?.slice(0, 2).join(', ')
  const tail = genreTxt ? ` Genres: ${genreTxt}.` : ''
  const why = bits.length ? `It fits ${bits.join(' and ')}.` : 'It aligns well with your picks and mood.'
  return `${why}${tail}`
}

function pickAlternatives(ranked, top) {
  const usedTitles = new Set([top.title])
  const topGenres = new Set((top.genres || []).map(normalizeGenre))
  const alts = []
  for (const r of ranked) {
    if (alts.length >= 2) break
    const t = r.movie
    if (usedTitles.has(t.title)) continue
    const tGenres = new Set((t.genres || []).map(normalizeGenre))
    const overlap = [...tGenres].some((g) => topGenres.has(g))
    if (alts.length === 0 && overlap) {
      alts.push(t)
      usedTitles.add(t.title)
    } else if (!overlap || alts.length === 1) {
      alts.push(t)
      usedTitles.add(t.title)
    }
  }
  for (const r of ranked) {
    if (alts.length >= 2) break
    const t = r.movie
    if (!usedTitles.has(t.title)) alts.push(t)
  }
  return alts.slice(0, 2)
}

app.post('/api/recommend', async (req, res) => {
  try {
    await ensureVectors()
    const { fav = '', era = '', mood = '' } = req.body || {}
    const profile = `Favorite & why: ${fav}\nEra: ${era}\nMood: ${mood}`
    const wantsGenres = extractDesiredGenres(`${fav} ${era} ${mood}`)
    const yearHints = parseYearHints(`${fav} ${era} ${mood}`)
    const qvec = await embed(profile)
    const ranked = movieVectors
      .map((mv) => ({
        movie: mv.movie,
        score: scoreMovie({ profile, qvec, wantsGenres, yearHints }, mv),
      }))
      .sort((a, b) => b.score - a.score)
    const top = ranked[0]?.movie
    if (!top) {
      return res.json({ best: null, alternatives: [], offline: !hasKey })
    }
    const alts = pickAlternatives(ranked.slice(1), top)
    let reason = ''
    if (hasKey) {
      try {
        const chat = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a concise movie recommender. Avoid spoilers.' },
            {
              role: 'user',
              content:
                `User preferences:\n${profile}\n\n` +
                `Top candidate JSON:\n${JSON.stringify(top)}\n\n` +
                `Write a single answer with:\n` +
                `1) 1–2 sentence reason tailored to the user\n` +
                `2) One short hook word in parentheses at the end (e.g., (uplifting), (mind-bending))\n`,
            },
          ],
          temperature: 0.2,
        })
        reason = chat.choices?.[0]?.message?.content?.trim() || ''
      } catch {
        reason = buildOfflineReason({ fav, era, mood }, top)
      }
    } else {
      reason = buildOfflineReason({ fav, era, mood }, top)
    }
    const altNotes = alts.map((m) => ({
      ...m,
      note: buildOfflineReason({ fav, era, mood }, m),
    }))
    res.json({
      best: { ...top, reason },
      alternatives: altNotes,
      offline: !hasKey,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to recommend', details: e.message })
  }
})

app.get('/api/health', (_, res) => res.json({ ok: true, offline: !hasKey }))

app.listen(PORT, () =>
  console.log(`Server on http://localhost:${PORT} (offline mode: ${!hasKey})`)
)
