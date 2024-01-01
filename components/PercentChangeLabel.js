import React from "react";

const PercentChangeLabel = ({ value = "", msg = "", isPositive = true }) => {
  return (
    <div className="text-sm">
      {(value || value === 0) && (
        <>
          <span
            className={`${
              isPositive ||
              (typeof value === "string" && value.charAt(0) === "+")
                ? "bg-[#dde2d3] text-[#75A314]"
                : "bg-[#fd625e2e] text-[#fd625e]"
            } rounded px-1`}
          >
            {isPositive && parseInt(value, 10) > 0 ? "+" + value : value}
          </span>
          <span className="text-dark"> {msg}</span>
        </>
      )}
    </div>
  );
};

export default PercentChangeLabel;
