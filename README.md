# Nooris API - OpenAI-Compatible Workers AI

A powerful OpenAI-style API wrapper for Cloudflare Workers AI with support for multiple AI tasks.

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/models` | GET | List available models |
| `/v1/chat/completions` | POST | Chat completions |
| `/v1/completions` | POST | Text completions |
| `/v1/embeddings` | POST | Text embeddings |
| `/v1/images/generations` | POST | Text-to-Image |
| `/v1/images/edits` | POST | Image-to-Image |
| `/v1/images/variations` | POST | Image variations |
| `/v1/audio/speech` | POST | Text-to-Speech |
| `/v1/audio/transcriptions` | POST | Speech recognition |
| `/v1/audio/translations` | POST | Audio translation |
| `/v1/classifications` | POST | Text classification |
| `/v1/translations` | POST | Translation |
| `/v1/summarizations` | POST | Summarization |
| `/v1/vision` | POST | Image-to-Text |

## Authentication

All requests require a Bearer token:

```bash
Authorization: Bearer YOUR_API_KEY
```

---

## Models

### List Models

```bash
curl -X GET https://your-worker.workers.dev/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "id": "@cf/meta/llama-3.1-8b-instruct",
      "object": "model",
      "created": 1710000000,
      "owned_by": "meta"
    }
  ]
}
```

---

## Chat Completions

### Request

```bash
curl -X POST https://your-worker.workers.dev/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "What is the capital of France?"}
    ],
    "temperature": 0.7,
    "max_tokens": 256
  }'
```

**Response:**
```json
{
  "id": "chatcmpl-1710000000-abc123",
  "object": "chat.completion",
  "created": 1710000000,
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "The capital of France is Paris."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 0,
    "completion_tokens": 0,
    "total_tokens": 0
  }
}
```

### Streaming

```bash
curl -X POST https://your-worker.workers.dev/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": true
  }'
```

---

## Text Completions

```bash
curl -X POST https://your-worker.workers.dev/v1/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "prompt": "Write a poem about the ocean:",
    "max_tokens": 100
  }'
```

**Response:**
```json
{
  "id": "cmpl-1710000000-abc123",
  "object": "text_completion",
  "created": 1710000000,
  "model": "gpt-3.5-turbo",
  "choices": [
    {
      "index": 0,
      "text": "\nWaves crash upon the sandy shore,\nA rhythm ancient, evermore...",
      "finish_reason": "stop"
    }
  ]
}
```

---

## Embeddings

```bash
curl -X POST https://your-worker.workers.dev/v1/embeddings \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "text-embedding-ada-002",
    "input": "Hello world"
  }'
```

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "index": 0,
      "embedding": [0.0023, -0.0091, 0.0145, ...]
    }
  ],
  "model": "text-embedding-ada-002",
  "usage": {
    "prompt_tokens": 0,
    "total_tokens": 0
  }
}
```

### Multiple Inputs

```bash
curl -X POST https://your-worker.workers.dev/v1/embeddings \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "text-embedding-ada-002",
    "input": ["Hello", "World"]
  }'
```

---

## Text-to-Image

```bash
curl -X POST https://your-worker.workers.dev/v1/images/generations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "dall-e-3",
    "prompt": "A serene mountain landscape at sunset",
    "n": 1,
    "size": "1024x1024"
  }' \
  --output image.png
```

**JSON Response (b64_json format):**
```bash
curl -X POST https://your-worker.workers.dev/v1/images/generations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "stable-diffusion-xl",
    "prompt": "A futuristic city",
    "response_format": "b64_json"
  }'
```

**Response:**
```json
{
  "created": 1710000000,
  "data": [
    {
      "b64_json": "iVBORw0KGgoAAAANSUhEUgA..."
    }
  ]
}
```

---

## Image-to-Image

### JSON Request

```bash
curl -X POST https://your-worker.workers.dev/v1/images/edits \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "stable-diffusion-v1-5",
    "prompt": "Transform into a watercolor painting",
    "image": "base64_encoded_image_data",
    "strength": 0.8
  }' \
  --output edited.png
```

### Multipart Form Data

```bash
curl -X POST https://your-worker.workers.dev/v1/images/edits \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "image=@input.png" \
  -F "prompt=Add a rainbow in the sky" \
  -F "strength=0.6" \
  --output result.png
```

---

## Image Variations

```bash
curl -X POST https://your-worker.workers.dev/v1/images/variations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "image=@input.png" \
  -F "prompt=artistic variation" \
  --output variation.png
```

---

## Text-to-Speech

```bash
curl -X POST https://your-worker.workers.dev/v1/audio/speech \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tts-1",
    "input": "Hello, this is a test of the text to speech API.",
    "voice": "alloy",
    "speed": 1.0
  }' \
  --output speech.mp3
```

**Request Body:**
```json
{
  "model": "tts-1",
  "input": "Hello, this is a test.",
  "voice": "alloy",
  "response_format": "mp3",
  "speed": 1.0
}
```

---

## Speech Recognition (ASR)

```bash
curl -X POST https://your-worker.workers.dev/v1/audio/transcriptions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@audio.mp3" \
  -F "model=whisper-1"
```

**Response:**
```json
{
  "task": "transcribe",
  "language": "english",
  "duration": 0,
  "text": "Hello, this is a transcription of the audio file."
}
```

---

## Audio Translation

```bash
curl -X POST https://your-worker.workers.dev/v1/audio/translations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@audio.mp3" \
  -F "model=whisper-1" \
  -F "target_language=spanish"
```

**Response:**
```json
{
  "task": "translate",
  "language": "spanish",
  "duration": 0,
  "text": "Hola, esta es una traducción del archivo de audio."
}
```

---

## Text Classification

