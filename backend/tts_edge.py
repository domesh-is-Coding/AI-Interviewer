import sys
import asyncio
import edge_tts

if len(sys.argv) < 3:
    print("Error: Missing command-line arguments.")
    print("Usage: python tts_edge.py <text_file> <output_file>")
    sys.exit(1)

# Read text from file
text_file = sys.argv[1]
output = sys.argv[2]

try:
    with open(text_file, "r", encoding="utf-8") as f:
        text = f.read()
except Exception as e:
    print(f"Failed to read text file: {e}")
    sys.exit(1)

async def generate():
    try:
        tts = edge_tts.Communicate(text, voice="en-US-AriaNeural")
        await tts.save(output)
        print(f"TTS successfully saved to {output}")
    except Exception as e:
        print(f"Error generating TTS: {e}")
        sys.exit(1)

asyncio.run(generate())
