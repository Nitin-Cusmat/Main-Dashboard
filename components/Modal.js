import { Dialog } from "@headlessui/react";
import PropTypes from "prop-types";
import { BsXLg } from "react-icons/bs";
import Button from "./Button";

const Modal = props => {
  const { show, onHide, children, title, description, showCloseBtn } = props;

  return (
    <Dialog open={show} onClose={onHide} fullWidth>
      <div className="fixed inset-0 bg-white/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
        <Dialog.Panel className="w-full max-w-lg rounded bg-white shadow-lg shadow-gray-400">
          {(title || showCloseBtn) && (
            <Dialog.Title className="flex justify-between items-center -mt-out-of-group -mx-out-of-group border-off-white-200 p-3">
              <div className="pl-out-of-group text-dark  text-lx font-semibold">
                {title}
              </div>
              <Button
                btnVariant="plain"
                onClick={onHide}
                cclassName="pr-out-of-group py-3 text-lg hover:text-innova-primary"
              >
                <BsXLg />
              </Button>
            </Dialog.Title>
          )}
          <Dialog.Description //Note: Add a default styling to description
          >
            {description}
          </Dialog.Description>
          <hr className="border-innova-primary" />
          <div className="px-3 pt-3">{children}</div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

Modal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.object,
    PropTypes.array
  ]),
  description: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.object
  ]),
  title: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.object
  ]),
  showCloseBtn: PropTypes.bool,
  className: PropTypes.string
};

Modal.defaultProps = {
  children: null,
  description: "",
  title: "",
  showCloseBtn: false,
  className: ""
};

export default Modal;
