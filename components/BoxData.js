import React from "react";
import PropTypes from "prop-types";

const BoxData = ({
  heading,
  value,
  size,
  classnames,
  footer = <></>,
  children,
  footerFlex = false
}) => {
  return (
    <div className={`${classnames} ${size} `}>
      <div
        className={`flex flex-col justify-start px-3 py-2 border border-[#E9EAED] h-full relative`}
      >
        <div className="text-dark whitespace-nowrap text-md lg:text-lg  mb-2">
          {heading}
        </div>
        <div
          className={`${
            footerFlex === true ? "flex justify-between items-center" : ""
          }`}
        >
          <div className={`text-secondary text-[30px] font-bold py-2`}>
            {typeof value === "number"
              ? value % 1 !== 0
                ? value.toFixed(2)
                : value.toString().padStart(2, "0")
              : value}
          </div>
          {children}
        </div>
        <div className="h-[18px]">{footer}</div>
      </div>
    </div>
  );
};

BoxData.propTypes = {
  size: PropTypes.string,
  classnames: PropTypes.string
};

BoxData.defaultProps = {
  size: "w-[300px] lg:w-[370px] h-[150px] lg:h-[180px]",
  classnames: ""
};
export default BoxData;
