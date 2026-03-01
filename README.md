# EcoVision AI: Waste Segregation & Sustainability Hub 🌱

EcoVision AI is a high-performance, full-stack web application designed to revolutionize urban waste management. Using advanced Computer Vision and real-time analytics, it classifies waste, calculates carbon footprint mitigation, and provides a premium visualization dashboard.

---

## ✨ Key Features

- **AI-Powered Classification**: Real-time identification of **Biodegradable**, **Recyclable**, and **Hazardous** waste using a deep learning model.
- **Sustainability Calculator**: Instant projection of CO₂ mitigation and tree-planting equivalents based on waste category and weight.
- **Premium Analytics Dashboard**: A high-end, glassmorphic data hub featuring interactive Chart.js visualizations (Pie, Bar, and Line charts).
- **Active Learning Support**: Built-in feedback loop allowing users to correct AI predictions, improving long-term accuracy.
- **Modern UI/UX**: State-of-the-art dark/light mode interface with fluid animations and responsive layout.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS (Glassmorphism), Vanilla JavaScript, Chart.js
- **Backend**: Python 3.9+, Flask, Flask-SQLAlchemy
- **AI Engine**: TensorFlow, Keras (MobileNetV2)
- **Database**: SQLite (Production-ready structure)
- **Deployment**: Gunicorn (WSGI)

---

## � Getting Started

### 1. Installation
Clone the repository and install dependencies within a virtual environment:

```bash
# Windows
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Local Run
To start the server locally:

```bash
python app.py
```
The application will be available at [http://127.0.0.1:5000](http://127.0.0.1:5000)

---

## 🌍 Deployment

This project is optimized for deployment on platforms like **Render**, **Railway**, or **Heroku**.

- **Procfile**: Included for production WSGI serving with Gunicorn.
- **Requirements**: Fully specified with production-grade dependencies.
- **Environment**: Automatically handles directory creation for uploads and data storage.

### Deploying to Render (Recommended)
1. Connect your GitHub repository to Render.
2. Set **Build Command** to: `pip install -r requirements.txt`
3. Set **Start Command** to: `gunicorn "app:create_app()"`

---

## 📁 Repository Structure

- `/routes`: Flask blueprints for prediction, calculation, and data.
- `/static`: Premium CSS, JavaScript, and Icons.
- `/templates`: Dynamic HTML components.
- `/model`: Pre-trained AI classification model.
- `/database`: SQLAlchemy models and schemas.

---

## 🧪 Demo Flow (Testing Instructions)

To test the end-to-end functionality:

1. **Launch**: Open [http://127.0.0.1:5000](http://127.0.0.1:5000) in your browser.
2. **Classify**: Upload an image (e.g., a plastic bottle or an apple core).
3. **Analyze**: The AI will predict the category (e.g., "Recyclable").
4. **Input Weight**: Enter a sample weight (e.g., `0.5` kg) and click **Calculate**.
5. **Impact**: View the real-time CO₂ mitigation and tree-equivalent stats.
6. **Dashboard**: Visit the **Sustainability Hub** to see your data aggregated into live charts.

---

## 🔮 Future Scalability Path

- **IoT Integration**: Deploy models to Raspberry Pi cameras for real-time waste sorting at the bin.
- **Advanced Computer Vision**: Move beyond three categories to detect specific materials (e.g., HDPE, LDPE, Paper, Aluminum).
- **Gamification**: Introduce "Eco-Points" and user leaderboards to incentivize sustainable habits.
- **Smart City API**: Expose endpoints for integration with municipal municipal waste management systems.

---
*Built for the sustainable smart cities of the future.*
