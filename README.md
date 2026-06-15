# AI Chatbot App ✨

A modern, feature-rich AI chatbot application powered by Claude AI, built with React and Vite.

## 🎯 Features

- ✨ **Smart AI Responses** - Powered by Claude Sonnet
- 🎤 **Voice Input** - Record and transcribe voice messages
- 📸 **Camera & Image Upload** - Send images for analysis
- 📐 **Math Rendering** - Beautiful LaTeX formula support
- 🎨 **Customization** - Multiple personas, themes, and font sizes
- 🔐 **Google Authentication** - Secure login with Google
- ⚡ **Real-time Chat** - Smooth, responsive messaging

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Google Cloud credentials (for OAuth)
- Anthropic API key (for Claude)

### Installation

```bash
npm install
```

### Configuration

1. **Set up Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Copy your Client ID
   - Paste it in `src/App.jsx` at `GOOGLE_CLIENT_ID`

2. **Set up Anthropic API:**
   - Get your API key from [Anthropic Console](https://console.anthropic.com)
   - Add it to your environment variables or use it directly in API calls

### Development

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
├── src/
│   ├── App.jsx           # Main application component
│   └── main.jsx          # React entry point
├── index.html            # HTML template
├── vite.config.js        # Vite configuration
├── package.json          # Dependencies
└── README.md             # This file
```

## 🔌 API Integration

### Claude API
The app uses the Anthropic Claude API for:
- Text responses to user queries
- Audio transcription
- Image analysis

### Google OAuth
Secure authentication via Google accounts

## 🎭 Customization

### Personas
Three AI personas available:
- **Aria** (✦) - Warm & friendly
- **Sage** (🧠) - Deep thinker & analyst
- **Spark** (⚡) - Creative & energetic

### Themes
- Violet, Cyan, Rose, Amber

### Font Sizes
- Small, Medium, Large

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 💻 Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Claude API** - AI backend
- **Google OAuth** - Authentication
- **KaTeX** - Math rendering
- **Web APIs** - Camera, Microphone, Canvas

## 🌍 Deployment

The app can be deployed to any static hosting:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 🆘 Troubleshooting

### "Camera access denied"
- Check browser permissions
- Ensure HTTPS in production

### "Microphone permission denied"
- Check system audio permissions
- Try a different browser

### Google login not working
- Verify Client ID is correct
- Check that origin URL is whitelisted in Google Console

### Claude API errors
- Ensure API key is valid
- Check rate limits
- Verify network connectivity

## 📜 License

MIT

## 💬 Support

For issues or questions, please open an issue on GitHub.
