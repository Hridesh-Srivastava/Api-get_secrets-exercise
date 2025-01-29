import express from "express"
import axios from "axios"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const port = process.env.PORT || 3000

app.set("view engine", "ejs")
app.set("views", join(__dirname, "views"))

app.use(express.static("public"))

app.get("/", async (req, res) => {
  try {
    const result = await axios.get("https://secrets-api.appbrewery.com/random", {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0",
      },
      timeout: 5000,
    })

    // Check if we have the expected data structure
    if (!result.data || !result.data.secret || !result.data.username) {
      throw new Error("Invalid API response structure")
    }

    res.render("index.ejs", {
      secret: result.data.secret,
      user: result.data.username,
    })
  } catch (error) {
    // Log the full error for debugging
    console.error("API Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
    })

    res.render("index.ejs", {
      secret: "API is currently unavailable. Please try again in a few moments.",
      user: "System",
    })
  }
})

// Add a health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send("OK")
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

export default app

