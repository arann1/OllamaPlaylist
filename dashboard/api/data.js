import fs from "fs"
import path from "path"

function loadHistory() {
  const candidates = [
    path.join(process.cwd(), "data", "history.json"),
    path.join(process.cwd(), "..", "data", "history.json"),
  ]

  for (const filePath of candidates) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf8").trim()
        if (raw) return JSON.parse(raw)
      }
    } catch {
      continue
    }
  }

  return []
}

export default function handler(_req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Cache-Control", "no-store")
  res.status(200).json(loadHistory())
}
