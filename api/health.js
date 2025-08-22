export default async function handler(_req,res){ res.status(200).json({ ok:true, offline: !process.env.OPENAI_API_KEY }) }
