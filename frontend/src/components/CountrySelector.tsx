import React from 'react';
import Select from 'react-select';

interface Country {
  name: string;
  currency_code: string;
  currency_symbol: string;
  states: string[];
  form_fields: string[];
}

interface CountrySelectorProps {
  countries: Country[];
  selectedCountry: Country | null;
  selectedState: string;
  onCountryChange: (country: Country) => void;
  onStateChange: (state: string) => void;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({
  countries,
  selectedCountry,
  selectedState,
  onCountryChange,
  onStateChange,
}) => {
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
  
  const countryOptions = countries.map(country => ({
    value: country.name,
    label: (
      <div className="flex items-center space-x-2">
        <span className="text-lg">{getCountryFlag(country.name)}</span>
        <span>{country.name}</span>
      </div>
    ),
    data: country,
  }));

  const stateOptions = selectedCountry
    ? selectedCountry.states.map(state => ({
        value: state,
        label: state,
      }))
    : [];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Country
        </label>
        <Select
          options={countryOptions}
          value={countryOptions.find(option => option.value === selectedCountry?.name)}
          onChange={(option) => option && onCountryChange(option.data)}
          placeholder="Choose your country..."
          className="react-select-container"
          classNamePrefix="react-select"
          isSearchable
          isClearable
        />
      </div>

      {selectedCountry && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select {getStateLabel(selectedCountry.name)}
          </label>
          <Select
            options={stateOptions}
            value={stateOptions.find(option => option.value === selectedState)}
            onChange={(option) => option && onStateChange(option.value)}
            placeholder={`Choose your ${getStateLabel(selectedCountry.name).toLowerCase()}...`}
            className="react-select-container"
            classNamePrefix="react-select"
            isSearchable
            isClearable
          />
        </div>
      )}
    </div>
  );
};

const getStateLabel = (countryName: string): string => {
  const labelMap: { [key: string]: string } = {
    'Pakistan': 'Province',
    'USA': 'State',
    'UK': 'Country/Region',
    'Canada': 'Province',
    'Australia': 'State',
    'India': 'State',
    'UAE': 'Emirate',
    'Germany': 'State',
    'France': 'Region',
    'Malaysia': 'State',
  };
  return labelMap[countryName] || 'State';
};

export default CountrySelector;