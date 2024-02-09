// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function hello(req, res) {
  if (req.method === 'POST') return res.json({ messsage: "POST req not allowed" })
  res.status(200).json({ name: "John Doe" });
}
