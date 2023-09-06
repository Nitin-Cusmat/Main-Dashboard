import React from "react";
import ReactLoading from "react-loading";
import { usePromiseTracker } from "react-promise-tracker";
const LoadingSpinner = props => {
  const { promiseInProgress } = usePromiseTracker({ area: props.area });
  return (
    promiseInProgress && (
      <div
        className={`absolute z-50 inset-0 flex flex-col justify-center items-center ${
          props.isOverlay ? "bg-black bg-opacity-5" : ""
        } ${props.classes}`}
      >
        <ReactLoading
          type={"spin"}
          color={"var(--primary-color)"}
          height={20}
          width={20}
        />
        {props.message && (
          <p className={`${props.messageClasses}`}>{props.message}</p>
        )}
      </div>
    )
  );
};

export default LoadingSpinner;
