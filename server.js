// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "https://spotifyvidaa-backend.onrender.com/callback"; // debe coincidir con Spotify

// Ruta principal para probar que el backend funciona
app.get("/", (req, res) => res.send("✅ Backend Spotify funcionando"));

// Login: redirige a Spotify para autorización
app.get("/login", (req, res) => {
  const scopes = [
    "user-read-private",
    "user-read-email",
    "streaming",
    "user-modify-playback-state",
    "playlist-read-private",
  ];

  const authUrl =
    "https://accounts.spotify.com/authorize" +
    "?response_type=code" +
    "&client_id=" + CLIENT_ID +
    "&scope=" + scopes.join("%20") +
    "&redirect_uri=" + REDIRECT_URI;

  res.redirect(authUrl);
});

// Callback: Spotify redirige aquí con ?code=...
app.get("/callback", async (req, res) => {
  const code = req.query.code || null;
  if (!code) return res.status(400).send("No code received from Spotify");

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " + Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = await response.json();

    // Redirige al frontend con el access_token
    res.redirect(
      `https://joakoam.github.io/Spotify-VIDAA/#access_token=${data.access_token}`
    );
  } catch (err) {
    console.error("Error en callback:", err);
    res.status(500).send("Error al procesar el callback");
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Backend corriendo en puerto ${PORT}`));