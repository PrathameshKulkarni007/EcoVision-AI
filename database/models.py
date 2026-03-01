from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class WasteRecord(db.Model):
    __tablename__ = 'waste_records'

    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(50), nullable=False, index=True)
    weight = db.Column(db.Float, nullable=False)
    co2_saved = db.Column(db.Float, nullable=False)
    impact_score = db.Column(db.Integer, nullable=False)
    is_corrected = db.Column(db.Boolean, default=False)
    
    # Confidence breakdown fields
    bio_score = db.Column(db.Float, default=0.0)
    recyc_score = db.Column(db.Float, default=0.0)
    haz_score = db.Column(db.Float, default=0.0)
    
    
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category,
            'weight': self.weight,
            'co2_saved': self.co2_saved,
            'impact_score': self.impact_score,
            'timestamp': self.timestamp.isoformat()
        }
