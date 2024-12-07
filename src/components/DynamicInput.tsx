import { useState } from 'react';
import type { InputType, ValidationRules } from '../types';

interface DynamicInputProps {
  type: InputType;
  value: string;
  onChange: (value: string) => void;
  validation?: ValidationRules;
  error?: string;
}

export const DynamicInput = ({ type, value, onChange, validation, error }: DynamicInputProps) => {
  const [touched, setTouched] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched(true);
    onChange(e.target.value);
  };

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={handleChange}
            className="w-full p-4 bg-white/5 border border-white/20 rounded-lg 
                     text-white focus:border-white/40 focus:outline-none
                     transition-colors min-h-[120px] resize-none"
            placeholder="Votre réponse..."
            {...(validation?.required && { required: true })}
            {...(validation?.minLength && { minLength: validation.minLength })}
            {...(validation?.maxLength && { maxLength: validation.maxLength })}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={handleChange}
            className="w-full p-4 bg-white/5 border border-white/20 rounded-lg 
                     text-white focus:border-white/40 focus:outline-none
                     transition-colors"
            {...(validation?.min !== undefined && { min: validation.min })}
            {...(validation?.max !== undefined && { max: validation.max })}
            {...(validation?.required && { required: true })}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={handleChange}
            className="w-full p-4 bg-white/5 border border-white/20 rounded-lg 
                     text-white focus:border-white/40 focus:outline-none
                     transition-colors"
            {...(validation?.required && { required: true })}
          />
        );

      case 'yesno':
        return (
          <div className="space-y-4">
            {(['Oui', 'Non'] as const).map((option) => (
              <button
                key={option}
                onClick={() => onChange(option)}
                className={`w-full p-4 border rounded-lg transition-all
                          ${value === option 
                            ? 'bg-white/20 border-white' 
                            : 'bg-white/5 border-white/20 hover:bg-white/10'}`}
              >
                {option}
              </button>
            ))}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={handleChange}
            className="w-full p-4 bg-white/5 border border-white/20 rounded-lg 
                     text-white focus:border-white/40 focus:outline-none
                     transition-colors"
            placeholder="Votre réponse..."
            {...(validation?.required && { required: true })}
            {...(validation?.minLength && { minLength: validation.minLength })}
            {...(validation?.maxLength && { maxLength: validation.maxLength })}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {renderInput()}
      {touched && error && (
        <p className="text-red-400 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};
