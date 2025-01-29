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

app.use(express.static("public"))

app.get("/", async (req, res) => {
  try {
    const result = await axios.get("https://secrets-api.appbrewery.com/random")

    if (!result.data) {
      throw new Error("No data received from API")
    }

    res.render("index.ejs", {
      secret: result.data.secret || "No secret available",
      user: result.data.username || "Anonymous",
    })
  } catch (error) {
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data || "No response data",
      status: error.response?.status || "No status code",
    })

    res.render("index.ejs", {
      secret: "Error loading secret. Please try again later.",
      user: "System",
    })
  }
})

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})

export default app

