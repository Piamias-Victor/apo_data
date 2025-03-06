import { FaSearch } from "react-icons/fa";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder = "Rechercher..." }) => {
  return (
    <div className="relative w-full">
      <div className="flex items-center bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-md 
                      focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-400 transition-all duration-300">
        <FaSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          className="w-full px-2 py-1 text-sm outline-none bg-transparent placeholder-gray-400"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SearchInput;