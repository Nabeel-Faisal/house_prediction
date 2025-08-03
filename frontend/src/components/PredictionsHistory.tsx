import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

interface Prediction {
  country: string;
  state: string;
  inputs: { [key: string]: any };
  predicted_price: number;
  currency: string;
  timestamp: string;
}

const PredictionsHistory: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/predictions');
      setPredictions(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load predictions');
      console.error('Error fetching predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currencyCode: string): string => {
    const currencySymbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'CAD': 'C$',
      'AUD': 'A$',
      'INR': '₹',
      'PKR': '₨',
      'AED': 'د.إ',
      'MYR': 'RM',
    };

    const symbol = currencySymbols[currencyCode] || currencyCode;
    
    if (currencyCode === 'INR' || currencyCode === 'PKR') {
      return `${symbol}${amount.toLocaleString('en-IN')}`;
    } else if (currencyCode === 'AED') {
      return `${symbol}${amount.toLocaleString('en-AE')}`;
    } else {
      return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
  };

  const formatDate = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  const getCountryFlag = (countryName: string): string => {
    const flagMap: { [key: string]: string } = {
      'Pakistan': '🇵🇰',
      'USA': '🇺🇸',
      'UK': '🇬🇧',
      'Canada': '🇨🇦',
      'Australia': '🇦🇺',
      'India': '🇮🇳',
      'UAE': '🇦🇪',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'Malaysia': '🇲🇾',
    };
    return flagMap[countryName] || '🏠';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading prediction history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchPredictions}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Prediction History
        </h1>
        <p className="text-lg text-gray-600">
          Recent house price predictions made using our AI models
        </p>
      </div>

      {predictions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Predictions Yet</h3>
          <p className="text-gray-600">
            Start by making your first house price prediction to see it here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {predictions.map((prediction, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCountryFlag(prediction.country)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {prediction.country}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {prediction.state}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-600">
                    {formatCurrency(prediction.predicted_price, prediction.currency)}
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatDate(prediction.timestamp)}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Property Details
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {Object.entries(prediction.inputs).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600 capitalize">
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <span className="font-medium text-gray-900">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PredictionsHistory; 