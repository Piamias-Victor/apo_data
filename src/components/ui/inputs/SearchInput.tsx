import React, { useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  accentColor?: string;
  onClear?: () => void;
  autoFocus?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "Rechercher...",
  accentColor = "teal",
  onClear,
  autoFocus = false
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChange("");
    if (onClear) onClear();
  };

  return (
    <div className="relative w-full">
      <div 
        className={`flex items-center bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-md 
                    ${isFocused ? `border-${accentColor}-500 ring-2 ring-${accentColor}-400` : ''}
                    transition-all duration-300`}
      >
        <FaSearch className={`${isFocused ? `text-${accentColor}-500` : 'text-gray-500'} mr-2 transition-colors`} />
        
        <input
          type="text"
          className="w-full px-2 py-1 text-sm outline-none bg-transparent placeholder-gray-400"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoFocus={autoFocus}
          aria-label={placeholder}
        />
        
        {value && (
          <button 
            onClick={handleClear}
            className={`text-gray-400 hover:text-${accentColor}-500 transition-colors focus:outline-none`}
            aria-label="Effacer la recherche"
          >
            <FaTimes />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchInput;