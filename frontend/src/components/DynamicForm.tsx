import React from 'react';

interface Country {
  name: string;
  currency_code: string;
  currency_symbol: string;
  states: string[];
  form_fields: string[];
}

interface DynamicFormProps {
  country: Country;
  formData: { [key: string]: any };
  onFormDataChange: (data: { [key: string]: any }) => void;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  country,
  formData,
  onFormDataChange,
}) => {
  const handleInputChange = (field: string, value: any) => {
    const newFormData = { ...formData, [field]: value };
    onFormDataChange(newFormData);
  };

  const getFieldConfig = (field: string) => {
    const configs: { [key: string]: any } = {
      // Pakistan-specific fields
      plot_size_marla: {
        label: 'Plot Size (Marla)',
        type: 'number',
        placeholder: 'Enter plot size in Marla',
        min: 1,
        max: 50,
        step: 0.5,
      },
      covered_area_sqft: {
        label: 'Covered Area (sq ft)',
        type: 'number',
        placeholder: 'Enter covered area in square feet',
        min: 100,
        max: 10000,
      },
      construction_type: {
        label: 'Construction Quality',
        type: 'select',
        options: [
          { value: 0, label: 'Basic (Simple materials, functional design)' },
          { value: 1, label: 'Standard (Quality materials, modern amenities)' },
          { value: 2, label: 'Luxury (Premium materials, architectural design)' },
        ],
      },
      location_tier: {
        label: 'Neighborhood Quality',
        type: 'select',
        options: [
          { value: 0, label: 'Developing Area' },
          { value: 1, label: 'Established Area' },
          { value: 2, label: 'Premium Area' },
        ],
      },
      utilities: {
        label: 'Gas Available',
        type: 'select',
        options: [
          { value: 0, label: 'No' },
          { value: 1, label: 'Yes' },
        ],
      },

      // USA-specific fields
      square_footage: {
        label: 'Square Footage',
        type: 'number',
        placeholder: 'Enter total square footage',
        min: 500,
        max: 10000,
      },
      zip_code: {
        label: 'ZIP Code',
        type: 'text',
        placeholder: 'Enter ZIP code',
        pattern: '[0-9]{5}',
      },
      property_type: {
        label: 'Property Type',
        type: 'select',
        options: [
          { value: 0, label: 'House' },
          { value: 1, label: 'Condo' },
          { value: 2, label: 'Townhouse' },
        ],
      },
      year_built: {
        label: 'Year Built',
        type: 'number',
        placeholder: 'Enter year built (whole numbers only)',
        min: 1900,
        max: new Date().getFullYear(),
        step: 1,
      },
      lot_size: {
        label: 'Lot Size (sq ft)',
        type: 'number',
        placeholder: 'Enter lot size in square feet',
        min: 1000,
        max: 50000,
      },

      // UK-specific fields
      square_meters: {
        label: 'Square Meters',
        type: 'number',
        placeholder: 'Enter area in square meters',
        min: 50,
        max: 500,
      },
      postcode: {
        label: 'Postcode',
        type: 'text',
        placeholder: 'Enter postcode',
      },
      garden: {
        label: 'Garden',
        type: 'select',
        options: [
          { value: 0, label: 'No' },
          { value: 1, label: 'Yes' },
        ],
      },

      // Canada-specific fields
      postal_code: {
        label: 'Postal Code',
        type: 'text',
        placeholder: 'Enter postal code (e.g., A1A 1A1)',
      },

      // Australia-specific fields
      australia_postcode: {
        label: 'Postcode',
        type: 'text',
        placeholder: 'Enter postcode',
      },
      land_size: {
        label: 'Land Size (sq m)',
        type: 'number',
        placeholder: 'Enter land size in square meters',
        min: 100,
        max: 10000,
      },

      // India-specific fields
      square_feet: {
        label: 'Square Feet',
        type: 'number',
        placeholder: 'Enter area in square feet',
        min: 500,
        max: 10000,
      },
      city: {
        label: 'City',
        type: 'select',
        options: [
          { value: 0, label: 'Mumbai' },
          { value: 1, label: 'Delhi' },
          { value: 2, label: 'Bangalore' },
          { value: 3, label: 'Chennai' },
          { value: 4, label: 'Hyderabad' },
          { value: 5, label: 'Kolkata' },
          { value: 6, label: 'Pune' },
          { value: 7, label: 'Ahmedabad' },
          { value: 8, label: 'Jaipur' },
          { value: 9, label: 'Lucknow' },
        ],
      },
      amenities: {
        label: 'Amenities',
        type: 'select',
        options: [
          { value: 0, label: 'Basic' },
          { value: 1, label: 'Standard' },
          { value: 2, label: 'Premium' },
        ],
      },

      // UAE-specific fields
      emirate: {
        label: 'Emirate',
        type: 'text',
        placeholder: 'Enter emirate name',
      },

      // Germany/France-specific fields
      energy_rating: {
        label: 'Energy Rating',
        type: 'select',
        options: [
          { value: 0, label: 'A' },
          { value: 1, label: 'B' },
          { value: 2, label: 'C' },
          { value: 3, label: 'D' },
          { value: 4, label: 'E' },
          { value: 5, label: 'F' },
          { value: 6, label: 'G' },
        ],
      },

      // Malaysia-specific fields
      state: {
        label: 'State',
        type: 'text',
        placeholder: 'Enter state name',
      },

      // Common fields
      bedrooms: {
        label: 'Number of Bedrooms',
        type: 'number',
        placeholder: 'Enter number of bedrooms (whole numbers only)',
        min: 1,
        max: 10,
        step: 1,
      },
      bathrooms: {
        label: 'Number of Bathrooms',
        type: 'number',
        placeholder: 'Enter number of bathrooms (whole numbers only)',
        min: 1,
        max: 8,
        step: 1,
      },
    };

    return configs[field] || {
      label: field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      type: 'text',
      placeholder: `Enter ${field.replace(/_/g, ' ')}`,
    };
  };

  // Additional information fields for Pakistan that don't affect prediction
  const renderAdditionalInfo = () => {
    if (country.name !== 'Pakistan') return null;
    
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
        <h4 className="text-md font-medium text-gray-800 mb-3">Additional Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Electricity Availability
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Electricity Availability</option>
              <option value="regular">Regular Supply</option>
              <option value="irregular">Irregular Supply</option>
              <option value="backup">With Backup Generator</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Water Supply Quality
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Water Supply Quality</option>
              <option value="municipal">Municipal Supply</option>
              <option value="borehole">Borehole/Well</option>
              <option value="tanker">Water Tanker Dependent</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Note: These additional details are for information only and do not affect the price prediction.</p>
      </div>
    );
  };

  const renderField = (field: string) => {
    const config = getFieldConfig(field);
    const value = formData[field] || '';

    switch (config.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field, parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select {config.label}</option>
            {config.options.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => {
              // Use parseInt for fields that should be whole numbers only
              if (field === 'bathrooms' || field === 'bedrooms' || field === 'year_built') {
                handleInputChange(field, parseInt(e.target.value) || 0);
              } else {
                handleInputChange(field, parseFloat(e.target.value) || 0);
              }
            }}
            placeholder={config.placeholder}
            min={config.min}
            max={config.max}
            step={config.step || 1}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={config.placeholder}
            pattern={config.pattern}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Property Details for {country.name}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {country.form_fields.map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getFieldConfig(field).label}
            </label>
            {renderField(field)}
          </div>
        ))}
      </div>

      {/* Render additional information section for Pakistan */}
      {renderAdditionalInfo()}
    </div>
  );
};

export default DynamicForm;