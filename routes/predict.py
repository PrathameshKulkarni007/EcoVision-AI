import os
import uuid
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from utils.image_processing import classify_waste

predict_bp = Blueprint('predict', __name__)

TEMP_FOLDER = os.path.join('data', 'temp_images')
os.makedirs(TEMP_FOLDER, exist_ok=True)

@predict_bp.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Ensure unique filename to prevent collisions in temp storage
    prediction_id = str(uuid.uuid4())
    extension = os.path.splitext(file.filename)[1]
    filename = f"{prediction_id}{extension}"
    filepath = os.path.join(TEMP_FOLDER, filename)
    
    file.save(filepath)

    try:
        # Pass image to our AI engine
        result = classify_waste(filepath)
        
        # Add metadata for Active Learning & UI feedback
        result['prediction_id'] = filename
        result['is_uncertain'] = bool(result['confidence'] < 60.0)
        
        # We don't remove filepath here anymore; we wait for /calculate or a cleanup task
        return jsonify(result)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({'error': str(e)}), 500
