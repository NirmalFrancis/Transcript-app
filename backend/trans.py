import whisper
import json


model = whisper.load_model("base")


audio_path = r"D:\cyhi\audio2.opus"


result = model.transcribe(audio_path)


json_path=r"D:\cyhi\transcripts.json"
with open(json_path,"w",encoding="utf-8") as f:
    json.dump(result,f,indent=4,ensure_ascii=False)

print("Transcription saved as JSON at : {json_path}")

