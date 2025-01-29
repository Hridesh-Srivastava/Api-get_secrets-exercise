import express from "express"
import axios from "axios"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const port = process.env.PORT || 3000

// Set the view engine and views directory
app.set("view engine", "ejs")
app.set("views", join(__dirname, "views"))

// Serve static files from the public directory
app.use(express.static("public"))

app.get("/", async (req, res) => {
  try {
    // Using a different endpoint with API key
    const result = await axios.get("https://secrets-api.appbrewery.com/random", {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0",
        Authorization: "Bearer YOUR-API-KEY", // Add your API key here if required
      },
      timeout: 8000, // Increased timeout
    })

    // Add some delay to prevent rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100))

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

    // Check if it's a CORS error
    if (error.message.includes("CORS")) {
      res.render("index.ejs", {
        secret: "Server configuration error. Please try again later.",
        user: "System",
      })
      return
    }

    // Check if it's a timeout error
    if (error.code === "ECONNABORTED") {
      res.render("index.ejs", {
        secret: "Request timed out. Please try again.",
        user: "System",
      })
      return
    }

    res.render("index.ejs", {
      secret: "Unable to fetch secret. Please refresh the page.",
      user: "System",
    })
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

export default app

