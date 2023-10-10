import CustomTable from "components/CustomTable";
import React, { useEffect, useState } from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import RangeBarChart from "./RangeBarChart";
import { getFormattedTime } from "utils/utils";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const KpiReport = ({ kpis1, kpis2, compare, module }) => {
  const [booleanKpis, setBooleanKpis] = useState([]);
  const [decimalKpis, setDecimalKpis] = useState([]);
  const [stringKpis, setStringKpis] = useState([]);
  const [rangeKpis, setRangeKpis] = useState([]);

  const hasIdealTime = kpis1.some(kpi => kpi.ideal_time !== undefined);
  const hasSpeed = kpis1.some(kpi => kpi.speed !== undefined);


  const extractNumericalValue = (valueWithUnit) => {
    if (typeof valueWithUnit === 'number') return valueWithUnit;
    if (typeof valueWithUnit === 'string' && !isNaN(valueWithUnit)) return parseFloat(valueWithUnit);
    if (typeof valueWithUnit === 'string') {
      const matchedValue = valueWithUnit.match(/\d+(\.\d+)?/);
      return matchedValue ? parseFloat(matchedValue[0]) : 0;
    }
    
    return 0;
  };


  useEffect(() => {
    let bKpis = [];
    let dKpis = [];
    let sKpis = [];
    let rKpis = [];
    kpis1.forEach((kpi, index) => {
      const idealTimeNumerical = extractNumericalValue(kpi.ideal_time);
  const user1Value = extractNumericalValue(kpi.value);
  let timeDifferenceFormatted, timeDifferenceColor;

  if (kpi.ideal_time !== undefined) {
    const timeDifference = user1Value - idealTimeNumerical;

    if (timeDifference > 0) {
      timeDifferenceColor = 'red';
      timeDifferenceFormatted = "+" + getFormattedTime(timeDifference);
    } else {
      timeDifferenceColor = 'green';
      timeDifferenceFormatted = getFormattedTime(timeDifference);
    }
  }



      const user2Value = kpis2 && kpis2.length > index && kpis2[index].value ? extractNumericalValue(kpis2[index].value) : null;
      const timeDifference2 = (idealTimeNumerical - user2Value);
      const timeDifference2InMinutes = compare && user2Value !== null ? timeDifference2 / 60 : null;
      const formattedTimeDifference2 = timeDifference2InMinutes && timeDifference2InMinutes >= 1 ? `${timeDifference2InMinutes.toFixed(2)} min` : (user2Value !== null ? `${timeDifference2.toFixed(2)} sec` : null);
      switch (kpi.type) {
        case "number":
          if (kpi.range) {
            const min = kpi.range.min ? kpi.range.min : 0;
            let max = kpi.range.max;
            max = Math.ceil(max);
            // const timeDifferenceFormatted = getFormattedTime(timeDifference); // This will give the time difference in the desired format

            // const idealTimeValue1 = extractNumericalValue(kpi.ideal_time);
            // const user2Value = kpis2 && kpis2.length > index && kpis2[index].value ? extractNumericalValue(kpis2[index].value) : null;
            // const timeDifference2 = (idealTimeValue1 - user2Value);
            // const timeDifference2InMinutes = compare && user2Value !== null ? timeDifference2 / 60 : null;

            // const formattedTimeDifference2 = timeDifference2InMinutes && timeDifference2InMinutes >= 1 ? `${timeDifference2InMinutes.toFixed(2)} min` : (user2Value !== null ? `${timeDifference2.toFixed(2)} sec` : null);

            // const idealTimeNumerical = extractNumericalValue(kpi.ideal_time);
            // const user1Value = extractNumericalValue(kpi.value);
            // const timeDifference1 = idealTimeNumerical - user1Value;
            // const timeDifferenceColor = timeDifference >= 0 ? 'green' : 'red';
            

            rKpis.push(
              compare
                ? {
                    ...kpi,
                    decimalValue: kpi.value,
                    range: [min, max],
                    "Ideal time": kpi?.ideal_time,
                    "ideal range": kpi.range.min + "-" + kpi.range.max,
                    "Time taken by user 1":
                      getFormattedTime(kpi.value) +
                      (kpi.unit ? " " + kpi.unit : ""),
                    "Time taken by user 2":
                      getFormattedTime(kpis2[index].value) +
                      " " +
                      (kpis2[index].unit ? " " + kpis2[index].unit : ""),
                      time_difference_user1: timeDifferenceFormatted,
                      time_difference_color_user1: timeDifferenceColor,
                      time_difference_user2: formattedTimeDifference2 // Added this field
      
                  }
                : {
                    ...kpi,
                    "Time taken by user":
                      getFormattedTime(kpi.value) +
                      (kpi.unit ? " " + kpi.unit : ""),
                    decimalValue: kpi.value,
                    range: [min, max],
                    "Ideal time": kpi?.ideal_time,
                    "ideal range": kpi.range.min + "-" + kpi.range.max,
                    time_difference: timeDifferenceFormatted, // Added this field

                    time_difference_color: timeDifferenceColor,
                    

                  }
            );
          } else {
            const numericalIdealTime = extractNumericalValue(kpi.ideal_time);
            const timeDifference = numericalIdealTime - kpi.value;
            const formattedTimeDifference = getFormattedTime(timeDifference);
            const timeDifferenceColor = timeDifference >= 0 ? 'green' : 'red';


            dKpis.push(
              compare
                ? {
                    ...kpi,
                    "value user1": `${getFormattedTime(kpi.value)}`,
                    "value user2": `${getFormattedTime(
                      kpis2[index]?.value !== undefined ? kpis2[index].value : 0
                    )}`,
                    ideal_time: kpi?.ideal_time,
                    time_difference: timeDifferenceFormatted,
                    time_difference_color: timeDifferenceColor,
                  }
                : {
                    ...kpi,
                    ideal_time: kpi?.ideal_time,
                    "Time taken by user": `${getFormattedTime(kpi.value)}`,
                    time_difference: timeDifferenceFormatted,
                    time_difference_color: timeDifferenceColor,

                  }
            );
          }
          break;
        case "boolean":
          bKpis.push(
            compare
              ? {
                  ...kpi,
                  value: kpi.value ? "True" : "False",
                  "value user1": kpi.value ? "True" : "False",
                  "value user2": kpis2[index].value ? "True" : "False"
                }
              : {
                  ...kpi,
                  value: kpi.value ? "True" : "False"
                }
          );
          break;
        default:
          sKpis.push(
            compare
              ? {
                  ...kpi,
                  value: kpi.value + " " + kpi?.unit,
                  "value user1": kpi.value + " " + kpi?.unit,
                  "value user2": kpis2[index].value + " " + kpi?.unit
                }
              : {
                  ...kpi,
                  value: kpi.value + " " + kpi?.unit
                }
          );
          break;
      }
    });
    setBooleanKpis(bKpis);
    setDecimalKpis(dKpis);
    setStringKpis(sKpis);
    setRangeKpis(rKpis);
  }, [kpis1, kpis2]);

  return (
    <div className="my-4">
      <div className="font-bold text-dark py-2">KPIS</div>
      <div className="">
        <div className="flex flex-col md:flex-row gap-4">
          {booleanKpis && booleanKpis.length > 0 && (

            <CustomTable
              columns={
                compare && kpis2
                  ? ["name", "value user1", "value user2"]
                  : ["name", "value"]
              }
              rows={booleanKpis.map(row => ({ ...row, className: "table-row-hover" }))}
              columnsma
            />

          )}
          {stringKpis && stringKpis.length > 0 && (

            <CustomTable
              columns={
                compare && kpis2
                  ? ["name", "value user1", "value user2"]
                  : ["name", "value"]
              }
              rows={stringKpis.map(row => ({ ...row, className: "table-row-hover" }))}
              />
          )}
        </div>

        <div className="w-full flex flex-col gap-4">
          {/* Decimal valued kpis */}
          {decimalKpis.length > 0 && (

            <div>
              <CustomTable
                columns={
                  compare && kpis2
                    ? ["name", "value user1", "value user2", hasIdealTime ? "time_difference" : null, hasIdealTime ? "ideal_time" : null, hasSpeed ? "speed" : null].filter(Boolean)
                    : ["name", "Time taken by user", hasIdealTime ? "time_difference" : null, hasIdealTime ? "ideal_time" : null, hasSpeed ? "speed" : null].filter(Boolean)
                }
                rows={decimalKpis.map(row => ({ ...row, className: "table-row-hover" }))}
                colorField="time_difference_color" // Pass the color field to CustomTable

              />
              </div>
          )}
          {rangeKpis.length > 0 && (


            <CustomTable
            columns={
              compare && kpis2
                ? ["name", "Time taken by user 1", "Time taken by user 2", hasIdealTime ? "time_difference_user1" : null, hasIdealTime ? "time_difference_user2" : null, hasIdealTime ? "Ideal time" : null, hasSpeed ? "speed" : null].filter(Boolean)
                : ["name", "Time taken by user", hasIdealTime ? "time_difference" : null, hasIdealTime ? "Ideal time" : null, hasSpeed ? "speed" : null].filter(Boolean)
            }
            rows={rangeKpis.map(row => ({ ...row, className: "table-row-hover" }))}
            />
          )}
        </div>
        {rangeKpis.length > 0 && (
          <div className="border">
           <RangeBarChart
            rangeData={rangeKpis}
            compare={compare}
            showIdealTime={hasIdealTime}
            title="KPI with respect to its values and its ideal range"
            extractNumericalValue={extractNumericalValue}

          />
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiReport;