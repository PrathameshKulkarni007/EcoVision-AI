import json
from flask import Blueprint, jsonify
from database.models import db, WasteRecord
from utils.carbon_engine import TREE_CO2_ABSORPTION_RATE
from sqlalchemy import func
from datetime import datetime, timedelta

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard-data')
def dashboard_data():
    try:
        # Total metrics
        total_waste = db.session.query(func.sum(WasteRecord.weight)).scalar() or 0.0
        total_co2 = db.session.query(func.sum(WasteRecord.co2_saved)).scalar() or 0.0
        # Eco impact score can be an average or a sum. 
        # Using average for a realistic normalized score across all records.
        avg_impact = db.session.query(func.avg(WasteRecord.impact_score)).scalar() or 0.0
        
        # Reliability Index (Average confidence across all classifications)
        # Using a weighted average based on the primary category score recorded
        avg_confidence = db.session.query(
            func.avg(
                func.max(WasteRecord.bio_score, WasteRecord.recyc_score, WasteRecord.haz_score)
            )
        ).scalar() or 0.0
        
        trees_saved = total_co2 / TREE_CO2_ABSORPTION_RATE
        
        # Category distribution
        categories = db.session.query(
            WasteRecord.category, 
            func.sum(WasteRecord.weight).label('total_weight'),
            func.sum(WasteRecord.co2_saved).label('total_co2')
        ).group_by(WasteRecord.category).all()
        
        # Initialize fixed categories to ensure they always appear in charts
        dist_data = {
            'labels': ['Recyclable', 'Biodegradable', 'Hazardous'],
            'weights': [0.0, 0.0, 0.0],
            'co2': [0.0, 0.0, 0.0]
        }
        
        for cat in categories:
            if cat.category in dist_data['labels']:
                idx = dist_data['labels'].index(cat.category)
                dist_data['weights'][idx] = round(cat.total_weight, 2)
                dist_data['co2'][idx] = round(cat.total_co2, 2)

        # Global AI Confidence Distribution (Latest Record instead of Average)
        latest_record = db.session.query(WasteRecord).order_by(WasteRecord.timestamp.desc()).first()

        confidence_dist = {
            'labels': ['Recyclable', 'Biodegradable', 'Hazardous'],
            'scores': [
                round(float(latest_record.recyc_score), 1) if latest_record else 0.0,
                round(float(latest_record.bio_score), 1) if latest_record else 0.0,
                round(float(latest_record.haz_score), 1) if latest_record else 0.0
            ]
        }

        # Daily CO2 Trend (Last 7 Days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        
        # SQLite date string formatting
        daily_trend = db.session.query(
            func.date(WasteRecord.timestamp).label('date'),
            func.sum(WasteRecord.co2_saved).label('daily_co2')
        ).filter(WasteRecord.timestamp >= seven_days_ago)\
         .group_by(func.date(WasteRecord.timestamp))\
         .order_by(func.date(WasteRecord.timestamp)).all()

        trend_data = {
            'labels': [],
            'co2': []
        }
        
        for day in daily_trend:
            trend_data['labels'].append(day.date)
            trend_data['co2'].append(round(day.daily_co2, 2))

        return jsonify({
            'totals': {
                'waste_processed': round(total_waste, 2),
                'co2_saved': round(total_co2, 2),
                'impact_score': int(avg_impact),
                'trees_saved': round(trees_saved, 2),
                'reliability_index': round(avg_confidence, 1)
            },
            'distribution': dist_data,
            'confidence_distribution': confidence_dist,
            'trend': trend_data
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Server error'}), 500
@dashboard_bp.route('/reset-data', methods=['DELETE'])
def reset_data():
    try:
        WasteRecord.query.delete()
        db.session.commit()
        return jsonify({'message': 'All data has been reset to zero.'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
