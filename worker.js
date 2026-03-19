export default {
    async fetch(request, env) {
        const API_KEY = env.API_KEY;
        const url = new URL(request.url);
        const auth = request.headers.get("Authorization");

        if (auth !== `Bearer ${API_KEY}`) {
            return json({ error: { message: "Unauthorized", type: "invalid_request_error", code: "invalid_api_key" } }, 401);
        }

        const path = url.pathname;

        try {
            if (path === "/v1/models" && request.method === "GET") {
                return handleModels();
            }

            if (path === "/v1/chat/completions" && request.method === "POST") {
                return handleChatCompletions(request, env);
            }

            if (path === "/v1/completions" && request.method === "POST") {
                return handleCompletions(request, env);
            }

            if (path === "/v1/embeddings" && request.method === "POST") {
                return handleEmbeddings(request, env);
            }

            if (path === "/v1/images/generations" && request.method === "POST") {
                return handleImageGenerations(request, env);
            }

            if (path === "/v1/images/edits" && request.method === "POST") {
                return handleImageEdits(request, env);
            }

            if (path === "/v1/images/variations" && request.method === "POST") {
                return handleImageVariations(request, env);
            }

            if (path === "/v1/audio/speech" && request.method === "POST") {
                return handleAudioSpeech(request, env);
            }

            if (path === "/v1/audio/transcriptions" && request.method === "POST") {
                return handleAudioTranscriptions(request, env);
            }

            if (path === "/v1/audio/translations" && request.method === "POST") {
                return handleAudioTranslations(request, env);
            }

            if (path === "/v1/classifications" && request.method === "POST") {
                return handleClassifications(request, env);
            }

            if (path === "/v1/translations" && request.method === "POST") {
                return handleTranslations(request, env);
            }

            if (path === "/v1/summarizations" && request.method === "POST") {
                return handleSummarizations(request, env);
            }

            if (path === "/v1/vision" && request.method === "POST") {
                return handleVision(request, env);
            }

            return json({ error: { message: "Not found", type: "invalid_request_error", code: "unknown_endpoint" } }, 404);
        } catch (err) {
            return json({ error: { message: err.message, type: "api_error", code: "internal_error" } }, 500);
        }
    },
};

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
}

function generateId(prefix = "chatcmpl") {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

function handleModels() {
    return json({
        object: "list",
        data: [
            { id: "@cf/meta/llama-3.1-8b-instruct", object: "model", created: Date.now(), owned_by: "meta", permission: [], root: "llama-3.1-8b-instruct" },
            { id: "@cf/meta/llama-3.2-11b-vision-instruct", object: "model", created: Date.now(), owned_by: "meta", permission: [], root: "llama-3.2-11b-vision-instruct" },
            { id: "@cf/meta/llama-3.2-3b-instruct", object: "model", created: Date.now(), owned_by: "meta", permission: [], root: "llama-3.2-3b-instruct" },
            { id: "@cf/mistral/mistral-7b-instruct-v0.1", object: "model", created: Date.now(), owned_by: "mistral", permission: [], root: "mistral-7b-instruct" },
            { id: "@cf/deepseek-ai/deepseek-math-7b-instruct", object: "model", created: Date.now(), owned_by: "deepseek", permission: [], root: "deepseek-math-7b-instruct" },
            { id: "@cf/qwen/qwen1.5-14b-chat-awq", object: "model", created: Date.now(), owned_by: "qwen", permission: [], root: "qwen1.5-14b-chat" },
            { id: "@cf/google/gemma-2-9b-it", object: "model", created: Date.now(), owned_by: "google", permission: [], root: "gemma-2-9b-it" },
            { id: "@cf/openchat/openchat-3.5-0106", object: "model", created: Date.now(), owned_by: "openchat", permission: [], root: "openchat-3.5-0106" },
            { id: "@cf/thebloke/discolm-german-v1", object: "model", created: Date.now(), owned_by: "thebloke", permission: [], root: "discolm-german-v1" },
            { id: "@cf/tiiuae/falcon-7b-instruct", object: "model", created: Date.now(), owned_by: "tiiuae", permission: [], root: "falcon-7b-instruct" },
            { id: "@hf/thebloke/llama-2-13b-chat-awq", object: "model", created: Date.now(), owned_by: "thebloke", permission: [], root: "llama-2-13b-chat" },
            { id: "@hf/thebloke/zephyr-7b-beta-awq", object: "model", created: Date.now(), owned_by: "thebloke", permission: [], root: "zephyr-7b-beta" },
            { id: "@cf/stabilityai/stable-diffusion-xl-base-1.0", object: "model", created: Date.now(), owned_by: "stabilityai", permission: [], root: "stable-diffusion-xl-base-1.0", type: "image" },
            { id: "@cf/blackforestlabs/flux-1-schnell", object: "model", created: Date.now(), owned_by: "blackforestlabs", permission: [], root: "flux-1-schnell", type: "image" },
            { id: "@cf/bytedance/stable-diffusion-xl-lightning", object: "model", created: Date.now(), owned_by: "bytedance", permission: [], root: "stable-diffusion-xl-lightning", type: "image" },
            { id: "@cf/runwayml/stable-diffusion-v1-5-img2img", object: "model", created: Date.now(), owned_by: "runwayml", permission: [], root: "stable-diffusion-v1-5-img2img", type: "image" },
            { id: "@cf/runwayml/stable-diffusion-v1-5-inpainting", object: "model", created: Date.now(), owned_by: "runwayml", permission: [], root: "stable-diffusion-v1-5-inpainting", type: "image" },
            { id: "@cf/lykon/dreamshaper-8-lcm", object: "model", created: Date.now(), owned_by: "lykon", permission: [], root: "dreamshaper-8-lcm", type: "image" },
            { id: "@cf/baai/bge-base-en-v1.5", object: "model", created: Date.now(), owned_by: "baai", permission: [], root: "bge-base-en-v1.5", type: "embedding" },
            { id: "@cf/openai/whisper", object: "model", created: Date.now(), owned_by: "openai", permission: [], root: "whisper", type: "audio" },
        ]
    });
}

async function handleChatCompletions(request, env) {
    const body = await request.json();
    const { model, messages, stream = false, max_tokens = 256, temperature = 0.7, top_p = 1 } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return json({ error: { message: "messages is required and must be an array", type: "invalid_request_error" } }, 400);
    }

    const modelId = resolveModel(model, "text");
    
    const prompt = messages.map(m => {
        if (m.role === "system") return `<|system|>\n${m.content}</s>\n`;
        if (m.role === "user") return `<|user|>\n${m.content}</s>\n`;
        if (m.role === "assistant") return `<|assistant|>\n${m.content}</s>\n`;
        return m.content;
    }).join("") + "<|assistant|>\n";

    if (stream) {
        const result = await env.AI.run(modelId, { prompt, max_tokens, temperature, top_p });
        const text = typeof result === "object" ? result.response || result.generated_text || JSON.stringify(result) : result;
        
        const encoder = new TextEncoder();
        const id = generateId();
        
        const streamData = [
            { id, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model, choices: [{ index: 0, delta: { role: "assistant" }, finish_reason: null }] },
            { id, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model, choices: [{ index: 0, delta: { content: text }, finish_reason: null }] },
            { id, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model, choices: [{ index: 0, delta: {}, finish_reason: "stop" }] }
        ];

        return new Response(
            new ReadableStream({
                start(controller) {
                    streamData.forEach(data => {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                    });
                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                    controller.close();
                }
            }),
            { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" } }
        );
    }

    const result = await env.AI.run(modelId, { prompt, max_tokens, temperature, top_p });
    const text = typeof result === "object" ? result.response || result.generated_text || JSON.stringify(result) : result;

    return json({
        id: generateId(),
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [{
            index: 0,
            message: { role: "assistant", content: text },
            finish_reason: "stop"
        }],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
    });
}

async function handleCompletions(request, env) {
    const body = await request.json();
    const { model, prompt, stream = false, max_tokens = 256, temperature = 0.7, top_p = 1 } = body;

    if (!prompt) {
        return json({ error: { message: "prompt is required", type: "invalid_request_error" } }, 400);
    }

    const modelId = resolveModel(model, "text");
    const result = await env.AI.run(modelId, { prompt, max_tokens, temperature, top_p });
    const text = typeof result === "object" ? result.response || result.generated_text || JSON.stringify(result) : result;

    if (stream) {
        const encoder = new TextEncoder();
        const id = generateId("cmpl");
        
        return new Response(
            new ReadableStream({
                start(controller) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ id, object: "text_completion_chunk", created: Math.floor(Date.now() / 1000), model, choices: [{ index: 0, text, finish_reason: "stop" }] })}\n\n`));
                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                    controller.close();
                }
            }),
            { headers: { "Content-Type": "text/event-stream" } }
        );
    }

    return json({
        id: generateId("cmpl"),
        object: "text_completion",
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [{ index: 0, text, finish_reason: "stop" }],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
    });
}

async function handleEmbeddings(request, env) {
    const body = await request.json();
    const { model, input, encoding_format = "float" } = body;

    if (!input) {
        return json({ error: { message: "input is required", type: "invalid_request_error" } }, 400);
    }

    const texts = Array.isArray(input) ? input : [input];
    const modelId = resolveModel(model, "embedding");

    const embeddings = [];
    for (const text of texts) {
        const result = await env.AI.run(modelId, { text });
        embeddings.push(result.data?.[0]?.embedding || result.embedding || result);
    }

    return json({
        object: "list",
        data: embeddings.map((embedding, i) => ({
            object: "embedding",
            index: i,
            embedding: encoding_format === "base64" ? btoa(JSON.stringify(embedding)) : embedding
        })),
        model,
        usage: { prompt_tokens: 0, total_tokens: 0 }
    });
}

async function handleImageGenerations(request, env) {
    const body = await request.json();
    const { model, prompt, n = 1, size = "1024x1024", response_format = "url" } = body;

    if (!prompt) {
        return json({ error: { message: "prompt is required", type: "invalid_request_error" } }, 400);
    }

    const modelId = resolveModel(model, "image");

    const result = await env.AI.run(modelId, { prompt });

    if (response_format === "b64_json") {
        const base64 = arrayBufferToBase64(result);
        return json({
            created: Math.floor(Date.now() / 1000),
            data: Array(n).fill(null).map(() => ({ b64_json: base64 }))
        });
    }

    return new Response(result, { headers: { "Content-Type": "image/png" } });
}

async function handleImageEdits(request, env) {
    const contentType = request.headers.get("Content-Type") || "";
    
    if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        const image = formData.get("image");
        const prompt = formData.get("prompt");
        const model = formData.get("model") || "stable-diffusion-v1-5-img2img";
        const strength = parseFloat(formData.get("strength")) || 0.8;

        if (!prompt) {
            return json({ error: { message: "prompt is required", type: "invalid_request_error" } }, 400);
        }

        const modelId = resolveModel(model, "img2img");
        const imageData = await image.arrayBuffer();
        const base64Image = arrayBufferToBase64(imageData);

        const result = await env.AI.run(modelId, {
            prompt,
            image: base64Image
        });

        return new Response(result, { headers: { "Content-Type": "image/png" } });
    }

    const body = await request.json();
    const { model, prompt, image, strength = 0.8 } = body;

    if (!prompt || !image) {
        return json({ error: { message: "prompt and image are required", type: "invalid_request_error" } }, 400);
    }

    const modelId = resolveModel(model, "img2img");
    const result = await env.AI.run(modelId, { prompt, image });

    return new Response(result, { headers: { "Content-Type": "image/png" } });
}

async function handleImageVariations(request, env) {
    const contentType = request.headers.get("Content-Type") || "";
    
    if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        const image = formData.get("image");
        const prompt = formData.get("prompt") || "variations of this image";

        const modelId = "@cf/runwayml/stable-diffusion-v1-5-img2img";
        const imageData = await image.arrayBuffer();
        const base64Image = arrayBufferToBase64(imageData);

        const result = await env.AI.run(modelId, {
            prompt,
            image: base64Image
        });

        return new Response(result, { headers: { "Content-Type": "image/png" } });
    }

    return json({ error: { message: "multipart/form-data required", type: "invalid_request_error" } }, 400);
}

async function handleAudioSpeech(request, env) {
    const body = await request.json();
    const { model, input, voice = "alloy", response_format = "mp3", speed = 1.0 } = body;

    if (!input) {
        return json({ error: { message: "input is required", type: "invalid_request_error" } }, 400);
    }

    const modelId = resolveModel(model, "tts") || "@cf/openai/whisper-tts-en";
    
    try {
        const result = await env.AI.run(modelId, { text: input, voice, speed });
        return new Response(result, { headers: { "Content-Type": `audio/${response_format}` } });
    } catch (err) {
        return json({
            created: Math.floor(Date.now() / 1000),
            data: [{ message: "TTS model not available, text input preserved", input, voice, speed }]
        });
    }
}

async function handleAudioTranscriptions(request, env) {
    const contentType = request.headers.get("Content-Type") || "";
    
    if (!contentType.includes("multipart/form-data")) {
        return json({ error: { message: "multipart/form-data required", type: "invalid_request_error" } }, 400);
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const model = formData.get("model") || "whisper-1";

    const modelId = resolveModel(model, "audio");
    const audioData = await file.arrayBuffer();

    const result = await env.AI.run(modelId, { audio: [...new Uint8Array(audioData)] });
    const text = result.text || result.transcription || JSON.stringify(result);

    return json({
        task: "transcribe",
        language: "english",
        duration: 0,
        text
    });
}

async function handleAudioTranslations(request, env) {
    const contentType = request.headers.get("Content-Type") || "";
    
    if (!contentType.includes("multipart/form-data")) {
        return json({ error: { message: "multipart/form-data required", type: "invalid_request_error" } }, 400);
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const model = formData.get("model") || "whisper-1";
    const target_lang = formData.get("target_language") || "english";

    const modelId = resolveModel(model, "audio");
    const audioData = await file.arrayBuffer();

    const result = await env.AI.run(modelId, { audio: [...new Uint8Array(audioData)] });
    const text = result.text || result.transcription || JSON.stringify(result);

    const translateModelId = "@cf/meta/llama-3.1-8b-instruct";
    const translationPrompt = `Translate the following text to ${target_lang}. Only output the translation, nothing else:\n\n${text}`;
    const translation = await env.AI.run(translateModelId, { prompt: translationPrompt, max_tokens: 1000 });
    const translatedText = typeof translation === "object" ? translation.response || translation.generated_text : translation;

    return json({
        task: "translate",
        language: target_lang,
        duration: 0,
        text: translatedText
    });
}

async function handleClassifications(request, env) {
    const body = await request.json();
    const { model, input, labels = [] } = body;

    if (!input) {
        return json({ error: { message: "input is required", type: "invalid_request_error" } }, 400);
    }

    const modelId = resolveModel(model, "text");
    
    const classificationPrompt = labels.length > 0
        ? `Classify the following text into one of these categories: ${labels.join(", ")}. Only respond with the category name.\n\nText: ${input}\n\nCategory:`
        : `Classify the sentiment of this text as positive, negative, or neutral. Only respond with the classification.\n\nText: ${input}\n\nSentiment:`;

    const result = await env.AI.run(modelId, { prompt: classificationPrompt, max_tokens: 50 });
    const classification = typeof result === "object" ? result.response || result.generated_text : result;

    return json({
        id: generateId("classify"),
        object: "text_classification",
        created: Math.floor(Date.now() / 1000),
        model,
        input,
        classification: classification.trim(),
        labels: labels.length > 0 ? labels : ["positive", "negative", "neutral"]
    });
}

async function handleTranslations(request, env) {
    const body = await request.json();
    const { model, input, source_language, target_language } = body;

    if (!input || !target_language) {
        return json({ error: { message: "input and target_language are required", type: "invalid_request_error" } }, 400);
    }

    const modelId = resolveModel(model, "text");
    
    const prompt = source_language
        ? `Translate the following ${source_language} text to ${target_language}. Only output the translation, nothing else:\n\n${input}`
        : `Translate the following text to ${target_language}. Only output the translation, nothing else:\n\n${input}`;

    const result = await env.AI.run(modelId, { prompt, max_tokens: 2048 });
    const translation = typeof result === "object" ? result.response || result.generated_text : result;

    return json({
        id: generateId("trans"),
        object: "translation",
        created: Math.floor(Date.now() / 1000),
        model,
        source_language: source_language || "auto-detected",
        target_language,
        text: translation.trim()
    });
}

async function handleSummarizations(request, env) {
    const body = await request.json();
    const { model, input, max_length = 200, style = "concise" } = body;

    if (!input) {
        return json({ error: { message: "input is required", type: "invalid_request_error" } }, 400);
    }

    const modelId = resolveModel(model, "text");
    
    const prompt = style === "detailed"
        ? `Provide a detailed summary of the following text. Include all key points:\n\n${input}\n\nDetailed Summary:`
        : style === "bullet"
        ? `Summarize the following text in bullet points:\n\n${input}\n\nBullet Point Summary:`
        : `Summarize the following text concisely in no more than ${max_length} words:\n\n${input}\n\nSummary:`;

    const result = await env.AI.run(modelId, { prompt, max_tokens: max_length * 2 });
    const summary = typeof result === "object" ? result.response || result.generated_text : result;

    return json({
        id: generateId("sum"),
        object: "summarization",
        created: Math.floor(Date.now() / 1000),
        model,
        style,
        summary: summary.trim()
    });
}

async function handleVision(request, env) {
    const body = await request.json();
    const { model, messages, image } = body;

    if (!messages && !image) {
        return json({ error: { message: "messages or image is required", type: "invalid_request_error" } }, 400);
    }

    const modelId = resolveModel(model, "vision");
    
    if (image) {
        const prompt = messages?.[0]?.content || "Describe this image in detail.";
        const imageData = image.startsWith("data:") ? image.split(",")[1] : image;
        
        const result = await env.AI.run(modelId, {
            prompt,
            image: imageData,
            max_tokens: 500
        });

        const text = typeof result === "object" ? result.response || result.generated_text || result.description : result;

        return json({
            id: generateId("vision"),
            object: "vision.completion",
            created: Math.floor(Date.now() / 1000),
            model,
            choices: [{
                index: 0,
                message: { role: "assistant", content: text },
                finish_reason: "stop"
            }]
        });
    }

    const visionPrompt = messages.map(m => {
        if (typeof m.content === "string") return m.content;
        if (Array.isArray(m.content)) {
            return m.content.map(c => c.type === "text" ? c.text : "").join(" ");
        }
        return "";
    }).join("\n");

    const result = await env.AI.run(modelId, { prompt: visionPrompt, max_tokens: 500 });
    const text = typeof result === "object" ? result.response || result.generated_text : result;

    return json({
        id: generateId("vision"),
        object: "vision.completion",
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [{
            index: 0,
            message: { role: "assistant", content: text },
            finish_reason: "stop"
        }]
    });
}

function resolveModel(model, type) {
    const modelAliases = {
        "gpt-4": "@cf/meta/llama-3.1-8b-instruct",
        "gpt-4-turbo": "@cf/meta/llama-3.1-8b-instruct",
        "gpt-3.5-turbo": "@cf/meta/llama-3.2-3b-instruct",
        "gpt-4o": "@cf/meta/llama-3.2-11b-vision-instruct",
        "gpt-4o-mini": "@cf/meta/llama-3.2-3b-instruct",
        "claude-3-opus": "@cf/meta/llama-3.1-8b-instruct",
        "claude-3-sonnet": "@cf/meta/llama-3.2-3b-instruct",
        "dall-e-3": "@cf/blackforestlabs/flux-1-schnell",
        "dall-e-2": "@cf/stabilityai/stable-diffusion-xl-base-1.0",
        "stable-diffusion-xl": "@cf/stabilityai/stable-diffusion-xl-base-1.0",
        "stable-diffusion-v1-5": "@cf/runwayml/stable-diffusion-v1-5-img2img",
        "flux-1-schnell": "@cf/blackforestlabs/flux-1-schnell",
        "flux": "@cf/blackforestlabs/flux-1-schnell",
        "whisper-1": "@cf/openai/whisper",
        "whisper": "@cf/openai/whisper",
        "text-embedding-ada-002": "@cf/baai/bge-base-en-v1.5",
        "text-embedding-3-small": "@cf/baai/bge-base-en-v1.5",
        "text-embedding-3-large": "@cf/baai/bge-base-en-v1.5",
        "llama-3.1-8b": "@cf/meta/llama-3.1-8b-instruct",
        "llama-3.2-3b": "@cf/meta/llama-3.2-3b-instruct",
        "llama-3.2-11b-vision": "@cf/meta/llama-3.2-11b-vision-instruct",
        "mistral-7b": "@cf/mistral/mistral-7b-instruct-v0.1",
        "qwen-14b": "@cf/qwen/qwen1.5-14b-chat-awq",
        "gemma-2-9b": "@cf/google/gemma-2-9b-it",
        "deepseek-math": "@cf/deepseek-ai/deepseek-math-7b-instruct",
    };

    if (modelAliases[model]) return modelAliases[model];
    if (model.startsWith("@cf/") || model.startsWith("@hf/")) return model;

    const defaults = {
        text: "@cf/meta/llama-3.1-8b-instruct",
        image: "@cf/stabilityai/stable-diffusion-xl-base-1.0",
        img2img: "@cf/runwayml/stable-diffusion-v1-5-img2img",
        embedding: "@cf/baai/bge-base-en-v1.5",
        audio: "@cf/openai/whisper",
        vision: "@cf/meta/llama-3.2-11b-vision-instruct",
        tts: "@cf/openai/whisper"
    };

    return defaults[type] || defaults.text;
}

function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
