import React, { useCallback } from 'react';
import { Field } from '@chakra-ui/react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  'data-testid'?: string;
}

const selectStyles: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '6px',
  borderWidth: '1px',
  borderColor: '#e2e8f0',
};

const SelectField: React.FC<SelectFieldProps> = ({ label, value, onChange, options, 'data-testid': testId }) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const selectId = `select-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <Field.Root>
      <Field.Label htmlFor={selectId}>{label}</Field.Label>
      <select
        id={selectId}
        data-testid={testId}
        value={value}
        onChange={handleChange}
        style={selectStyles}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field.Root>
  );
};

export default React.memo(SelectField);
export type { SelectOption };

