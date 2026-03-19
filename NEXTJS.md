# Nooris API - Next.js Integration

A Next.js frontend for the Nooris API with a modern, user-friendly interface.

## Setup

```bash
# Create new Next.js app
npx create-next-app@latest nooris-ui --typescript --tailwind --eslint
cd nooris-ui

# Install dependencies
npm install

# Copy the worker.js to your API directory
# Deploy the worker first
wrangler deploy
```

## Environment Variables

Create `.env.local` in the Next.js project root:

```env
NEXT_PUBLIC_API_URL=https://your-worker.workers.dev
API_KEY=your-api-key-here
```

## Project Structure

```
nooris-ui/
├── app/
│   ├── page.tsx          # Home page
│   ├── layout.tsx        # Root layout
│   ├── globals.css       # Global styles
│   ├── chat/
│   │   └── page.tsx     # Chat interface
│   ├── image/
│   │   └── page.tsx     # Image generation
│   ├── transcribe/
│   │   └── page.tsx     # Speech to text
│   ├── translate/
│   │   └── page.tsx     # Translation
│   └── api/
│       └── nooris/
│           └── route.ts # API proxy route
├── components/
│   ├── Chat.tsx          # Chat component
│   ├── ImageGen.tsx      # Image generator
│   ├── AudioRecorder.tsx # Audio recorder
│   ├── ModelSelector.tsx # Model dropdown
│   └── LoadingSpinner.tsx
├── lib/
│   └── api.ts            # API client functions
└── types/
    └── index.ts          # TypeScript types
```

## API Client (lib/api.ts)

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const API_KEY = process.env.API_KEY;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function chatCompletion(
  messages: ChatMessage[],
  model: string = 'gpt-4'
): Promise<string> {
  const response = await fetch(`${API_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 256,
    }),
  });

  if (!response.ok) {
    throw new Error('API request failed');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function generateImage(
  prompt: string,
  model: string = 'dall-e-3',
  size: string = '1024x1024'
): Promise<Blob> {
  const response = await fetch(`${API_URL}/v1/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      size,
    }),
  });

  if (!response.ok) {
    throw new Error('Image generation failed');
  }

  return response.blob();
}

export async function transcribeAudio(audioFile: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', audioFile);
  formData.append('model', 'whisper-1');

  const response = await fetch(`${API_URL}/v1/audio/transcriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Transcription failed');
  }

  const data = await response.json();
  return data.text;
}

export async function translateText(
  text: string,
  targetLang: string,
  sourceLang?: string
): Promise<string> {
  const body: Record<string, string> = {
    model: 'gpt-4',
    input: text,
    target_language: targetLang,
  };
  if (sourceLang) body.source_language = sourceLang;

  const response = await fetch(`${API_URL}/v1/translations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Translation failed');
  }

  const data = await response.json();
  return data.text;
}

export async function listModels(): Promise<string[]> {
  const response = await fetch(`${API_URL}/v1/models`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch models');
  }

  const data = await response.json();
  return data.data.map((m: { id: string }) => m.id);
}
```

## Components

### Chat Component (components/Chat.tsx)

```typescript
'use client';

import { useState } from 'react';
import { chatCompletion } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('gpt-4');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatCompletion([...messages, userMessage], model);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="border rounded p-2"
        >
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="@cf/meta/llama-3.1-8b-instruct">Llama 3.1</option>
        </select>
      </div>

      <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}
          >
            <p className="font-semibold text-sm">{msg.role}</p>
            <p>{msg.content}</p>
          </div>
        ))}
        {loading && <p className="text-gray-500">Thinking...</p>}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 border p-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
```

### Image Generator (components/ImageGen.tsx)

```typescript
'use client';

import { useState } from 'react';
import { generateImage } from '@/lib/api';

export default function ImageGen() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState('1024x1024');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    try {
      const blob = await generateImage(prompt, 'dall-e-3', size);
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the image you want to generate..."
        className="w-full border p-3 rounded h-32"
      />

      <div className="flex gap-4 mt-4">
        <select
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="1024x1024">1024 x 1024</option>
          <option value="512x512">512 x 512</option>
          <option value="256x256">256 x 256</option>
        </select>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-purple-500 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {imageUrl && (
        <div className="mt-6">
          <img src={imageUrl} alt="Generated" className="w-full rounded shadow" />
          <a
            href={imageUrl}
            download="generated-image.png"
            className="inline-block mt-2 text-blue-500"
          >
            Download
          </a>
        </div>
      )}
    </div>
  );
}
```

### Audio Recorder (components/AudioRecorder.tsx)

```typescript
'use client';

import { useState, useRef } from 'react';
import { transcribeAudio } from '@/lib/api';

export default function AudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleTranscribe = async () => {
    if (!audioUrl) return;
    setLoading(true);

    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const file = new File([blob], 'audio.webm', { type: 'audio/webm' });
      const text = await transcribeAudio(file);
      setTranscript(text);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex gap-4 mb-4">
        {!recording ? (
          <button
            onClick={startRecording}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Stop Recording
          </button>
        )}
      </div>

      {audioUrl && (
        <div className="mb-4">
          <audio src={audioUrl} controls className="w-full" />
          <button
            onClick={handleTranscribe}
            disabled={loading}
            className="mt-2 bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Transcribing...' : 'Transcribe'}
          </button>
        </div>
      )}

      {transcript && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="font-semibold">Transcript:</p>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
}
```

## Pages

### Home Page (app/page.tsx)

```typescript
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Nooris AI</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/chat" className="p-6 border rounded hover:bg-gray-50">
          <h2 className="text-xl font-semibold">Chat</h2>
          <p className="text-gray-600">Conversational AI</p>
        </Link>

        <Link href="/image" className="p-6 border rounded hover:bg-gray-50">
          <h2 className="text-xl font-semibold">Image Generation</h2>
          <p className="text-gray-600">Create images from text</p>
        </Link>

        <Link href="/transcribe" className="p-6 border rounded hover:bg-gray-50">
          <h2 className="text-xl font-semibold">Speech to Text</h2>
          <p className="text-gray-600">Transcribe audio</p>
        </Link>

        <Link href="/translate" className="p-6 border rounded hover:bg-gray-50">
          <h2 className="text-xl font-semibold">Translation</h2>
          <p className="text-gray-50">Translate text</p>
        </Link>
      </div>
    </main>
  );
}
```

### Chat Page (app/chat/page.tsx)

```typescript
import Chat from '@/components/Chat';

export default function ChatPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Chat</h1>
      <Chat />
    </main>
  );
}
```

## Running the App

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Deploy to Vercel
vercel deploy
```

## Deployment to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
# or use:
vercel env add NEXT_PUBLIC_API_URL
vercel env add API_KEY
```
