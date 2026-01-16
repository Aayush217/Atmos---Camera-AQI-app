from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from threading import Lock

# Try optional imports
try:
    from huggingface_hub import hf_hub_download
    from llama_cpp import Llama
    HAS_LLM = True
except ImportError:
    HAS_LLM = False
    print("Warning: llama-cpp-python not found. AI advice will be mocked.")

app = Flask(__name__)
CORS(app) 

# Global variables
llm = None
model_lock = Lock()

def initialize_model():
    global llm
    if not HAS_LLM:
        return

    model_name = "unsloth/gemma-3-4b-it-GGUF"
    model_file = "gemma-3-4b-it-Q4_K_M.gguf"

    try:
        if not os.path.exists(model_file):
            print("Downloading model...")
            hf_hub_download(
                repo_id=model_name,
                filename=model_file,
                local_dir=".",
                resume_download=True
            )
        else:
            print("Model already exists")

        # Initialize Llama model
        llm = Llama(
            model_path=model_file,
            n_ctx=4096, 
            n_gpu_layers=-1, 
            verbose=False
        )
        print("LLM initialized successfully!")
    except Exception as e:
        print(f"LLM initialization failed: {str(e)}")

def generate_advice(aqi, age, disease):
    global llm
    
    # Fallback if no LLM
    if not HAS_LLM or llm is None:
        return f"**Protect your health:**\n\nSince the AQI is {aqi}, and you are {age} years old with {disease}, it is recommended to wear a mask and limit outdoor activities. (Note: Real AI generation is disabled due to missing libraries)."

    try:
        prompt = f"""[INST] You are a AQI prevention solution provider. the current AQI is {aqi}. give 5 precaution to take according the age of the person is {age} with the disease which is {disease}. Keep the response concise and formatted in markdown. [/INST]"""

        with model_lock:
            output = llm(
                prompt,
                max_tokens=2000,
                temperature=0.7,
                echo=False
            )
        
        answer = output['choices'][0]['text'].strip()
        return answer
    except Exception as e:
        print(f"Error during generation: {str(e)}")
        return "Could not generate advice"


@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    aqi = data.get('aqi')
    age = data.get('age', 'User') # Default to generic if not provided
    disease = data.get('disease', 'None')
    
    if aqi is None:
        return jsonify({"error": "AQI is required"}), 400

    advice = generate_advice(aqi, age, disease)
    return jsonify({"advice": advice})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "model_loaded": llm is not None})

if __name__ == '__main__':
    initialize_model()
    app.run(host='0.0.0.0', port=5000)