### Sentiment Analysis

```bash
curl -X POST https://your-worker.workers.dev/v1/classifications \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "input": "I absolutely love this product! It exceeded all my expectations."
  }'
```

**Response:**
```json
{
  "id": "classify-1710000000-abc123",
  "object": "text_classification",
  "created": 1710000000,
  "model": "gpt-4",
  "input": "I absolutely love this product!",
  "classification": "positive",
  "labels": ["positive", "negative", "neutral"]
}
```

### Custom Labels

```bash
curl -X POST https://your-worker.workers.dev/v1/classifications \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "input": "The stock market crashed today amid economic concerns.",
    "labels": ["finance", "sports", "politics", "entertainment", "technology"]
  }'
```

**Response:**
```json
{
  "id": "classify-1710000000-abc123",
  "object": "text_classification",
  "created": 1710000000,
  "model": "gpt-4",
  "input": "The stock market crashed today...",
  "classification": "finance",
  "labels": ["finance", "sports", "politics", "entertainment", "technology"]
}
```

---

## Translation

```bash
curl -X POST https://your-worker.workers.dev/v1/translations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "input": "Hello, how are you?",
    "source_language": "english",
    "target_language": "french"
  }'
```

**Response:**
```json
{
  "id": "trans-1710000000-abc123",
  "object": "translation",
  "created": 1710000000,
  "model": "gpt-4",
  "source_language": "english",
  "target_language": "french",
  "text": "Bonjour, comment allez-vous?"
}
```

### Auto-detect Source

```bash
curl -X POST https://your-worker.workers.dev/v1/translations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "input": "Guten Morgen, wie geht es Ihnen?",
    "target_language": "english"
  }'
```

---

## Summarization

### Concise Summary

```bash
curl -X POST https://your-worker.workers.dev/v1/summarizations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "input": "Artificial intelligence has made remarkable strides in recent years, transforming industries from healthcare to finance. Machine learning algorithms can now diagnose diseases with unprecedented accuracy, while natural language processing enables more human-like interactions with computers. However, these advancements also raise important ethical questions about privacy, job displacement, and the potential for misuse.",
    "max_length": 50
  }'
```

**Response:**
```json
{
  "id": "sum-1710000000-abc123",
  "object": "summarization",
  "created": 1710000000,
  "model": "gpt-4",
  "style": "concise",
  "summary": "AI has advanced significantly, benefiting healthcare and finance, but raising ethical concerns about privacy and jobs."
}
```

### Bullet Points

```bash
curl -X POST https://your-worker.workers.dev/v1/summarizations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "input": "Long text here...",
    "style": "bullet"
  }'
```

**Response:**
```json
{
  "id": "sum-1710000000-abc123",
  "object": "summarization",
  "created": 1710000000,
  "model": "gpt-4",
  "style": "bullet",
  "summary": "• AI has advanced in healthcare and finance\n• NLP enables human-like interactions\n• Ethical concerns include privacy and job displacement"
}
```

---

## Vision / Image-to-Text

### JSON Request

```bash
curl -X POST https://your-worker.workers.dev/v1/vision \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "image": "base64_encoded_image_data",
    "messages": [
      {"role": "user", "content": "What objects are in this image?"}
    ]
  }'
```

**Response:**
```json
{
  "id": "vision-1710000000-abc123",
  "object": "vision.completion",
  "created": 1710000000,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "The image contains a red apple, a wooden table, and a glass of water."
      },
      "finish_reason": "stop"
    }
  ]
}
```

### With Data URI

```bash
curl -X POST https://your-worker.workers.dev/v1/vision \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
    "messages": [{"role": "user", "content": "Describe this image"}]
  }'
```

---

## Model Aliases

| Alias | Maps To |
|-------|---------|
| `gpt-4` | `@cf/meta/llama-3.1-8b-instruct` |
| `gpt-4-turbo` | `@cf/meta/llama-3.1-8b-instruct` |
| `gpt-3.5-turbo` | `@cf/meta/llama-3.2-3b-instruct` |
| `gpt-4o` | `@cf/meta/llama-3.2-11b-vision-instruct` |
| `gpt-4o-mini` | `@cf/meta/llama-3.2-3b-instruct` |
| `dall-e-3` | `@cf/blackforestlabs/flux-1-schnell` |
| `dall-e-2` | `@cf/stabilityai/stable-diffusion-xl-base-1.0` |
| `whisper-1` | `@cf/openai/whisper` |
| `text-embedding-ada-002` | `@cf/baai/bge-base-en-v1.5` |
| `llama-3.1-8b` | `@cf/meta/llama-3.1-8b-instruct` |
| `mistral-7b` | `@cf/mistral/mistral-7b-instruct-v0.1` |
| `qwen-14b` | `@cf/qwen/qwen1.5-14b-chat-awq` |
| `gemma-2-9b` | `@cf/google/gemma-2-9b-it` |

You can also use the full Cloudflare model IDs directly (e.g., `@cf/meta/llama-3.1-8b-instruct`).

---

## Error Responses

```json
{
  "error": {
    "message": "Unauthorized",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

| Code | Description |
|------|-------------|
| `invalid_api_key` | Missing or invalid API key |
| `unknown_endpoint` | Endpoint not found |
| `internal_error` | Server error |

---

## Deployment

1. Create a `wrangler.toml` file:

```toml
name = "nooris-api"
main = "worker.js"
compatibility_date = "2024-01-01"

[vars]
API_KEY = "your-secret-api-key"

[[ai]]
binding = "AI"
```

2. Deploy:

```bash
wrangler deploy
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `API_KEY` | Yes | Secret key for API authentication |
| `AI` | Yes | Cloudflare AI binding |

---

## License

MIT
