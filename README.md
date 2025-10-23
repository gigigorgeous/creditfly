# AI Music & Video Creator

A comprehensive platform for generating original music and music videos using AI. Built with Next.js, TypeScript, and the Suno API.

## Features

### 🎵 Music Generation
- **50+ Genres**: Pop, Rock, Electronic, Jazz, Classical, Hip Hop, and more
- **20+ Moods**: Happy, Sad, Energetic, Calm, Dark, Uplifting, etc.
- **Custom Instruments**: Piano, Guitar, Synth, Strings, Drums, and more
- **Tempo Control**: Adjust BPM from 60 to 180
- **Duration Control**: Generate tracks from 30 seconds to 5 minutes
- **Lyrics Support**: Add custom lyrics or generate instrumental tracks
- **AI-Powered**: Uses Suno's Chirp v3.5 model for professional quality

### 🎬 Video Generation
- **Multiple Visual Styles**: Cinematic, Anime, 3D, Retro, Cyberpunk, and more
- **Character Types**: Realistic, Animated, or Celebrity Deepfake
- **Custom Prompts**: Describe your vision for the music video
- **Automatic Sync**: Video automatically syncs with your music

### 📊 Audio Visualization
- **Real-time Spectrum Analyzer**: See your music come alive
- **3 Visualization Modes**: Bars, Wave, and Circular displays
- **Interactive Controls**: Adjust volume and toggle visualizer

### 🎓 Interactive Tutorial
- **Step-by-step Guide**: Learn how to use the platform
- **5 Tutorial Steps**: From basics to advanced features
- **First-time User Friendly**: No musical experience required

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Suno API Bearer Token

### Installation

1. Clone the repository:
\`\`\`bash
git clone <your-repo-url>
cd ai-music-creator
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Create a `.env.local` file in the root directory:
\`\`\`env
SUNO_API_KEY="sk-yJ1Q9Mc1XQTAizRmqeN4STz9DbxmKTlN4hwj4UvdExS0WGda"
\`\`\`

4. Run the development server:
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Get Your Suno API Token

1. Log into [suno.com](https://suno.com)
2. Open browser Developer Tools (F12)
3. Go to the **Network** tab
4. Generate any music on Suno
5. Find a request to `studio-api.prod.suno.com`
6. Look for the **Authorization** header
7. Copy the entire value (including "Bearer ")
8. Add it to your `.env.local` file

## Usage Guide

### Generating Music

1. **Enter a Title**: Give your track a name
2. **Write a Prompt**: Describe the music you want
3. **Select Genres**: Choose one or more genres
4. **Choose Mood**: Set the emotional tone
5. **Pick Instruments**: Select specific instruments (optional)
6. **Adjust Settings**: Set tempo and duration
7. **Add Lyrics**: Include custom lyrics or go instrumental
8. **Generate**: Click "Generate Music" and wait 2-5 minutes

### Creating Videos

1. **Generate or Select Music**: Have a track ready
2. **Toggle Video Mode**: Enable the video generator
3. **Describe Your Video**: Write a prompt for the visuals
4. **Choose Style**: Select a visual style
5. **Generate**: Create your music video

### Tips for Best Results

**Music Generation:**
- Be specific in your prompts: "Upbeat electronic dance track with synth leads and driving bass"
- Combine genres for unique sounds: "Jazz + Electronic"
- Use mood and tempo together for precise control
- Add detailed lyrics for better vocal generation

**Video Generation:**
- Reference specific visual styles or aesthetics
- Describe scenes, colors, and movements
- Mention lighting conditions and camera angles
- Keep prompts focused and coherent

## Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Beautiful UI components

### Audio Processing
- **Web Audio API**: Real-time audio analysis
- **Canvas API**: Custom visualizations
- **HTML5 Audio**: Playback controls

### AI Services
- **Suno API**: Music generation (Chirp v3.5)
- **Studio API**: Professional-grade audio synthesis

## API Endpoints

### Music Generation
- `POST /api/music/generate` - Start music generation
- `GET /api/music/[id]` - Check generation status
- `GET /api/music/list` - List all tracks (requires database)

### Video Generation
- `POST /api/video/generate` - Start video generation
- `GET /api/video/[id]` - Check video status

### Configuration
- `GET /api/check-api-keys` - Verify API configuration

## Project Structure

\`\`\`
ai-music-creator/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── music/               # Music generation endpoints
│   │   └── video/               # Video generation endpoints
│   ├── music-creator/           # Unified creator page
│   ├── settings/                # Settings page
│   └── layout.tsx               # Root layout
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── audio-player.tsx         # Custom audio player
│   ├── audio-visualizer.tsx     # Spectrum analyzer
│   ├── music-tutorial.tsx       # Tutorial modal
│   └── unified-music-creator.tsx # Main creator interface
├── lib/                         # Utility functions
│   ├── suno-client.ts          # Suno API client
│   └── utils.ts                # Helper functions
└── public/                      # Static assets
\`\`\`

## Advanced Features

### Audio Visualization
The platform includes a custom-built audio visualizer with three modes:
- **Bars**: Frequency spectrum bars
- **Wave**: Oscilloscope waveform
- **Circular**: Radial frequency display

### Genre Mixing
Combine multiple genres to create unique hybrid styles:
- Electronic + Jazz = Nu-Jazz
- Rock + Classical = Symphonic Rock
- Hip Hop + Jazz = Jazz Rap

### Custom Lyrics Format
Structure your lyrics with verse/chorus tags:
\`\`\`
[Verse 1]
Your lyrics here...

[Chorus]
Catchy chorus here...

[Verse 2]
More lyrics...
\`\`\`

## Roadmap

- [ ] Database integration for track history (Supabase)
- [ ] User authentication and profiles
- [ ] Social sharing features
- [ ] Collaborative playlists
- [ ] MIDI export
- [ ] Stem separation
- [ ] Audio effects (reverb, delay, EQ)
- [ ] Mobile app (React Native)

## Troubleshooting

### Music Generation Fails
- Verify your Suno API token is valid
- Check that token starts with "Bearer "
- Ensure .env.local file is in project root
- Restart development server after changing .env.local

### No Audio Playback
- Check browser audio permissions
- Verify audio URL is accessible
- Try different browser (Chrome recommended)
- Check volume settings

### Slow Generation
- Suno generation typically takes 2-5 minutes
- Complex prompts may take longer
- Multiple simultaneous generations may queue
- Check Suno service status

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [your-repo/issues]
- Email: your-email@example.com
- Discord: [your-discord-link]

## Acknowledgments

- Suno AI for the music generation API
- shadcn/ui for the component library
- Vercel for hosting and deployment
- The Next.js team for the amazing framework
\`\`\`

Finally, let's create a comprehensive package.json with all dependencies:
