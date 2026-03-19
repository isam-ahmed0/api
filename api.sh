#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

API_URL="${NOORIS_API_URL:-https://api.isamahmed782.workers.dev}"
API_KEY="${NOORIS_API_KEY:-isam-gdisg9ujh5ujhfui-fyi}"
IMAGE_COUNTER_FILE="./.nooris_image_counter"

get_image_counter() {
    if [[ -f "$IMAGE_COUNTER_FILE" ]]; then
        cat "$IMAGE_COUNTER_FILE"
    else
        echo "1"
    fi
}

increment_image_counter() {
    local count=$(get_image_counter)
    echo $((count + 1)) > "$IMAGE_COUNTER_FILE"
}

reset_image_counter() {
    echo "1" > "$IMAGE_COUNTER_FILE"
}

save_image() {
    local data="$1"
    local ext="${2:-jpg}"
    local counter=$(get_image_counter)
    local filename="image${counter}.${ext}"
    increment_image_counter
    
    if [[ "$data" =~ ^data:image/ ]]; then
        local b64=$(echo "$data" | grep -o 'base64,.*$' | sed 's/base64,//')
        echo "$b64" | base64 -d > "$filename"
    else
        echo "$data" | base64 -d > "$filename"
    fi
    
    echo "$filename"
}

print_error() {
    echo -e "${RED}Error: $1${NC}" >&2
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

usage() {
    cat << EOF
${BOLD}Nooris API CLI${NC} - OpenAI-style API client

${BOLD}USAGE:${NC}
    api <command> [options]

${BOLD}COMMANDS:${NC}
    ${GREEN}chat${NC} <message>              Chat completion
    ${GREEN}complete${NC} <prompt>           Text completion
    ${GREEN}embed${NC} <text>                Generate embeddings
    ${GREEN}image${NC} <prompt>              Generate image (auto-saves as image1.jpg, image2.jpg, ...)
    ${GREEN}img2img${NC} <image> <prompt>   Image-to-image transformation
    ${GREEN}variation${NC} <image>           Generate image variation
    ${GREEN}transcribe${NC} <audio>          Transcribe audio to text
    ${GREEN}translate-audio${NC} <audio> <lang>  Translate audio
    ${GREEN}tts${NC} <text>                  Text-to-speech
    ${GREEN}classify${NC} <text> [labels]    Classify text (default: positive/negative/neutral)
    ${GREEN}translate${NC} <text> <lang>     Translate text
    ${GREEN}summarize${NC} <text>            Summarize text
    ${GREEN}vision${NC} <image> [question]   Analyze image (default: describe)
    ${GREEN}models${NC}                      List available models

${BOLD}OPTIONS:${NC}
    -m, --model <model>         Specify model (default: gpt-4)
    -t, --temperature <n>       Set temperature (default: 0.7)
    -o, --max-tokens <n>        Set max tokens (default: 256)
    -s, --size <WxH>           Image size (default: 1024x1024)
    -n, --count <n>             Number of images (default: 1)
    -f, --format <format>       Output format (json/text/file)
    -S, --stream                Enable streaming
    -c, --counter <n>           Set image counter
    -r, --reset                 Reset image counter
    --system <message>          System message for chat
    --style <style>             Summarization style (concise/bullet/detailed)
    --labels <a,b,c>            Comma-separated classification labels
    --source <lang>             Source language for translation

${BOLD}ENVIRONMENT:${NC}
    NOORIS_API_URL              API base URL
    NOORIS_API_KEY              API key

${BOLD}EXAMPLES:${NC}
    api chat "Hello, how are you?"
    api image "A beautiful sunset"
    api image "A cat" -n 3 -s 512x512
    api img2img input.jpg "make it blue"
    api transcribe audio.mp3
    api translate "Hello world" spanish
    api summarize "Long text to summarize..."
    api vision photo.jpg "What is this?"

EOF
    exit 1
}

require_api_key() {
    if [[ -z "$API_KEY" ]]; then
        print_error "API key required. Set NOORIS_API_KEY environment variable."
        exit 1
    fi
}

api_request() {
    local endpoint="$1"
    local data="$2"
    local method="${3:-POST}"
    
    if [[ "$method" == "GET" ]]; then
        curl -s -X GET "${API_URL}${endpoint}" \
            -H "Authorization: Bearer ${API_KEY}" \
            -H "Content-Type: application/json"
    else
        curl -s -X POST "${API_URL}${endpoint}" \
            -H "Authorization: Bearer ${API_KEY}" \
            -H "Content-Type: application/json" \
            -d "$data"
    fi
}

cmd_models() {
    require_api_key
    local response=$(curl -s -X GET "${API_URL}/v1/models" \
        -H "Authorization: Bearer ${API_KEY}")
    
    if command -v jq &> /dev/null; then
        echo "$response" | jq '.data[] | .id' 2>/dev/null | sed 's/"//g' | sort
    else
        echo "$response" | grep -o '"id": "[^"]*"' | sed 's/"id": "//;s/"//g' | sort
    fi
}

cmd_chat() {
    require_api_key
    local message="$1"
    local system="${SYSTEM_MSG:-}"
    local model="${MODEL:-gpt-4}"
    local temperature="${TEMPERATURE:-0.7}"
    local max_tokens="${MAX_TOKENS:-256}"
    
    local messages="["
    if [[ -n "$system" ]]; then
        messages+="{\"role\": \"system\", \"content\": \"$system\"},"
    fi
    messages+="{\"role\": \"user\", \"content\": \"$message\"}]"
    
    local data=$(cat << EOF
{
    "model": "$model",
    "messages": $messages,
    "temperature": $temperature,
    "max_tokens": $max_tokens
}
EOF
)
    
    local response=$(curl -s -f -X POST "${API_URL}/v1/chat/completions" \
        -H "Authorization: Bearer ${API_KEY}" \
        -H "Content-Type: application/json" \
        -d "$data" 2>&1) || {
        print_error "Request failed: $response"
        return 1
    }
    
    if echo "$response" | grep -q "error"; then
        print_error "$(echo "$response" | grep -o '"message": "[^"]*"' | head -1 | sed 's/"message": "//;s/"//')"
        return 1
    fi
    
    if command -v jq &> /dev/null; then
        echo "$response" | jq -r '.choices[0].message.content'
    else
        echo "$response" | grep -o '"content": "[^"]*"' | head -1 | sed 's/"content": "//;s/"//'
    fi
}

cmd_complete() {
    require_api_key
    local prompt="$1"
    local model="${MODEL:-gpt-3.5-turbo}"
    local max_tokens="${MAX_TOKENS:-256}"
    
    local data=$(cat << EOF
{
    "model": "$model",
    "prompt": "$prompt",
    "max_tokens": $max_tokens
}
EOF
)
    
    local response=$(curl -s -f -X POST "${API_URL}/v1/completions" \
        -H "Authorization: Bearer ${API_KEY}" \
        -H "Content-Type: application/json" \
        -d "$data" 2>&1) || {
        print_error "Request failed: $response"
        return 1
    }
    
    if command -v jq &> /dev/null; then
        echo "$response" | jq -r '.choices[0].text'
    else
        echo "$response" | grep -o '"text": "[^"]*"' | head -1 | sed 's/"text": "//;s/"//'
    fi
}

cmd_embed() {
    require_api_key
    local text="$1"
    local model="${MODEL:-text-embedding-ada-002}"
    
    local data=$(cat << EOF
{
    "model": "$model",
    "input": "$text"
}
EOF
)
    
    local response=$(curl -s -f -X POST "${API_URL}/v1/embeddings" \
        -H "Authorization: Bearer ${API_KEY}" \
        -H "Content-Type: application/json" \
        -d "$data" 2>&1) || {
        print_error "Request failed: $response"
        return 1
    }
    
    if [[ "$FORMAT" == "json" ]]; then
        echo "$response"
    else
        if command -v jq &> /dev/null; then
            echo "$response" | jq -r '.data[0].embedding | length' 2>/dev/null && echo "Embedding vector ($response | jq -r '.data[0].embedding | length') dimensions"
        fi
        echo "First 5 values: $(echo "$response" | jq -r '.data[0].embedding[:5]')"
    fi
}

cmd_image() {
    require_api_key
    local prompt="$1"
    local count="${IMAGE_COUNT:-1}"
    local size="${IMAGE_SIZE:-1024x1024}"
    local model="${MODEL:-dall-e-3}"
    
    print_info "Generating $count image(s)..."
    
    for i in $(seq 1 $count); do
        print_info "Generating image $i/$count..."
        
        local data=$(cat << EOF
{
    "model": "$model",
    "prompt": "$prompt",
    "n": 1,
    "size": "$size"
}
EOF
)
        
        local response=$(curl -s -f -X POST "${API_URL}/v1/images/generations" \
            -H "Authorization: Bearer ${API_KEY}" \
            -H "Content-Type: application/json" \
            -d "$data" 2>&1) || {
            print_error "Image $i failed: $response"
            continue
        }
        
        if echo "$response" | grep -q "error"; then
            print_error "$(echo "$response" | grep -o '"message": "[^"]*"' | head -1)"
            continue
        fi
        
        local filename=$(save_image "$response")
        print_success "Saved: $filename"
    done
}

cmd_img2img() {
    require_api_key
    local image_path="$1"
    local prompt="$2"
    local strength="${IMG2IMG_STRENGTH:-0.8}"
    
    if [[ ! -f "$image_path" ]]; then
        print_error "Image file not found: $image_path"
        exit 1
    fi
    
    local b64=$(base64 -w 0 "$image_path")
    local model="${MODEL:-stable-diffusion-v1-5}"
    
    local data=$(cat << EOF
{
    "model": "$model",
    "prompt": "$prompt",
    "image": "$b64",
    "strength": $strength
}
EOF
)
    
    local response=$(curl -s -f -X POST "${API_URL}/v1/images/edits" \
        -H "Authorization: Bearer ${API_KEY}" \
        -H "Content-Type: application/json" \
        -d "$data" 2>&1) || {
        print_error "Request failed: $response"
        return 1
    }
    
    local filename=$(save_image "$response")
    print_success "Saved: $filename"
}

cmd_variation() {
    require_api_key
    local image_path="$1"
    local prompt="${2:-artistic variation}"
    
    if [[ ! -f "$image_path" ]]; then
        print_error "Image file not found: $image_path"
        exit 1
    fi
    
    local b64=$(base64 -w 0 "$image_path")
    
    local response=$(curl -s -f -X POST "${API_URL}/v1/images/variations" \
        -H "Authorization: Bearer ${API_KEY}" \
        -F "image=@${image_path}" \
        -F "prompt=${prompt}" 2>&1) || {
        print_error "Request failed: $response"
        return 1
    }
    
    local filename=$(save_image "$response")
    print_success "Saved: $filename"
}

cmd_transcribe() {
    require_api_key
    local audio_path="$1"
    
    if [[ ! -f "$audio_path" ]]; then
        print_error "Audio file not found: $audio_path"
        exit 1
    fi
    
    local model="${MODEL:-whisper-1}"
    
    local response=$(curl -s -f -X POST "${API_URL}/v1/audio/transcriptions" \
        -H "Authorization: Bearer ${API_KEY}" \
        -F "file=@${audio_path}" \
        -F "model=${model}" 2>&1) || {
        print_error "Request failed: $response"
        return 1
    }
    
    if command -v jq &> /dev/null; then
        echo "$response" | jq -r '.text'
    else
        echo "$response" | grep -o '"text": "[^"]*"' | sed 's/"text": "//;s/"//'
    fi
}

cmd_translate_audio() {
    require_api_key
    local audio_path="$1"
    local target_lang="${2:-english}"
    
    if [[ ! -f "$audio_path" ]]; then
        print_error "Audio file not found: $audio_path"
        exit 1
    fi
    
    local response=$(curl -s -f -X POST "${API_URL}/v1/audio/translations" \
        -H "Authorization: Bearer ${API_KEY}" \
        -F "file=@${audio_path}" \
        -F "target_language=${target_lang}" 2>&1) || {
        print_error "Request failed: $response"
        return 1
    }
    
    if command -v jq &> /dev/null; then
        echo "$response" | jq -r '.text'
    else
        echo "$response" | grep -o '"text": "[^"]*"' | sed 's/"text": "//;s/"//'
    fi
}

cmd_tts() {
    require_api_key
    local text="$1"
    local voice="${TTS_VOICE:-alloy}"
    local output="${2:-speech.mp3}"
    
    local data=$(cat << EOF
{
    "model": "tts-1",
    "input": "$text",
    "voice": "$voice"
}
EOF
)
    
    local response=$(curl -s -f -X POST "${API_URL}/v1/audio/speech" \
        -H "Authorization: Bearer ${API_KEY}" \
        -H "Content-Type: application/json" \
        -d "$data" -o "$output" 2>&1) || {
        print_error "Request failed: $response"
        return 1
    }
    
    print_success "Saved: $output"
}

cmd_classify() {
    require_api_key
    local text="$1"
    local labels="${CLASSIFY_LABELS:-positive,negative,neutral}"
    local model="${MODEL:-gpt-4}"
    
    local labels_json="[$(echo "$labels" | sed 's/,/" ,"/g' | sed 's/^/"/;s/$/"/')]"
    
    local data=$(cat << EOF
{
    "model": "$model",
    "input": "$text",
    "labels": $labels_json
}
EOF
)
    
    local response=$(curl -s -f -X POST "${API_URL}/v1/classifications" \
        -H "Authorization: Bearer ${API_KEY}" \
        -H "Content-Type: application/json" \
        -d "$data" 2>&1) || {
        print_error "Request failed: $response"
        return 1
    }
    
    if command -v jq &> /dev/null; then
        echo "$response" | jq -r '.classification'
    else
        echo "$response" | grep -o '"classification": "[^"]*"' | sed 's/"classification": "//;s/"//'
    fi
}

cmd_translate() {
    require_api_key
    local text="$1"
    local target_lang="$2"
    local source_lang="${SOURCE_LANG:-}"
    local model="${MODEL:-gpt-4}"
    
    if [[ -z "$target_lang" ]]; then
        print_error "Target language required"
        exit 1
    fi
    
    local data="{\"model\": \"$model\", \"input\": \"$text\", \"target_language\": \"$target_lang\"}"
    if [[ -n "$source_lang" ]]; then
        data="{\"model\": \"$model\", \"input\": \"$text\", \"target_language\": \"$target_lang\", \"source_language\": \"$source_lang\"}"
    fi
    
    local response=$(curl -s -f -X POST "${API_URL}/v1/translations" \
        -H "Authorization: Bearer ${API_KEY}" \
        -H "Content-Type: application/json" \
        -d "$data" 2>&1) || {
        print_error "Request failed: $response"
        return 1
    }
    
    if command -v jq &> /dev/null; then
        echo "$response" | jq -r '.text'
    else
        echo "$response" | grep -o '"text": "[^"]*"' | sed 's/"text": "//;s/"//'
    fi
}

cmd_summarize() {
    require_api_key
    local text="$1"
    local style="${SUMMARIZE_STYLE:-concise}"
    local model="${MODEL:-gpt-4}"
    
    local data=$(cat << EOF
{
    "model": "$model",
    "input": "$text",
    "style": "$style"
}
EOF
)
    
    local response=$(curl -s -f -X POST "${API_URL}/v1/summarizations" \
        -H "Authorization: Bearer ${API_KEY}" \
        -H "Content-Type: application/json" \
        -d "$data" 2>&1) || {
        print_error "Request failed: $response"
        return 1
    }
    
    if command -v jq &> /dev/null; then
        echo "$response" | jq -r '.summary'
    else
        echo "$response" | grep -o '"summary": "[^"]*"' | sed 's/"summary": "//;s/"//'
    fi
}

cmd_vision() {
    require_api_key
    local image_path="$1"
    local question="${2:-Describe this image in detail.}"
    
    if [[ ! -f "$image_path" ]]; then
        print_error "Image file not found: $image_path"
        exit 1
    fi
    
    local b64=$(base64 -w 0 "$image_path")
    local model="${MODEL:-gpt-4o}"
    
    local data=$(cat << EOF
{
    "model": "$model",
    "image": "$b64",
    "messages": [{"role": "user", "content": "$question"}]
}
EOF
)
    
    local response=$(curl -s -f -X POST "${API_URL}/v1/vision" \
        -H "Authorization: Bearer ${API_KEY}" \
        -H "Content-Type: application/json" \
        -d "$data" 2>&1) || {
        print_error "Request failed: $response"
        return 1
    }
    
    if echo "$response" | grep -q "error"; then
        print_error "$(echo "$response" | grep -o '"message": "[^"]*"' | head -1)"
        return 1
    fi
    
    if command -v jq &> /dev/null; then
        echo "$response" | jq -r '.choices[0].message.content'
    else
        echo "$response" | grep -o '"content": "[^"]*"' | head -1 | sed 's/"content": "//;s/"//'
    fi
}

parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -m|--model) MODEL="$2"; shift 2 ;;
            -t|--temperature) TEMPERATURE="$2"; shift 2 ;;
            -o|--max-tokens) MAX_TOKENS="$2"; shift 2 ;;
            -s|--size) IMAGE_SIZE="$2"; shift 2 ;;
            -n|--count) IMAGE_COUNT="$2"; shift 2 ;;
            -f|--format) FORMAT="$2"; shift 2 ;;
            -S|--stream) STREAM=true; shift ;;
            -c|--counter) echo "$2" > "$IMAGE_COUNTER_FILE"; shift 2 ;;
            -r|--reset) reset_image_counter; print_info "Counter reset"; shift ;;
            --system) SYSTEM_MSG="$2"; shift 2 ;;
            --style) SUMMARIZE_STYLE="$2"; shift 2 ;;
            --labels) CLASSIFY_LABELS="$2"; shift 2 ;;
            --source) SOURCE_LANG="$2"; shift 2 ;;
            --strength) IMG2IMG_STRENGTH="$2"; shift 2 ;;
            --voice) TTS_VOICE="$2"; shift 2 ;;
            -h|--help) usage ;;
            -*) echo -e "${RED}Unknown option: $1${NC}"; exit 1 ;;
            *) break ;;
        esac
    done
    echo "$@"
}

main() {
    if [[ $# -eq 0 ]]; then
        usage
    fi
    
    parse_args "$@"
    local command="${COMMAND:-$1}"
    shift || true
    
    case "$command" in
        models) cmd_models ;;
        chat) cmd_chat "$1" ;;
        complete) cmd_complete "$1" ;;
        embed) cmd_embed "$1" ;;
        image) cmd_image "$1" ;;
        img2img) cmd_img2img "$1" "$2" ;;
        variation) cmd_variation "$1" "$2" ;;
        transcribe) cmd_transcribe "$1" ;;
        translate-audio) cmd_translate_audio "$1" "$2" ;;
        tts) cmd_tts "$1" "$2" ;;
        classify) cmd_classify "$1" ;;
        translate) cmd_translate "$1" "$2" ;;
        summarize) cmd_summarize "$1" ;;
        vision) cmd_vision "$1" "$2" ;;
        *) echo -e "${RED}Unknown command: $command${NC}"; usage ;;
    esac
}

COMMAND="${1:-}"
main "$@"
