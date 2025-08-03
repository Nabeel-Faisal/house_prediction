import React from 'react';

interface Country {
  name: string;
  currency_code: string;
  currency_symbol: string;
  states: string[];
  form_fields: string[];
}

interface PredictionResultProps {
  prediction: {
    predicted_price: number;
    currency: string;
    conversions: { [key: string]: number };
    timestamp: string;
    price_breakdown?: {
      base_price?: number;
      base_factors: { 
        [key: string]: number | { 
          value?: number;
          factor?: number;
          impact?: string;
        } 
      };
      location_factor: number;
      explanation: string | string[];
    };
    cleaned_features?: { [key: string]: any };
  };
  country: Country;
}

const PredictionResult: React.FC<PredictionResultProps> = ({ prediction, country }) => {
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
    
    // Format based on currency
    if (currencyCode === 'INR' || currencyCode === 'PKR') {
      return `${symbol}${amount.toLocaleString('en-IN')}`;
    } else if (currencyCode === 'AED') {
      return `${symbol}${amount.toLocaleString('en-AE')}`;
    } else {
      return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
  };

  const getCurrencyName = (code: string): string => {
    const names: { [key: string]: string } = {
      'USD': 'US Dollar',
      'EUR': 'Euro',
      'GBP': 'British Pound',
      'CAD': 'Canadian Dollar',
      'AUD': 'Australian Dollar',
      'INR': 'Indian Rupee',
      'PKR': 'Pakistani Rupee',
      'AED': 'UAE Dirham',
      'MYR': 'Malaysian Ringgit',
    };
    return names[code] || code;
  };

  const formatDate = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Main Prediction */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-green-800 mb-2">
            Estimated Property Value
          </h3>
          <div className="text-3xl font-bold text-green-900 mb-2">
            {formatCurrency(prediction.predicted_price, prediction.currency)}
          </div>
          <p className="text-sm text-green-700">
            {country.name} • {getCurrencyName(prediction.currency)}
          </p>
        </div>
      </div>

      {/* Currency Conversions */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Converted to Other Currencies
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(prediction.conversions).map(([currency, amount]) => (
            <div
              key={currency}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4"
            >
              <div className="text-sm text-gray-600 mb-1">
                {getCurrencyName(currency)}
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(amount, currency)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Breakdown */}
      {prediction.price_breakdown && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-indigo-800 mb-3">
            Price Breakdown Analysis
          </h4>
          <div className="text-sm text-indigo-700 space-y-3">
            {/* Explanation */}
            <div className="bg-white bg-opacity-50 p-3 rounded border border-indigo-100">
              {Array.isArray(prediction.price_breakdown?.explanation) ? (
                <ul className="list-disc pl-5 space-y-1">
                  {prediction.price_breakdown?.explanation.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>{prediction.price_breakdown?.explanation}</p>
              )}
            </div>
            
            {/* Base Factors */}
            <div>
              <h5 className="font-medium mb-2">Contributing Factors</h5>
              <div className="space-y-2">
                {Object.entries(prediction.price_breakdown?.base_factors || {}).map(([factor, factorData]) => {
                  // Handle both formats: simple number or object with value/factor/impact
                  const isObject = typeof factorData === 'object' && factorData !== null;
                  
                  // Type assertion for TypeScript
                  type FactorObject = { value?: number; factor?: number; impact?: string };
                  
                  const factorValue = isObject ? 
                    (prediction.price_breakdown?.base_price && (factorData as FactorObject).factor ? 
                      (prediction.price_breakdown?.base_price * (((factorData as FactorObject).factor || 1) - 1)) : 
                      (factorData as FactorObject).value || 0) : 
                    (factorData as number);
                  
                  const factorImpact = isObject ? 
                    ((factorData as FactorObject).impact || 'medium') : 
                    'medium';
                  
                  // Determine color based on impact
                  const impactColors: {[key: string]: string} = {
                    'very high': 'bg-red-600',
                    'high': 'bg-orange-500',
                    'medium': 'bg-indigo-600',
                    'low': 'bg-blue-500',
                    'very low': 'bg-green-500'
                  };
                  const barColor = impactColors[factorImpact as keyof typeof impactColors] || 'bg-indigo-600';
                  
                  return (
                    <div key={factor} className="flex items-center">
                      <div className="w-full">
                        <div className="flex justify-between mb-1">
                          <span className="capitalize">{factor.replace(/_/g, ' ')}</span>
                          <span>{formatCurrency(factorValue, prediction.currency)}</span>
                        </div>
                        <div className="w-full bg-indigo-100 rounded-full h-2">
                          <div 
                            className={`${barColor} h-2 rounded-full`} 
                            style={{ 
                              width: `${Math.min(100, (factorValue / prediction.predicted_price) * 100)}%` 
                            }}
                          ></div>
                        </div>
                        {isObject && (
                          <div className="text-xs text-right mt-1">
                            <span className="capitalize">{factorImpact} impact</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {/* Location Factor */}
                <div className="flex items-center">
                  <div className="w-full">
                    <div className="flex justify-between mb-1">
                      <span>Location Adjustment</span>
                      <span>{formatCurrency(prediction.price_breakdown?.location_factor || 0, prediction.currency)}</span>
                    </div>
                    <div className="w-full bg-indigo-100 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, ((prediction.price_breakdown?.location_factor || 0) / prediction.predicted_price) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prediction Details */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          Prediction Details
        </h4>
        <div className="text-sm text-blue-700 space-y-1">
          <div className="flex justify-between">
            <span>Prediction Time:</span>
            <span>{formatDate(prediction.timestamp)}</span>
          </div>
          <div className="flex justify-between">
            <span>Model Used:</span>
            <span>AI-Powered ML Model</span>
          </div>
          <div className="flex justify-between">
            <span>Accuracy:</span>
            <span>High Confidence</span>
          </div>
        </div>
      </div>

      {/* Cleaned Features */}
      {prediction.cleaned_features && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-teal-800 mb-2">
            Features Used for Prediction
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(prediction.cleaned_features).map(([key, value]) => (
              <div key={key} className="flex justify-between p-2 bg-white bg-opacity-60 rounded border border-teal-100">
                <span className="text-teal-700 capitalize">{key.replace(/_/g, ' ')}:</span>
                <span className="text-teal-900 font-medium">
                  {typeof value === 'number' ? 
                    (Number.isInteger(value) ? value : value.toFixed(2)) : 
                    String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Important Notice</p>
            <p>
              This prediction is based on AI analysis and should be used as a reference only. 
              Actual property values may vary based on market conditions, property condition, 
              and other factors. We recommend consulting with local real estate professionals 
              for accurate valuations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionResult;