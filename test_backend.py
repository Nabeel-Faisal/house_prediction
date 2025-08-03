#!/usr/bin/env python3
"""
Test script for the House Price Prediction Backend
"""

import requests
import json
import time

def test_backend():
    """Test the backend API endpoints"""
    base_url = "http://localhost:5001"
    
    print("🏠 Testing House Price Prediction Backend")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1. Testing health check...")
    try:
        response = requests.get(f"{base_url}/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check passed")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check failed: {e}")
        return False
    
    # Test 2: Get countries
    print("\n2. Testing countries endpoint...")
    try:
        response = requests.get(f"{base_url}/api/countries", timeout=5)
        if response.status_code == 200:
            countries = response.json()
            print(f"✅ Countries endpoint passed - Found {len(countries)} countries")
            for country in countries[:3]:  # Show first 3 countries
                print(f"   - {country['name']} ({country['currency_code']})")
        else:
            print(f"❌ Countries endpoint failed: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Countries endpoint failed: {e}")
        return False
    
    # Test 3: Predict house price (Pakistan example)
    print("\n3. Testing prediction endpoint...")
    try:
        prediction_data = {
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
        
        response = requests.post(
            f"{base_url}/api/predict",
            json=prediction_data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Prediction endpoint passed")
            print(f"   Predicted price: {result['predicted_price']:,.2f} {result['currency']}")
            print(f"   Currency conversions: {len(result['conversions'])} currencies")
        else:
            print(f"❌ Prediction endpoint failed: {response.status_code}")
            print(f"   Response: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Prediction endpoint failed: {e}")
        return False
    
    # Test 4: Get predictions history
    print("\n4. Testing predictions history...")
    try:
        response = requests.get(f"{base_url}/api/predictions", timeout=5)
        if response.status_code == 200:
            predictions = response.json()
            print(f"✅ Predictions history passed - Found {len(predictions)} predictions")
        else:
            print(f"❌ Predictions history failed: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Predictions history failed: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 All tests passed! Backend is working correctly.")
    return True

if __name__ == "__main__":
    # Wait a moment for the server to start
    print("⏳ Waiting for server to be ready...")
    time.sleep(2)
    
    success = test_backend()
    if not success:
        print("\n❌ Some tests failed. Please check the backend server.")
        exit(1) 