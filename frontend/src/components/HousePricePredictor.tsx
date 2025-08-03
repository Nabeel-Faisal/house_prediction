import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CountrySelector from './CountrySelector';
import DynamicForm from './DynamicForm';
import PredictionResult from './PredictionResult';
import LoadingSpinner from './LoadingSpinner';

interface Country {
  name: string;
  currency_code: string;
  currency_symbol: string;
  states: string[];
  form_fields: string[];
}

interface PredictionResult {
  predicted_price: number;
  currency: string;
  conversions: { [key: string]: number };
  timestamp: string;
}

const HousePricePredictor: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedState, setSelectedState] = useState<string>('');
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await axios.get('/api/countries');
      setCountries(response.data);
    } catch (err) {
      setError('Failed to load countries');
      console.error('Error fetching countries:', err);
    }
  };

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    setSelectedState('');
    setFormData({});
    setPrediction(null);
    setError('');
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setPrediction(null);
  };

  const handleFormDataChange = (data: { [key: string]: any }) => {
    setFormData(data);
    setPrediction(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCountry || !selectedState) {
      setError('Please select both country and state');
      return;
    }

    // Validate form data
    const requiredFields = selectedCountry.form_fields;
    const missingFields = requiredFields.filter(field => 
      !formData[field] || formData[field] === ''
    );

    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/predict', {
        country: selectedCountry.name,
        state: selectedState,
        features: formData
      });

      setPrediction(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to get prediction');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCountry(null);
    setSelectedState('');
    setFormData({});
    setPrediction(null);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Intelligent House Price Prediction
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Get accurate house price estimates across 10 countries using AI-powered machine learning models. 
          Select your location and property details to receive instant predictions in local and global currencies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Property Details
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <CountrySelector
              countries={countries}
              selectedCountry={selectedCountry}
              selectedState={selectedState}
              onCountryChange={handleCountryChange}
              onStateChange={handleStateChange}
            />

            {selectedCountry && selectedState && (
              <DynamicForm
                country={selectedCountry}
                formData={formData}
                onFormDataChange={handleFormDataChange}
              />
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading || !selectedCountry || !selectedState}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner />
                    <span className="ml-2">Predicting...</span>
                  </div>
                ) : (
                  'Predict Price'
                )}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Prediction Results
          </h2>

          {prediction ? (
            <PredictionResult prediction={prediction} country={selectedCountry!} />
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500">
                Fill in the property details and click "Predict Price" to see the estimated value
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HousePricePredictor; 