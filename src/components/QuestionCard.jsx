export default function QuestionCard({ label, value, setValue, placeholder }) {
  return (
    <div className="mb-4">
      <p className="mb-2 text-sm font-medium text-gray-300">{label}</p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full resize-none rounded-xl bg-gray-800/80 placeholder-gray-500 text-sm p-3 outline-none focus:ring-2 ring-indigo-400"
      />
    </div>
  )
}
