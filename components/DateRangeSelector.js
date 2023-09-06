import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { DateRangePicker } from "react-date-range";

import React, { useState } from "react";
import { defaultStaticRanges } from "./defaultRanges";

// import "./Datepicker.css";

import PropTypes from "prop-types";
import Button from "./Button";

const DateRangeSelector = ({
  show,
  setShow,
  ranges,
  onChange,
  onSubmit,
  initialDate,
  setSelectedDateRange,
  screenWidth,
  ...rest
}) => {
  const [calenderDate, setCalenderDate] = useState(initialDate);

  const handleSelect = ranges => {
    setCalenderDate(ranges.selection);
  };

  const onClickClear = () => {
    setCalenderDate({
      startDate: new Date(),
      endDate: new Date(),
      key: "selection"
    });
    setShow(false);
  };

  const onApplyClick = () => {
    setShow(false);
    setSelectedDateRange(calenderDate);
  };

  return (
    <React.Fragment>
      <div className="shadow inline-block bg-white z-50">
        <DateRangePicker
          onChange={handleSelect}
          showSelectionPreview={true}
          moveRangeOnFirstSelection={false}
          months={screenWidth <= 1024 ? 1 : 2}
          ranges={[calenderDate]}
          inputRanges={[]}
          staticRanges={[...defaultStaticRanges]}
          direction={screenWidth <= 1024 ? "vertical" : "horizontal"}
          rangeColors={["#5256b8"]}
        />
        <div className="text-right position-relative rdr-buttons-position mt-2 mr-3 ">
          <Button
            className="px-5 py-2 mr-4 rounded mb-4"
            onClick={onApplyClick}
          >
            Done
          </Button>
          <Button
            className="px-5 py-2 mr-4 rounded mb-4"
            onClick={onClickClear}
          >
            Clear
          </Button>
        </div>
      </div>
    </React.Fragment>
  );
};

DateRangeSelector.defaultProps = {
  // ranges: defaultStaticRanges
};

DateRangeSelector.propTypes = {
  /**
   * On Submit
   */
  onSubmit: PropTypes.func
};

export default DateRangeSelector;
