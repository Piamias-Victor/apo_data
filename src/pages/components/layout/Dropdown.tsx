import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";

type DropdownProps = {
  label: string;
  selectedItem?: string | null;
  items: string[];
  onSelect: (item: string) => void;
  onClear: () => void;
};

const Dropdown: React.FC<DropdownProps> = ({
  label,
  selectedItem,
  items,
  onSelect,
  onClear
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex items-center space-x-2">
      <div className="dropdown flex-1 relative">
        <div
          tabIndex={0}
          role="button"
          className="btn w-full bg-primary text-white hover:bg-secondary transition"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          {selectedItem || label}
        </div>
        {isOpen && (
          <div
            className="dropdown-content bg-gray-100 shadow rounded-box w-60 absolute right-full top-0 mr-2 p-2 max-h-64 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              placeholder={`Rechercher ${label.toLowerCase()}...`}
              className="input input-bordered w-full mb-2 focus:ring-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <ul className="menu">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <li
                    key={item}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onSelect(item);
                      setIsOpen(false);
                    }}
                    className="hover:bg-primary hover:text-white transition cursor-pointer px-4 py-2 rounded-md"
                  >
                    {item}
                  </li>
                ))
              ) : (
                <li className="text-gray-500 px-4 py-2">Aucun trouvé</li>
              )}
            </ul>
          </div>
        )}
      </div>
      <button className="btn btn-xs btn-ghost text-primary hover:text-secondary shrink-0" onClick={onClear}>
        <FaTrash />
      </button>
    </div>
  );
};

export default Dropdown;
