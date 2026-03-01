from flask import Flask, render_template

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'hackathon-sustainable-smart-city-key'
    
    # SQLite Database Config
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///waste_records.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize DB
    from database.models import db
    db.init_app(app)

    # Register Blueprints
    from routes.predict import predict_bp
    from routes.calculate import calculate_bp
    from routes.dashboard import dashboard_bp

    app.register_blueprint(predict_bp)
    app.register_blueprint(calculate_bp)
    app.register_blueprint(dashboard_bp)

    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/dashboard')
    def dashboard():
        return render_template('dashboard.html')

    # Create DB tables
    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
