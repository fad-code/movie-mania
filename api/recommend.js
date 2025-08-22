
import movies from '../src/data/movies.js'

function quickScore(movie, { fav = '', era = '', mood = '' }) {
  let s = 0;
  const favL = fav.toLowerCase(), eraL = era.toLowerCase(), moodL = mood.toLowerCase();
  if (favL && (movie.title.toLowerCase().includes(favL) || (movie.overview||'').toLowerCase().includes(favL))) s += 3;

  if (eraL.includes('after') || eraL.includes('new') || /\d{4}/.test(eraL)) {
    const y = parseInt((eraL.match(/\d{4}/)||[])[0] || '1990', 10);
    if (movie.year >= y) s += 2;
  } else if (eraL.includes('before') || eraL.includes('old') || eraL.includes('classic')) {
    if (movie.year <= 1999) s += 2;
  }

  const moods = {
    fun: ['Comedy','Animation','Family','Music'],
    serious: ['Drama','Thriller','Crime'],
    love: ['Romance'],
    action: ['Action','Adventure','Sci-Fi'],
  };
  for (const [k, gens] of Object.entries(moods)) {
    if (moodL.includes(k)) {
      s += movie.genres.some(g => gens.includes(g)) ? 2 : 0;
    }
  }
  return s + (movie.popularity || 0);
}

function fallbackRecommend({ fav, era, mood }) {
  const sorted = [...movies].sort((a,b)=>quickScore(b,{fav,era,mood})-quickScore(a,{fav,era,mood}));
  const top = sorted.slice(0,6);
  return { best: top[0], alternatives: top.slice(1) };
}

async function maybeOpenAI({ fav, era, mood }) {
  try {
    if (!process.env.OPENAI_API_KEY) return null;
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `Give 6 diverse movie recommendations (title, year, one-sentence why) based on:
Favorite: ${fav}
Era preference: ${era}
Mood: ${mood}
Return JSON: {items:[{title,year,overview}]}`;
    const resp = await client.responses.create({
      model: 'gpt-4.1-mini',
      input: prompt,
      temperature: 0.7
    });
    const txt = resp.output_text || resp.output[0]?.content?.[0]?.text || '';
    const json = JSON.parse(txt.match(/\{[\s\S]*\}$/)?.[0] || '{"items":[]}');
    const items = Array.isArray(json.items) ? json.items : [];
    if (!items.length) return null;
    const [best, ...alternatives] = items;
    return { best, alternatives };
  } catch (e) {
    console.error('OpenAI failed (falling back):', e.message);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  try {
    const { fav = '', era = '', mood = '' } = typeof req.body === 'object' && req.body ? req.body : await new Promise(resolve=>{
      let raw=''; req.on('data',c=>raw+=c); req.on('end',()=>{ try{ resolve(JSON.parse(raw||'{}')) } catch { resolve({}) } });
    });
    const ai = await maybeOpenAI({ fav, era, mood });
    if (ai) return res.status(200).json({ ok: true, mode: 'openai', ...ai });
    const fb = fallbackRecommend({ fav, era, mood });
    return res.status(200).json({ ok: true, mode: 'fallback', ...fb });
  } catch (e) {
    console.error(e);
    const fb = fallbackRecommend({ fav: '', era: '', mood: '' });
    return res.status(200).json({ ok: true, mode: 'fallback', ...fb, error: e.message });
  }
}
