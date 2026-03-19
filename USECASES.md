# Use Cases

## Chat & Text Generation

### Customer Support Bot
```bash
api chat "Help me track my order #12345" --system "You are a friendly support agent"
```

### Code Review Assistant
```bash
api chat "Review this code and suggest improvements" --model gpt-4 -o 500
```

### Content Writing
```bash
api chat "Write a blog post about AI in healthcare" -o 1000
```

### Language Translation
```bash
api translate "Hello, how are you?" spanish
api translate "Bonjour le monde" french --source french
```

### Text Summarization
```bash
api summarize "Long article text here..." --style concise
api summarize "Meeting notes..." --style bullet
```

### Text Classification
```bash
api classify "I love this product!" --labels positive,negative,neutral
api classify "Breaking news about tech stock" --labels finance,tech,sports,politics
```

---

## Image Generation

### Basic Image
```bash
api image "A futuristic city at sunset"
```

### Multiple Images
```bash
api image "A cat" -n 4
```

### Custom Size
```bash
api image "Landscape photo" -s 1920x1080
```

### Different Model
```bash
api image "Abstract art" -m flux-1-schnell
```

---

## Image Editing

### Image-to-Image
```bash
api img2img photo.jpg "make it black and white"
```

### Custom Strength
```bash
api img2img photo.jpg "add cartoon effect" --strength 0.5
```

### Image Variations
```bash
api variation photo.jpg "artistic style"
```

---

## Audio

### Speech Recognition
```bash
api transcribe audio.mp3
```

### Audio Translation
```bash
api translate-audio audio.mp3 spanish
```

### Text-to-Speech
```bash
api tts "Hello, welcome to our service" speech.mp3
```

---

## Embeddings

### Semantic Search Support
```bash
api embed "artificial intelligence" -f json
```

---

## Vision

### Image Analysis
```bash
api vision photo.jpg "What objects are in this image?"
```

### Custom Question
```bash
api vision document.png "Extract all text from this document"
```

---

## Workflows

### Multi-Step: Translate & Speak
```bash
TEXT="Hello, how are you?"
TRANSLATED=$(api translate "$TEXT" french)
api tts "$TRANSLATED" hello_french.mp3
```

### Multi-Step: Image Variation Chain
```bash
api image "Professional headshot"
api img2img image1.jpg "make it more artistic"
api variation image1.jpg "different angle"
```

### Multi-Step: Document Pipeline
```bash
api transcribe meeting.mp3
api summarize "transcribed text" --style bullet
api translate "bullet summary" spanish
```

---

## Scripting Examples

### Batch Translation
```bash
for text in "Hello" "Goodbye" "Thank you"; do
  api translate "$text" spanish
done
```

### Generate Gallery
```bash
for theme in "nature" "technology" "abstract"; do
  api image "$theme art" -n 3
done
```

### Sentiment Analysis Pipeline
```bash
for review in "Great product!" "Terrible service" "It was okay"; do
  echo "$review: $(api classify "$review")"
done
```

---

## Environment Setup

```bash
# Set permanently
export NOORIS_API_URL=https://api.isamahmed782.workers.dev
export NOORIS_API_KEY=your-api-key

# Then use anywhere
api chat "Hello!"

# Or per-command
NOORIS_API_URL=https://api.isamahmed782.workers.dev NOORIS_API_KEY=key api models
```
