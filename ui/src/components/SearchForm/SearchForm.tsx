import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  HStack,
  Stack,
  Button,
} from "@chakra-ui/react";
import SelectField from '@/components/SelectField/SelectField';
import type { SearchFilters } from '@/interfaces';

interface SearchFormProps {
  onSearch: (filters: SearchFilters) => void;
}

const propertyOptions = [
  { value: '', label: 'Any' },
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'unit', label: 'Unit' },
  { value: 'studio', label: 'Studio' },
];

const bedroomOptions = [
  { value: '', label: 'Any' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5+' },
];

const priceRanges = [
  { value: '', label: 'Any' },
  { value: '0', label: '$0' },
  { value: '500000', label: '$500k' },
  { value: '750000', label: '$750k' },
  { value: '1000000', label: '$1M' },
  { value: '1500000', label: '$1.5M' },
  { value: '2000000', label: '$2M+' },
];

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    property_type: '',
    min_bedrooms: '',
    max_bedrooms: '',
    min_price: '',
    max_price: '',
  });

  const handleChange = useCallback((field: keyof SearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    const resetFilters: SearchFilters = {
      property_type: '',
      min_bedrooms: '',
      max_bedrooms: '',
      min_price: '',
      max_price: '',
    };
    setFilters(resetFilters);
    onSearch(resetFilters);
  };

  return (
    <Box as="form" width="100%" onSubmit={handleSubmit} data-testid="search-form">
      <Stack direction={{ base: 'column', md: 'row' } as const} gap={4} align="flex-end">
        <SelectField
          data-testid="search-form-property-type-select"
          label="Property Type"
          value={filters.property_type || ''}
          onChange={(value) => handleChange('property_type', value)}
          options={propertyOptions}
        />

        <SelectField
          data-testid="search-form-min-bedrooms-select"
          label="Min Bedrooms"
          value={filters.min_bedrooms || ''}
          onChange={(value) => handleChange('min_bedrooms', value)}
          options={bedroomOptions}
        />

        <SelectField
          data-testid="search-form-max-bedrooms-select"
          label="Max Bedrooms"
          value={filters.max_bedrooms || ''}
          onChange={(value) => handleChange('max_bedrooms', value)}
          options={bedroomOptions}
        />

        <SelectField
          data-testid="search-form-min-price-select"
          label="Min Price"
          value={filters.min_price || ''}
          onChange={(value) => handleChange('min_price', value)}
          options={priceRanges}
        />

        <SelectField
          data-testid="search-form-max-price-select"
          label="Max Price"
          value={filters.max_price || ''}
          onChange={(value) => handleChange('max_price', value)}
          options={priceRanges}
        />

        <HStack gap={2}>
          <Button type="submit" colorPalette="blue" data-testid="search-form-submit-button">
            Search
          </Button>
          <Button type="button" onClick={handleReset} variant="outline" data-testid="search-form-reset-button">
            Reset
          </Button>
        </HStack>
      </Stack>
    </Box>
  );
};

export default SearchForm;
