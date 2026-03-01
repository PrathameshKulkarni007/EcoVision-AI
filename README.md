# EcoVision AI: Waste Segregation & Carbon Footprint Analyzer 🌱

A production-ready, full-stack AI-powered web application that uses computer vision to classify waste and calculates real-time carbon footprint reduction potential.

Built for smart city scalability and enterprise ESG reporting, this system provides actionable intelligence on sustainability metrics.

---

## 🚀 Features

- **AI Image Classification**: Identifies waste as Biodegradable, Recyclable, or Hazardous using Transfer Learning with MobileNetV2.
- **Carbon Footprint Calculator**: Computes CO₂ saved, equivalent trees saved, and assigns a normalized ESG impact score based on waste weight and category emission profiles.
- **Sustainability Dashboard**: Real-time interactive charts (Chart.js) tracking organizational/city-wide sustainability metrics.
- **Modern UI**: Clean, responsive, glassmorphic UI built with pure CSS and Vanilla JS.

## 🏗️ Architecture Stack

- **Frontend**: HTML5, Modern Vanilla CSS (Glassmorphism), Vanilla JavaScript, Chart.js
- **Backend**: Python 3, Flask, Flask-SQLAlchemy
- **Database**: SQLite (scalable structure for rapid prototyping)
- **AI/ML Engine**: TensorFlow, Keras (MobileNetV2 architecture)

## 📋 Pre-requisites
- Python 3.9+ 
- Virtual Environment recommended (`venv`)

## 🛠️ Setup & Local Run Instructions

1. **Clone & Navigate**
   ```bash
   cd waste-analyzer
   ```

2. **Create and Activate Virtual Environment**
   ```bash
   python -m venv venv
   
   # Windows
   .\venv\Scripts\activate
   # Mac/Linux
   source venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize AI Architecture** (Optional but recommended)
   Since the pre-trained weights (`.h5` file) can be large, you can generate the model architecture locally:
   ```bash
   python train_model.py
   ```
   *Note: If `waste_model.h5` is not found, the app gracefully falls back to a deterministic Mock Prediction Engine to ensure hackathon demo continuity.*

5. **Run the Application**
   ```bash
   python app.py
   ```
   The Flask app will start on standard port 5000.

6. **View the App**
   Open your browser and navigate to: [http://localhost:5000](http://localhost:5000)

## 🧪 Demo Flow (Testing Instructions)

To test the end-to-end functionality required for a hackathon demo:

1. **Navigate** to `http://localhost:5000`
2. **Upload** an image (e.g., a plastic water bottle).
3. The AI Engine will predict `"Recyclable"` with confidence (simulated if no heavy weights are loaded for demo speed).
4. Enter `0.4` kg in the Weight Input field.
5. Click **Calculate Savings**.
6. The exact output will demonstrate:
   - **CO₂ Saved**: 1.6 kg
   - **Trees Equivalent**: 0.07
   - **Impact Score**: 82
7. Navigate to the **Sustainability Dashboard** in the navbar to see the data aggregated in real-time charts (Pie, Bar, Line).

## 🔮 Future Scalability Path

This project is architected with scalability in mind.

1. **IoT Smart Bins**: Can be retrofitted onto Raspberry Pi cameras over edge-computing to classify waste directly at the bin.
2. **Smart City API Exposure**: The Flask routes are already cleanly separated into Blueprints (`/predict`, `/calculate`, `/dashboard-data`), making it trivial to connect to municipal analytics endpoints securely via JWT.
3. **ESG Corporate Reporting**: Extended database metrics can be exported seamlessly into enterprise sustainability software packages via CSV/JSON dumps.

---
*Built to power the sustainable cities of tomorrow.*
