import PropTypes from "prop-types";
import { RiArrowDropDownLine } from "react-icons/ri";
import React, { useState, useEffect, useRef } from "react";

const Dropdown = ({
  btnContent,
  menuItems,
  btnCss,
  dropdownCss,
  handleClick,
  selectedValue,
  isSelection,
  showCheckbox,
  mainDropdown
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(null);

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = itemName => {
    setIsOpen(false);
    handleClick(itemName);
  };

  useEffect(() => {
    const handleOutsideClick = event => {
      if (isOpenRef.current && !isOpenRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <div className={`max-w-[261px] ${dropdownCss} relative`} ref={isOpenRef}>
      <button
        className={`w-full text-sm md:text-md dropbtn flex justify-between items-center ${btnCss} text-dark `}
        onClick={handleButtonClick}
      >
        {isSelection ? selectedValue : btnContent}
        <RiArrowDropDownLine size="25" />
      </button>

      {isOpen && (
        <div
          className={`dropdown-content menu bg-white border border-slate-50 rounded-b px-1 md:w-full w-[150px] overflow-scroll !visible !opacity-100 !scale-100`}
        >
          <div className="max-h-[250px] ">
            {menuItems.map(item => (
              <button
                key={`menu_item_${item.id}`}
                onClick={() => handleItemClick(item.name)}
                className={`border-b hover:bg-[#5256B82B]  cursor-pointer text-left w-full flex ${
                  mainDropdown ? "" : "p-2"
                }`}
              >
                <div className="w-full">
                  <div className="text-dark text-sm md:text-md">
                    {item.name}
                  </div>{" "}
                  {showCheckbox && (
                    <input
                      type="checkbox"
                      checked={selectedValue == item.name}
                    />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

Dropdown.propTypes = {
  btnCss: PropTypes.string,
  dropdownCss: PropTypes.string,
  selectedValue: PropTypes.string,
  isSelection: PropTypes.bool,
  showCheckbox: PropTypes.bool
};
Dropdown.defaultProps = {
  btnCss: "p-2 pt-3 text-center font-semibold",
  dropdownCss: "",
  handleClick: () => {},
  selectedValue: "",
  isSelection: false,
  showCheckbox: false
};

export default Dropdown;
