import React from "react";
import PropTypes from "prop-types";

const Button = ({ children, btnVariant, onClick, disabled, className }) => {
  const variant = {
    outline: "bg-white text-light-primary border border-light-primary border-2",
    oulinePrimary: "bg-white text-primary border border-primary border-2",
    primary: "bg-primary text-white ",
    plain: "text-slate-500 border",
    plainBg: "!bg-[#CECCCC] !text-white !border-[#CECCCC]",
    light: "text-slate-300 border border--slate-300",
    secondary: "text-[#565B6B] bg-[#E3E1EF]",
    link: "text-primary hover:underline underline-offset-2",
    disbaledLink: "text-[#B9B9B9] underline-offset-2 cursor-default",
    plainText: "text-grey cursor-default"
  };
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`text-sm md:text-md  ${className} ${variant[btnVariant]} ${
        disabled && variant["plainBg"]
      }`}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  btnVariant: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
  login: PropTypes.bool,
  icon: PropTypes.element
};

Button.defaultProps = {
  btnVariant: "primary",
  onClick: () => {},
  className: "px-5 py-2 rounded font-semibold ",
  login: false,
  icon: <></>
};
export default Button;
