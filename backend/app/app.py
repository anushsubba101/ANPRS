import flask
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
import tempfile
import time
import shutil

import config
from model_loader import load_models
from image_processing import process_file
from utils import to_base64

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - [%(module)s:%(lineno)d] - %(message)s')

try:
    os.makedirs(config.UPLOAD_FOLDER_PATH, exist_ok=True)
    logging.info(f"Upload folder ready: {config.UPLOAD_FOLDER_PATH}")
except OSError as e:
    logging.error(f"Could not create upload folder '{config.UPLOAD_FOLDER_PATH}': {e}", exc_info=True)


logging.info("----- Initializing ANPR Application - Loading Models -----")
try:
    plate_detection_model, char_seg_model, char_recog_model, device, ocr_font_path = load_models()
    models_loaded = all([plate_detection_model, char_seg_model, char_recog_model])
    if not models_loaded:
        logging.error("One or more models failed to load. Application might not function correctly.")
except Exception as load_err:
     logging.error(f"A critical error occurred during model loading: {load_err}", exc_info=True)
     plate_detection_model, char_seg_model, char_recog_model, device, ocr_font_path = None, None, None, "cpu", None
     models_loaded = False

logging.info("Model Load")


app = Flask(__name__)
CORS(app) # Enable CORS for all routes

app.config['UPLOAD_FOLDER'] = config.UPLOAD_FOLDER_PATH
app.config['MAX_CONTENT_LENGTH'] = config.MAX_CONTENT_LENGTH
app.secret_key = config.FLASK_SECRET_KEY

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy", 
        "models_loaded": models_loaded,
        "device": str(device) if 'device' in locals() else "unknown"
    })

@app.route('/api/anpr', methods=['POST'])
def anpr_api():
    """
    Production-ready endpoint for ANPR processing.
    Expects: multipart/form-data with key 'file'
    Returns: JSON response
    """
    # 1. Check Model Status
    if not models_loaded:
        return jsonify({
            "success": False,
            "error": {
                "code": "SERVICE_UNAVAILABLE",
                "message": "AI models are not loaded. Please contact support."
            }
        }), 503

    # 2. Validate Request Content
    if 'file' not in request.files:
        return jsonify({
            "success": False,
            "error": {
                "code": "MISSING_FILE",
                "message": "No file part in the request."
            }
        }), 400

    file = request.files['file']

    # 3. Validate Filename
    if file.filename == '':
        return jsonify({
            "success": False,
            "error": {
                "code": "NO_FILENAME",
                "message": "No file selected for upload."
            }
        }), 400

    # 4. Secure and Validate Extension
    from werkzeug.utils import secure_filename
    original_filename = secure_filename(file.filename)
    _, file_extension = os.path.splitext(original_filename)
    file_extension = file_extension.lower()

    if file_extension not in config.ALLOWED_EXTENSIONS:
        allowed_str = ", ".join(config.ALLOWED_EXTENSIONS)
        return jsonify({
            "success": False,
            "error": {
                "code": "UNSUPPORTED_MEDIA_TYPE",
                "message": f"File type '{file_extension}' not supported. Allowed: {allowed_str}"
            }
        }), 415

    # 5. Process File safely
    temp_path = None
    fd = None
    try:
        # Create temp file securely
        fd, temp_path = tempfile.mkstemp(suffix=file_extension, dir=app.config['UPLOAD_FOLDER'], text=False)
        with os.fdopen(fd, 'wb') as tmp:
            file.save(tmp)
        fd = None # Handled by with block, but needed for finally block safety if exception occurs before

        logging.info(f"Processing secure file: {original_filename}")
        
        start_process_time = time.time()
        results = process_file(
            temp_path,
            plate_detection_model,
            char_seg_model,
            char_recog_model,
            device,
            ocr_font_path
        )
        end_process_time = time.time()
        
        duration = end_process_time - start_process_time
        logging.info(f"Processed '{original_filename}' in {duration:.3f}s")

        return jsonify({
            "success": True,
            "data": {
                "results": results,
                "meta": {
                    "filename": original_filename,
                    "processed_at": time.strftime('%Y-%m-%dT%H:%M:%S%z'),
                    "duration_seconds": round(duration, 3)
                }
            }
        }), 200

    except Exception as e:
        logging.error(f"Processing error for '{original_filename}': {e}", exc_info=True)
        return jsonify({
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred during processing."
            }
        }), 500

    finally:
        # Cleanup
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as rm_err:
                logging.warning(f"Failed to cleanup temp file {temp_path}: {rm_err}")

if __name__ == '__main__':
    logging.info("----- Starting ANPR Flask Application API Server -----")
    logging.info(f"Models Loaded: {models_loaded}")
    
    app.run(host='0.0.0.0', port=5001, debug=True)