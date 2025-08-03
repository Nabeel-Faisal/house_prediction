# 🏠 Intelligent Multi-Country House Price Prediction App

An AI-powered web application that provides accurate house price predictions across 10 different countries using machine learning models. The app features dynamic form generation based on country-specific real estate metrics and provides predictions in both local and global currencies.

## 🌟 Key Features

- **Multi-Country Support**: Predictions for 10 countries including Pakistan, USA, UK, Canada, Australia, India, UAE, Germany, France, and Malaysia
- **Dynamic Form Generation**: Country-specific property attributes and metrics
- **AI/ML Integration**: Machine learning models trained on regional real estate data
- **Real-time Currency Conversion**: Predictions in local currency with conversions to major global currencies
- **Responsive Design**: Modern, mobile-friendly UI with beautiful animations
- **Prediction History**: Track and view previous predictions
- **Localized Experience**: Country-specific terminology and measurement units

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd house_prediction
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Node.js dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Running the Application

1. **Start the Flask backend**
   ```bash
   cd backend
   python app.py
   ```
   The backend will run on `http://localhost:5000`

2. **Start the React frontend** (in a new terminal)
   ```bash
   cd frontend
   npm start
   ```
   The frontend will run on `http://localhost:3000`

3. **Open your browser** and navigate to `http://localhost:3000`

## 🏗️ Architecture

### Backend (Python/Flask)
- **Flask API**: RESTful endpoints for predictions and country data
- **SQLite Database**: Stores country configurations and prediction history
- **Machine Learning**: Scikit-learn and XGBoost models for each country
- **Currency API**: Real-time exchange rate integration

### Frontend (React/TypeScript)
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication

## 📊 Supported Countries & Features

### Pakistan 🇵🇰
- Plot Size (Marla)
- Covered Area (sq ft)
- Construction Type (Basic/Standard/Luxury)
- Location Tier (Low/Medium/High)
- Utilities Availability

### USA 🇺🇸
- Square Footage
- ZIP Code
- Property Type (House/Condo/Townhouse)
- Year Built
- Lot Size

### UK 🇬🇧
- Square Meters
- Postcode
- Property Type
- Year Built
- Garden Availability

### Canada 🇨🇦
- Square Footage
- Postal Code
- Property Type
- Year Built
- Lot Size

### Australia 🇦🇺
- Square Meters
- Postcode
- Property Type
- Year Built
- Land Size

### India 🇮🇳
- Square Feet
- City
- Property Type
- Year Built
- Amenities Level

### UAE 🇦🇪
- Square Feet
- Emirate
- Property Type
- Year Built
- Amenities

### Germany 🇩🇪
- Square Meters
- Postal Code
- Property Type
- Year Built
- Energy Rating

### France 🇫🇷
- Square Meters
- Postal Code
- Property Type
- Year Built
- Energy Rating

### Malaysia 🇲🇾
- Square Feet
- State
- Property Type
- Year Built
- Amenities

## 🔧 API Endpoints

### GET `/api/countries`
Returns all supported countries with their configurations.

### POST `/api/predict`
Submit property details for price prediction.
```json
{
  "country": "Pakistan",
  "state": "Punjab",
  "features": {
    "plot_size_marla": 10,
    "covered_area_sqft": 2000,
    "bedrooms": 3,
    "bathrooms": 2,
    "construction_type": 1,
    "location_tier": 2,
    "utilities": 1
  }
}
```

### GET `/api/predictions`
Returns recent prediction history.

### GET `/api/health`
Health check endpoint.

## 🎨 UI Components

- **CountrySelector**: Dropdown with country flags and state selection
- **DynamicForm**: Automatically generates form fields based on country
- **PredictionResult**: Displays results with currency conversions
- **PredictionsHistory**: Shows recent predictions with details
- **LoadingSpinner**: Animated loading indicator

## 🔮 Machine Learning Models

The application uses Random Forest models trained on synthetic data for each country. The models consider:

- **Location factors**: State/province, city, postal codes
- **Property characteristics**: Size, bedrooms, bathrooms, age
- **Quality indicators**: Construction type, amenities, energy ratings
- **Market conditions**: Regional price trends and economic factors

## 💱 Currency Conversion

The app integrates with real-time exchange rate APIs to provide:
- Predictions in local currency
- Conversions to major global currencies (USD, EUR, GBP, CAD, AUD, INR, PKR, AED, MYR)
- Proper currency formatting for each region

## 🛠️ Development

### Project Structure
```
house_prediction/
├── backend/
│   ├── app.py              # Flask application
│   └── models/             # ML model files
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.tsx         # Main app component
│   │   └── index.tsx       # Entry point
│   ├── public/             # Static files
│   └── package.json        # Node dependencies
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

### Adding New Countries

1. Add country data to the `countries_data` list in `backend/app.py`
2. Create country-specific form fields in `frontend/src/components/DynamicForm.tsx`
3. Add country flag to `getCountryFlag` function in relevant components
4. Update ML model training in `HousePricePredictor` class

## 🚀 Deployment

### Backend Deployment
```bash
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend Deployment
```bash
cd frontend
npm run build
# Serve the build folder with your preferred web server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Real estate data patterns and market insights
- Currency exchange rate APIs
- Machine learning community for best practices
- React and Flask communities for excellent documentation

## 📞 Support

For support, email support@housepriceai.com or create an issue in the repository.

---

**Built with ❤️ for the global real estate community** 