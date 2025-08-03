from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import requests
import json
import os
from datetime import datetime
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database initialization
def init_db():
    conn = sqlite3.connect('house_prediction.db')
    cursor = conn.cursor()
    
    # Create countries table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS countries (
            id INTEGER PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            currency_code TEXT NOT NULL,
            currency_symbol TEXT NOT NULL,
            states TEXT,
            form_fields TEXT
        )
    ''')
    
    # Create predictions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            country TEXT NOT NULL,
            state TEXT,
            inputs TEXT NOT NULL,
            predicted_price REAL NOT NULL,
            currency TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Insert default countries
    countries_data = [
        ('Pakistan', 'PKR', '₨', '["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan"]', 
         '["plot_size_marla", "covered_area_sqft", "bedrooms", "bathrooms", "construction_type", "location_tier", "utilities"]'),
        ('USA', 'USD', '$', '["California", "Texas", "New York", "Florida", "Illinois"]',
         '["square_footage", "bedrooms", "bathrooms", "zip_code", "property_type", "year_built", "lot_size"]'),
        ('UK', 'GBP', '£', '["England", "Scotland", "Wales", "Northern Ireland"]',
         '["square_meters", "bedrooms", "bathrooms", "postcode", "property_type", "year_built", "garden"]'),
        ('Canada', 'CAD', 'C$', '["Ontario", "Quebec", "British Columbia", "Alberta"]',
         '["square_footage", "bedrooms", "bathrooms", "postal_code", "property_type", "year_built", "lot_size"]'),
        ('Australia', 'AUD', 'A$', '["New South Wales", "Victoria", "Queensland", "Western Australia"]',
         '["square_meters", "bedrooms", "bathrooms", "postcode", "property_type", "year_built", "land_size"]'),
        ('India', 'INR', '₹', '["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu"]',
         '["square_feet", "bedrooms", "bathrooms", "city", "property_type", "year_built", "amenities"]'),
        ('UAE', 'AED', 'د.إ', '["Dubai", "Abu Dhabi", "Sharjah", "Ajman"]',
         '["square_feet", "bedrooms", "bathrooms", "emirate", "property_type", "year_built", "amenities"]'),
        ('Germany', 'EUR', '€', '["Bavaria", "North Rhine-Westphalia", "Baden-Württemberg", "Berlin"]',
         '["square_meters", "bedrooms", "bathrooms", "postal_code", "property_type", "year_built", "energy_rating"]'),
        ('France', 'EUR', '€', '["Île-de-France", "Auvergne-Rhône-Alpes", "Nouvelle-Aquitaine", "Occitanie"]',
         '["square_meters", "bedrooms", "bathrooms", "postal_code", "property_type", "year_built", "energy_rating"]'),
        ('Malaysia', 'MYR', 'RM', '["Selangor", "Kuala Lumpur", "Johor", "Penang"]',
         '["square_feet", "bedrooms", "bathrooms", "state", "property_type", "year_built", "amenities"]')
    ]
    
    for country_data in countries_data:
        cursor.execute('''
            INSERT OR IGNORE INTO countries (name, currency_code, currency_symbol, states, form_fields)
            VALUES (?, ?, ?, ?, ?)
        ''', country_data)
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# Currency conversion API
def get_exchange_rates(base_currency='USD'):
    try:
        # Using a free currency API (you can replace with your preferred API)
        url = f"https://api.exchangerate-api.com/v4/latest/{base_currency}"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return response.json()['rates']
        else:
            # Fallback rates (approximate)
            return {
                'USD': 1.0, 'EUR': 0.85, 'GBP': 0.73, 'CAD': 1.25, 'AUD': 1.35,
                'INR': 75.0, 'PKR': 155.0, 'AED': 3.67, 'MYR': 4.15
            }
    except Exception as e:
        logger.error(f"Error fetching exchange rates: {e}")
        # Fallback rates
        return {
            'USD': 1.0, 'EUR': 0.85, 'GBP': 0.73, 'CAD': 1.25, 'AUD': 1.35,
            'INR': 75.0, 'PKR': 155.0, 'AED': 3.67, 'MYR': 4.15
        }

# Generate price breakdown for better user understanding
def generate_price_breakdown(country, features, state=None):
    """Generate a breakdown of how different factors contribute to the price"""
    breakdown = {
        'base_factors': {},
        'location_factor': 1.0,
        'explanation': []
    }
    
    # Base price factors by country
    if country == 'Pakistan':
        base_price = 5000000  # 50 lakh PKR base
        breakdown['base_price'] = base_price
        
        # Calculate individual factors
        plot_size_factor = 1 + features.get('plot_size_marla', 10) * 0.1
        covered_area_factor = 1 + features.get('covered_area_sqft', 2000) * 0.0001
        bedrooms_factor = 1 + features.get('bedrooms', 3) * 0.2
        bathrooms_factor = 1 + features.get('bathrooms', 2) * 0.15
        construction_factor = 1 + features.get('construction_type', 1) * 0.3
        location_tier_factor = 1 + features.get('location_tier', 1) * 0.4
        utilities_factor = 1 + features.get('utilities', 1) * 0.1
        
        breakdown['base_factors'] = {
            'plot_size': {'value': features.get('plot_size_marla', 10), 'factor': plot_size_factor, 'impact': 'high'},
            'covered_area': {'value': features.get('covered_area_sqft', 2000), 'factor': covered_area_factor, 'impact': 'medium'},
            'bedrooms': {'value': features.get('bedrooms', 3), 'factor': bedrooms_factor, 'impact': 'medium'},
            'bathrooms': {'value': features.get('bathrooms', 2), 'factor': bathrooms_factor, 'impact': 'medium'},
            'construction_quality': {'value': features.get('construction_type', 1), 'factor': construction_factor, 'impact': 'high'},
            'neighborhood_quality': {'value': features.get('location_tier', 1), 'factor': location_tier_factor, 'impact': 'very high'},
            'gas_available': {'value': features.get('utilities', 1), 'factor': utilities_factor, 'impact': 'low'}
        }
        
        # Add explanations
        breakdown['explanation'].append("Plot size has a significant impact on property value in Pakistan.")
        breakdown['explanation'].append("Neighborhood quality is one of the most important factors affecting price.")
        breakdown['explanation'].append("Construction quality significantly affects the property value.")
        
    elif country == 'USA':
        base_price = 300000  # $300k base
        breakdown['base_price'] = base_price
        
        # Calculate individual factors
        square_footage_factor = 1 + features.get('square_footage', 2000) * 0.0001
        bedrooms_factor = 1 + features.get('bedrooms', 3) * 0.15
        bathrooms_factor = 1 + features.get('bathrooms', 2) * 0.1
        year_built_factor = 1 + (features.get('year_built', 2000) - 1950) * 0.001
        lot_size_factor = 1 + features.get('lot_size', 5000) * 0.00001
        property_type_factor = 1 + features.get('property_type', 0) * 0.1
        
        breakdown['base_factors'] = {
            'square_footage': {'value': features.get('square_footage', 2000), 'factor': square_footage_factor, 'impact': 'high'},
            'bedrooms': {'value': features.get('bedrooms', 3), 'factor': bedrooms_factor, 'impact': 'medium'},
            'bathrooms': {'value': features.get('bathrooms', 2), 'factor': bathrooms_factor, 'impact': 'medium'},
            'year_built': {'value': features.get('year_built', 2000), 'factor': year_built_factor, 'impact': 'medium'},
            'lot_size': {'value': features.get('lot_size', 5000), 'factor': lot_size_factor, 'impact': 'low'},
            'property_type': {'value': features.get('property_type', 0), 'factor': property_type_factor, 'impact': 'low'}
        }
        
        # Add explanations
        breakdown['explanation'].append("Square footage is a primary driver of property value in the USA.")
        breakdown['explanation'].append("The number of bedrooms and bathrooms significantly affects the price.")
        breakdown['explanation'].append("Newer properties generally command higher prices.")
        
    else:  # Generic for other countries
        # Get base price by country
        base_prices = {
            'UK': 250000, 'Canada': 400000, 'Australia': 500000, 'India': 5000000,
            'UAE': 800000, 'Germany': 350000, 'France': 300000, 'Malaysia': 400000
        }
        base_price = base_prices.get(country, 300000)
        breakdown['base_price'] = base_price
        
        # Determine area field based on country
        area_field = 'square_meters'
        if country in ['India', 'UAE', 'Malaysia']:
            area_field = 'square_feet'
        
        # Calculate individual factors
        area_factor = 1 + features.get(area_field, 1000) * 0.0001
        bedrooms_factor = 1 + features.get('bedrooms', 3) * 0.15
        bathrooms_factor = 1 + features.get('bathrooms', 2) * 0.1
        year_built_factor = 1 + (features.get('year_built', 2000) - 1950) * 0.001
        property_type_factor = 1 + features.get('property_type', 0) * 0.1
        
        breakdown['base_factors'] = {
            'area': {'value': features.get(area_field, 1000), 'factor': area_factor, 'impact': 'high'},
            'bedrooms': {'value': features.get('bedrooms', 3), 'factor': bedrooms_factor, 'impact': 'medium'},
            'bathrooms': {'value': features.get('bathrooms', 2), 'factor': bathrooms_factor, 'impact': 'medium'},
            'year_built': {'value': features.get('year_built', 2000), 'factor': year_built_factor, 'impact': 'medium'},
            'property_type': {'value': features.get('property_type', 0), 'factor': property_type_factor, 'impact': 'low'}
        }
        
        # Add explanations
        breakdown['explanation'].append(f"Property size is a key factor in {country}.")
        breakdown['explanation'].append("The number of bedrooms and bathrooms affects the property value.")
        breakdown['explanation'].append("Newer properties generally command higher prices.")
    
    # Add location factor if state is provided
    if state:
        # Get location factors
        location_factors = {
            'Pakistan': {'Punjab': 1.1, 'Sindh': 1.2, 'Khyber Pakhtunkhwa': 0.9, 'Balochistan': 0.8},
            'USA': {'California': 1.5, 'New York': 1.4, 'Texas': 0.9, 'Florida': 1.1, 'Illinois': 1.0},
            'UK': {'England': 1.2, 'Scotland': 0.9, 'Wales': 0.8, 'Northern Ireland': 0.7},
            'Canada': {'Ontario': 1.2, 'British Columbia': 1.3, 'Quebec': 0.9, 'Alberta': 1.0},
            'Australia': {'New South Wales': 1.3, 'Victoria': 1.2, 'Queensland': 1.0, 'Western Australia': 1.1},
            'India': {'Maharashtra': 1.3, 'Delhi': 1.4, 'Karnataka': 1.1, 'Tamil Nadu': 1.0},
            'UAE': {'Dubai': 1.3, 'Abu Dhabi': 1.2, 'Sharjah': 0.9, 'Ajman': 0.8},
            'Germany': {'Bavaria': 1.2, 'Berlin': 1.3, 'North Rhine-Westphalia': 1.1, 'Baden-Württemberg': 1.2},
            'France': {'Île-de-France': 1.4, 'Auvergne-Rhône-Alpes': 1.1, 'Nouvelle-Aquitaine': 0.9, 'Occitanie': 0.9},
            'Malaysia': {'Selangor': 1.2, 'Kuala Lumpur': 1.3, 'Johor': 0.9, 'Penang': 1.1}
        }
        
        if country in location_factors and state in location_factors[country]:
            breakdown['location_factor'] = location_factors[country][state]
            
            # Add location explanation
            if breakdown['location_factor'] > 1.2:
                breakdown['explanation'].append(f"{state} is a premium location with significantly higher property values.")
            elif breakdown['location_factor'] > 1.0:
                breakdown['explanation'].append(f"{state} has above-average property values.")
            elif breakdown['location_factor'] < 0.9:
                breakdown['explanation'].append(f"{state} has lower than average property values.")
            else:
                breakdown['explanation'].append(f"{state} has average property values for {country}.")
    
    return breakdown

# ML Model for predictions
class HousePricePredictor:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.feature_importance = {}
        self.location_factors = self._initialize_location_factors()
        self.load_or_create_models()
    
    def load_or_create_models(self):
        for country in ['Pakistan', 'USA', 'UK', 'Canada', 'Australia', 'India', 'UAE', 'Germany', 'France', 'Malaysia']:
            model_path = f'models/{country}_model.pkl'
            scaler_path = f'models/{country}_scaler.pkl'
            
            if os.path.exists(model_path) and os.path.exists(scaler_path):
                self.models[country] = joblib.load(model_path)
                self.scalers[country] = joblib.load(scaler_path)
                # Calculate feature importance for loaded model
                self._calculate_feature_importance(country)
            else:
                # Create a simple model for demonstration
                self.models[country] = RandomForestRegressor(n_estimators=100, random_state=42)
                self.scalers[country] = StandardScaler()
                
                # Generate synthetic training data
                self._generate_training_data(country)
                # Calculate feature importance for new model
                self._calculate_feature_importance(country)
    
    def _clean_features(self, country, features):
        """Clean and validate input features"""
        cleaned = {}
        
        # Common validations
        if 'bedrooms' in features:
            cleaned['bedrooms'] = max(1, min(10, int(features.get('bedrooms', 3))))
        
        if 'bathrooms' in features:
            cleaned['bathrooms'] = max(1, min(8, float(features.get('bathrooms', 2))))
        
        if 'year_built' in features:
            cleaned['year_built'] = max(1900, min(2023, int(features.get('year_built', 2000))))
        
        # Country-specific validations
        if country == 'Pakistan':
            cleaned['plot_size_marla'] = max(1, min(100, float(features.get('plot_size_marla', 10))))
            cleaned['covered_area_sqft'] = max(500, min(10000, float(features.get('covered_area_sqft', 2000))))
            cleaned['construction_type'] = max(0, min(2, int(features.get('construction_type', 1))))
            cleaned['location_tier'] = max(0, min(2, int(features.get('location_tier', 1))))
            cleaned['utilities'] = max(0, min(1, int(features.get('utilities', 1))))
        
        elif country == 'USA':
            cleaned['square_footage'] = max(500, min(10000, float(features.get('square_footage', 2000))))
            cleaned['lot_size'] = max(1000, min(50000, float(features.get('lot_size', 5000))))
            cleaned['property_type'] = max(0, min(2, int(features.get('property_type', 0))))
        
        else:
            # Generic features for other countries
            if country in ['UK', 'Germany', 'France']:
                cleaned['square_meters'] = max(30, min(500, float(features.get('square_meters', 100))))
            else:  # India, UAE, Malaysia
                cleaned['square_feet'] = max(500, min(10000, float(features.get('square_feet', 2000))))
            
            cleaned['property_type'] = max(0, min(2, int(features.get('property_type', 0))))
        
        return cleaned
    
    def _initialize_location_factors(self):
        """Initialize location adjustment factors"""
        return {
            'Pakistan': {'Punjab': 1.1, 'Sindh': 1.2, 'Khyber Pakhtunkhwa': 0.9, 'Balochistan': 0.8},
            'USA': {'California': 1.5, 'New York': 1.4, 'Texas': 0.9, 'Florida': 1.1, 'Illinois': 1.0},
            'UK': {'England': 1.2, 'Scotland': 0.9, 'Wales': 0.8, 'Northern Ireland': 0.7},
            'Canada': {'Ontario': 1.2, 'British Columbia': 1.3, 'Quebec': 0.9, 'Alberta': 1.0},
            'Australia': {'New South Wales': 1.3, 'Victoria': 1.2, 'Queensland': 1.0, 'Western Australia': 1.1},
            'India': {'Maharashtra': 1.3, 'Delhi': 1.4, 'Karnataka': 1.1, 'Tamil Nadu': 1.0},
            'UAE': {'Dubai': 1.3, 'Abu Dhabi': 1.2, 'Sharjah': 0.9, 'Ajman': 0.8},
            'Germany': {'Bavaria': 1.2, 'Berlin': 1.3, 'North Rhine-Westphalia': 1.1, 'Baden-Württemberg': 1.2},
            'France': {'Île-de-France': 1.4, 'Auvergne-Rhône-Alpes': 1.1, 'Nouvelle-Aquitaine': 0.9, 'Occitanie': 0.9},
            'Malaysia': {'Selangor': 1.2, 'Kuala Lumpur': 1.3, 'Johor': 0.9, 'Penang': 1.1}
        }
        
    def _adjust_for_location(self, country, state, prediction):
        """Adjust prediction based on location/state"""
        # Apply location factor if available
        if country in self.location_factors and state in self.location_factors[country]:
            return prediction * self.location_factors[country][state]
        
        return prediction
    
    def _generate_training_data(self, country):
        np.random.seed(42)
        n_samples = 1000
        
        if country == 'Pakistan':
            # Pakistan-specific features
            plot_size = np.random.uniform(5, 20, n_samples)  # Marla
            covered_area = np.random.uniform(1000, 5000, n_samples)  # sqft
            bedrooms = np.random.randint(1, 6, n_samples)
            bathrooms = np.random.randint(1, 4, n_samples)
            construction_type = np.random.randint(0, 3, n_samples)  # 0: Basic, 1: Standard, 2: Luxury
            location_tier = np.random.randint(0, 3, n_samples)  # 0: Low, 1: Medium, 2: High
            utilities = np.random.randint(0, 2, n_samples)  # 0: No, 1: Yes
            
            # Price calculation (PKR)
            base_price = 5000000  # 50 lakh PKR base
            price = (base_price * (1 + plot_size * 0.1) * (1 + covered_area * 0.0001) * 
                    (1 + bedrooms * 0.2) * (1 + bathrooms * 0.15) * 
                    (1 + construction_type * 0.3) * (1 + location_tier * 0.4) * 
                    (1 + utilities * 0.1) + np.random.normal(0, 500000))
            
            X = np.column_stack([plot_size, covered_area, bedrooms, bathrooms, 
                               construction_type, location_tier, utilities])
            
        elif country == 'USA':
            # USA-specific features
            square_footage = np.random.uniform(800, 4000, n_samples)
            bedrooms = np.random.randint(1, 6, n_samples)
            bathrooms = np.random.randint(1, 4, n_samples)
            year_built = np.random.randint(1950, 2023, n_samples)
            lot_size = np.random.uniform(2000, 10000, n_samples)
            property_type = np.random.randint(0, 3, n_samples)  # 0: House, 1: Condo, 2: Townhouse
            
            # Price calculation (USD)
            base_price = 300000  # $300k base
            price = (base_price * (1 + square_footage * 0.0001) * (1 + bedrooms * 0.15) * 
                    (1 + bathrooms * 0.1) * (1 + (year_built - 1950) * 0.001) * 
                    (1 + lot_size * 0.00001) * (1 + property_type * 0.1) + np.random.normal(0, 50000))
            
            X = np.column_stack([square_footage, bedrooms, bathrooms, year_built, lot_size, property_type])
        
        else:
            # Generic features for other countries
            area = np.random.uniform(500, 3000, n_samples)
            bedrooms = np.random.randint(1, 6, n_samples)
            bathrooms = np.random.randint(1, 4, n_samples)
            year_built = np.random.randint(1950, 2023, n_samples)
            property_type = np.random.randint(0, 3, n_samples)
            
            # Price calculation (varies by country)
            base_prices = {
                'UK': 250000, 'Canada': 400000, 'Australia': 500000, 'India': 5000000,
                'UAE': 800000, 'Germany': 350000, 'France': 300000, 'Malaysia': 400000
            }
            base_price = base_prices.get(country, 300000)
            
            price = (base_price * (1 + area * 0.0001) * (1 + bedrooms * 0.15) * 
                    (1 + bathrooms * 0.1) * (1 + (year_built - 1950) * 0.001) * 
                    (1 + property_type * 0.1) + np.random.normal(0, base_price * 0.1))
            
            X = np.column_stack([area, bedrooms, bathrooms, year_built, property_type])
        
        # Train the model
        X_scaled = self.scalers[country].fit_transform(X)
        self.models[country].fit(X_scaled, price)
        
        # Save models
        os.makedirs('models', exist_ok=True)
        joblib.dump(self.models[country], f'models/{country}_model.pkl')
        joblib.dump(self.scalers[country], f'models/{country}_scaler.pkl')
    
    def _calculate_feature_importance(self, country):
        """Calculate and store feature importance for a country's model"""
        if country in self.models and hasattr(self.models[country], 'feature_importances_'):
            self.feature_importance[country] = self.models[country].feature_importances_
            logger.info(f"Feature importance calculated for {country}: {self.feature_importance[country]}")
        else:
            # Default equal importance if not available
            if country == 'Pakistan':
                self.feature_importance[country] = np.ones(7) / 7
            elif country == 'USA':
                self.feature_importance[country] = np.ones(6) / 6
            else:
                self.feature_importance[country] = np.ones(5) / 5
    
    def predict(self, country, features):
        if country not in self.models:
            raise ValueError(f"No model available for {country}")
        
        # Validate and clean input features
        cleaned_features = self._clean_features(country, features)
        
        # Extract and organize features based on country
        if country == 'Pakistan':
            # Pakistan has 7 features
            feature_values = [
                cleaned_features.get('plot_size_marla', 0),
                cleaned_features.get('covered_area_sqft', 0),
                cleaned_features.get('bedrooms', 0),
                cleaned_features.get('bathrooms', 0),
                cleaned_features.get('construction_type', 0),
                cleaned_features.get('location_tier', 0),
                cleaned_features.get('utilities', 0)
            ]
        elif country == 'USA':
            # USA has 6 features
            feature_values = [
                cleaned_features.get('square_footage', 0),
                cleaned_features.get('bedrooms', 0),
                cleaned_features.get('bathrooms', 0),
                cleaned_features.get('year_built', 2000),
                cleaned_features.get('lot_size', 0),
                cleaned_features.get('property_type', 0)
            ]
        else:
            # All other countries have 5 features: area, bedrooms, bathrooms, year_built, property_type
            # Map the appropriate area field based on country
            area_field = 'square_meters'
            if country in ['India', 'UAE', 'Malaysia']:
                area_field = 'square_feet'
            
            feature_values = [
                cleaned_features.get(area_field, 0),
                cleaned_features.get('bedrooms', 0),
                cleaned_features.get('bathrooms', 0),
                cleaned_features.get('year_built', 2000),
                cleaned_features.get('property_type', 0)
            ]
        
        # Convert features to array
        feature_array = np.array(feature_values).reshape(1, -1)
        feature_array_scaled = self.scalers[country].transform(feature_array)
        
        # Apply feature importance weighting if available
        prediction = self.models[country].predict(feature_array_scaled)[0]
        
        # Apply location-based adjustment if state/region is provided
        if 'state' in features and features['state']:
            prediction = self._adjust_for_location(country, features['state'], prediction)
        
        return max(0, prediction)  # Ensure non-negative price

# Initialize predictor
predictor = HousePricePredictor()

@app.route('/api/countries', methods=['GET'])
def get_countries():
    """Get all available countries and their configurations"""
    conn = sqlite3.connect('house_prediction.db')
    cursor = conn.cursor()
    cursor.execute('SELECT name, currency_code, currency_symbol, states, form_fields FROM countries')
    countries = cursor.fetchall()
    conn.close()
    
    return jsonify([{
        'name': country[0],
        'currency_code': country[1],
        'currency_symbol': country[2],
        'states': json.loads(country[3]),
        'form_fields': json.loads(country[4])
    } for country in countries])

@app.route('/api/predict', methods=['POST'])
def predict_price():
    """Predict house price based on input features"""
    try:
        data = request.json
        country = data.get('country')
        state = data.get('state')
        features = data.get('features', {})
        
        if not country:
            return jsonify({'error': 'Country is required'}), 400
        
        # Clean features for better accuracy
        cleaned_features = predictor._clean_features(country, features)
        
        # Get prediction
        predicted_price = predictor.predict(country, features)
        
        # Get currency info
        conn = sqlite3.connect('house_prediction.db')
        cursor = conn.cursor()
        cursor.execute('SELECT currency_code FROM countries WHERE name = ?', (country,))
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            return jsonify({'error': 'Country not found'}), 404
        
        currency_code = result[0]
        
        # Get exchange rates
        exchange_rates = get_exchange_rates(currency_code)
        
        # Convert to multiple currencies
        conversions = {}
        for target_currency, rate in exchange_rates.items():
            if target_currency != currency_code:
                conversions[target_currency] = predicted_price * rate
        
        # Generate price breakdown
        price_breakdown = generate_price_breakdown(country, cleaned_features, state)
        
        # Store prediction
        conn = sqlite3.connect('house_prediction.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO predictions (country, state, inputs, predicted_price, currency)
            VALUES (?, ?, ?, ?, ?)
        ''', (country, state, json.dumps(features), predicted_price, currency_code))
        conn.commit()
        conn.close()
        
        return jsonify({
            'predicted_price': round(predicted_price, 2),
            'currency': currency_code,
            'conversions': {k: round(v, 2) for k, v in conversions.items()},
            'price_breakdown': price_breakdown,
            'cleaned_features': cleaned_features,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/predictions', methods=['GET'])
def get_predictions():
    """Get recent predictions"""
    conn = sqlite3.connect('house_prediction.db')
    cursor = conn.cursor()
    cursor.execute('''
        SELECT country, state, inputs, predicted_price, currency, timestamp
        FROM predictions ORDER BY timestamp DESC LIMIT 10
    ''')
    predictions = cursor.fetchall()
    conn.close()
    
    return jsonify([{
        'country': pred[0],
        'state': pred[1],
        'inputs': json.loads(pred[2]),
        'predicted_price': pred[3],
        'currency': pred[4],
        'timestamp': pred[5]
    } for pred in predictions])

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)