import os
import shutil
from flask import Blueprint, request, jsonify
from utils.carbon_engine import calculate_impact
from database.models import db, WasteRecord

calculate_bp = Blueprint('calculate', __name__)

TEMP_FOLDER = os.path.join('data', 'temp_images')
CORRECTIONS_FOLDER = os.path.join('data', 'corrections')

@calculate_bp.route('/calculate', methods=['POST'])
def calculate():
    data = request.json
    
    if not data or 'waste_type' not in data or 'weight' not in data:
        return jsonify({'error': 'Missing waste_type or weight'}), 400

    waste_type = data['waste_type']
    prediction_id = data.get('prediction_id')
    is_correction = data.get('is_correction', False)
    imagenet_label = data.get('imagenet_label')
    
    try:
        weight = float(data['weight'])
        
        # 1. Active Learning Loop Logic
        if prediction_id:
            temp_path = os.path.join(TEMP_FOLDER, prediction_id)
            if os.path.exists(temp_path):
                if is_correction:
                    # Move to corrections folder for retraining
                    dest_dir = os.path.join(CORRECTIONS_FOLDER, waste_type)
                    os.makedirs(dest_dir, exist_ok=True)
                    shutil.move(temp_path, os.path.join(dest_dir, prediction_id))
                    print(f"Feedback Received: Saved correction for {waste_type}")
                else:
                    # Normal case: cleanup temp image
                    os.remove(temp_path)

        # 2. Calculate impact
        impact = calculate_impact(waste_type, weight, imagenet_label=imagenet_label)
        
        conf_dist = data.get('confidence_distribution', {})
        
        # 3. Save to database
        record = WasteRecord(
            category=waste_type,
            weight=weight,
            co2_saved=impact['co2_saved'],
            impact_score=impact['impact_score'],
            is_corrected=is_correction,
            bio_score=conf_dist.get('Biodegradable', 0.0),
            recyc_score=conf_dist.get('Recyclable', 0.0),
            haz_score=conf_dist.get('Hazardous', 0.0)
        )
        
        db.session.add(record)
        db.session.commit()
        
        return jsonify(impact)
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500
