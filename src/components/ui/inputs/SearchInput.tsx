import { FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder = "Rechercher..." }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative w-full max-w-md mx-auto mb-4"
    >
      <div className="flex items-center bg-white border border-gray-300 rounded-md px-4 py-2 shadow-md 
                      focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-400 transition-all duration-300">
        <FaSearch className="text-gray-500" />
        <input
          type="text"
          className="w-full px-3 py-1 text-sm outline-none bg-transparent placeholder-gray-400"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </motion.div>
  );
};

export default SearchInput;