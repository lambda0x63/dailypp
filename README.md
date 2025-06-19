<h1 align="center">DailyPP</h1>
<p align="center">
	Daily osu! map recommendation web service
</p>
<div align="center">
  <img src="https://github.com/user-attachments/assets/f8fb0208-c39b-4d30-96e6-1c2f15b6118f" alt="DailyPP Landing Page"/>
</div>

<h2 align="left">Key Features</h2>

<h3 align="left">1. Personalized Beatmap Recommendations</h3>

- User PP-based difficulty adjustment
- Tiered recommendations (Easy, Normal, Hard)
- Smart algorithm based on your top plays

<h3 align="left">2. Daily Challenges</h3>

- 3 beatmaps per difficulty level
- Clear by achieving S rank or higher
- Detailed information (difficulty, BPM, length, estimated PP)

<h3 align="left">3. Statistics & Progress</h3>

- Daily/weekly challenge completion rates
- Completion streak tracking
- PP growth graph
- Difficulty-based clear statistics

<h3 align="left">4. Demo Mode (/demo)</h3>

Preview service features without login

- Challenge system preview
- Dashboard and statistics experience

<h2 align="left">Recommendation Algorithm</h2>

Difficulty is calculated using:

```
difficulty_range = stable_top_play_stars + offset ± margin
```

<h3 align="left">Difficulty Settings</h3>

- **Easy**: Base - 1.0 ± 0.3
- **Normal**: Base - 0.5 ± 0.3
- **Hard**: Base + 0.0 ± 0.3

<h2 align="left">Tech Stack</h2>

<h3 align="left">Frontend</h3>

- SvelteKit
- TailwindCSS
- TypeScript
- Chart.js

<h3 align="left">Backend</h3>

- Upstash Redis (for caching and temporary data)
- osu! OAuth
- JWT authentication
- Vercel serverless functions


**Live Demo**: [dailypp.vercel.app](https://dailypp.vercel.app)

<h2 align="left">Architecture</h2>

- **Serverless**: No traditional database required
- **Redis Caching**: Daily challenges cached with TTL
- **osu! API Integration**: Real-time user data and beatmap information
- **Stateless Design**: Scales automatically with traffic

<h2 align="left">License</h2>

MIT License
