import React, { useEffect, useState } from "react";
import { BsChevronRight, BsChevronDown } from "react-icons/bs";
import PropTypes from "prop-types";

export const Disclosure = ({
  classname,
  title,
  children,
  show,
  titleCss,
  alwaysOpen = false,
  disabled
}) => {
  const [open, setOpen] = useState(show);

  useEffect(() => {
    setOpen(show);
  }, [show]);
  return (
    <div className={`${classname}`} key={`disclousre_${title}`}>
      <div
        key={`_${title}`}
        onClick={() => setOpen(alwaysOpen || !open)}
        className={`text-md  md:text-lg lg:text-xl font-bold px-4 py-2 bg-[#5256b8] text-white flex justify-between ${titleCss}`}
      >
        {title}
        {open ? (
          <BsChevronDown key="1" className="pt-1 cursor-pointer" />
        ) : (
          <BsChevronRight key="2" className="pt-1 cursor-pointer" />
        )}
      </div>
      {open ? children : ""}
    </div>
  );
};

Disclosure.prototypes = {
  title: PropTypes.string,
  show: PropTypes.bool,
  classname: PropTypes.string,
  titleCss: PropTypes.string,
  disabled: PropTypes.bool
};

Disclosure.defaultProps = {
  title: "",
  show: false,
  classname: "",
  titleCss: "",
  disabled: false
};
