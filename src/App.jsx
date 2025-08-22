import { useState } from 'react'
import QuestionCard from './components/QuestionCard'
import MovieCard from './components/MovieCard'

function PhoneShell({ children }) {
  return (
    <div className="mx-auto w-[360px] sm:w-[380px] rounded-[28px] p-6 bg-[#0c1539] shadow-[0_12px_40px_rgba(0,0,0,.45)] border border-white/10">
      {children}
    </div>
  )
}

export default function App() {
  const [fav, setFav] = useState('')
  const [era, setEra] = useState('')
  const [mood, setMood] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [queue, setQueue] = useState([])

  
async function getRecommendation() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fav, era, mood })
      })
      const data = await res.json()
      const best = data.best || (Array.isArray(data.recommendations) ? data.recommendations[0] : null)
      const alternatives = data.alternatives || (Array.isArray(data.recommendations) ? data.recommendations.slice(1) : [])
      if (best) {
        setResult(best)
        setQueue(alternatives || [])
      } else {
        // ultimate fallback on client
        const movies = (await import('./data/movies.js')).default
        const ranked = [...movies].sort((a,b)=> (b.year||0)-(a.year||0))
        setResult(ranked[0])
        setQueue(ranked.slice(1,6))
      }
    } catch (e) {
      console.error(e)
      // graceful UI instead of alert()
      const movies = (await import('./data/movies.js')).default
      const ranked = [...movies].sort((a,b)=> (b.year||0)-(a.year||0))
      setResult(ranked[0])
      setQueue(ranked.slice(1,6))
    } finally { setLoading(false) }
  }

  function nextMovie() {
    if (queue.length === 0) return
    const [first, ...rest] = queue
    setResult(first)
    setQueue(rest)
  }

   function reset() {
    setResult(null)
    setQueue([])
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <PhoneShell>
        <div className="flex flex-col items-center">
          <div className="mb-5 flex flex-col items-center">
            <div className="text-5xl">🍿</div>
            <h1 className="text-3xl font-extrabold mt-1">Movie Mania</h1>
          </div>

          {!result && (
            <div className="w-full">
              <QuestionCard label="What's your favorite movie and why?" value={fav} setValue={setFav} placeholder="The Shawshank Redemption..." />
              <QuestionCard label="Are you in the mood for something new or a classic?" value={era} setValue={setEra} placeholder="Released after 1990" />
              <QuestionCard label="Do you wanna have fun or do you want something serious?" value={mood} setValue={setMood} placeholder="Something fun" />
              <button onClick={getRecommendation} disabled={loading} className="w-full mt-2 py-3 rounded-xl bg-green-500 font-bold hover:brightness-110 disabled:opacity-60">
                {loading ? 'Thinking…' : "Let's Go"}
              </button>
            </div>
          )}

           {result && (
            <MovieCard
              movie={result}
              hasNext={queue.length > 0}
              onNext={nextMovie}
              onHome={reset}
            />
          )}
        </div>
      </PhoneShell>
    </div>
  )
}
