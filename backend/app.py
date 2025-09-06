# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import whisper
# import tempfile
# import os

# app = Flask(__name__)
# CORS(app)

# model = whisper.load_model("base")

# @app.route("/transcribe", methods=["POST"])
# def transcribe():
#     file = request.files.get("file")
#     if not file:
#         return jsonify({"error": "No file uploaded"}), 400

#     with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
#         file.save(tmp.name)
#         result = model.transcribe(tmp.name)

#     os.remove(tmp.name)
#     return jsonify(result)

# if __name__ == "__main__":
#     app.run(debug=True, port=5000)


from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import tempfile
import os
from mom import generate_mom  # 👈 Import your MoM generator

app = Flask(__name__)
CORS(app)

model = whisper.load_model("base")

@app.route("/transcribe", methods=["POST"])
def transcribe():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        file.save(tmp.name)
        result = model.transcribe(tmp.name)

    os.remove(tmp.name)

    transcript = result.get("text", "")
    mom = generate_mom(transcript)  # 👈 Generate MoM from transcript
    print("Generated MoM:", mom);
    return jsonify({
        "transcript": transcript,
        "mom": mom
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)


