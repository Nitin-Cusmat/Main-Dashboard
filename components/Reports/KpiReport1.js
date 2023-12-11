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

const KpiReport1 = ({ kpitask1, kpitask2, compare, module, organization }) => {

  const pulseAnimation = `@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }`;

  const generateInsights = () => {
    const insightsHtml = rangeKpis.map(kpi => {
      const actualTime = extractNumericalValue(kpi.value);
      const idealTime = extractNumericalValue(kpi.ideal_time);
      const color = actualTime <= idealTime ? 'green' : 'red';
      return `<span style="color: ${color};">${kpi.name}: ${actualTime <= idealTime ? 'Completed within the ideal time.' : 'Took longer than the ideal time.'}</span><br/>`;
    }).join('');
    return { __html: insightsHtml };
  }; 

  const [isModalOpen, setModalOpen] = useState(false);
  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button onClick={onClose} className="text-red-500 hover:text-red-700 text-2xl">
              &times; {/* Unicode for 'X' symbol */}
            </button>
          </div>
          <div className="modal-body">{children}</div>
          <div className="mt-4 flex justify-end">
            <button onClick={onClose} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-110">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const [booleanKpis, setBooleanKpis] = useState([]);
  const [decimalKpis, setDecimalKpis] = useState([]);
  const [stringKpis, setStringKpis] = useState([]);
  const [rangeKpis, setRangeKpis] = useState([]);

  const hasIdealTime = kpitask1.some(kpi => kpi.ideal_time !== undefined);
  const hasSpeed = kpitask1.some(kpi => kpi.speed !== undefined);
  const extractNumericalValue = (valueWithUnit) => {
    if (typeof valueWithUnit === 'number') return valueWithUnit;
    if (typeof valueWithUnit === 'string' && !isNaN(valueWithUnit)) return parseFloat(valueWithUnit);
    if (typeof valueWithUnit === 'string') {
      const matchedValue = valueWithUnit.match(/\d+(\.\d+)?/);
      return matchedValue ? parseFloat(matchedValue[0]) : 0;
    }
    
    return 0;
  };
  const replaceRightWithIcon = (answer) => {
    if (typeof answer !== "string") {
        // Handle the unexpected case where the answer is not a string.
        // This could be a console log, a default value, or some other handling.
        // console.warn("Unexpected non-string value:", answer);
        return answer;  // Return the original value, or you can set a default value.
    }
    return answer.replace(/right/gi, '✅').replace(/wrong/gi, '❌'); 
};

const isApollo = organization && organization.name.toLowerCase() === "vctpl";
const kpiTitle = isApollo ? "Loading KPI" : "KPIS";



  useEffect(() => {
    let bKpis = [];
    let dKpis = [];
    let sKpis = [];
    let rKpis = [];
    kpitask1.forEach((kpi, index) => {
      const idealTimeNumerical = extractNumericalValue(kpi.ideal_time);
  const user1Value = extractNumericalValue(kpi.value);
  let timeDifferenceFormatted, timeDifferenceColor;
  let timeDifference2Formatted = "";  // Initialize with default value
  let timeDifference2Color = "";    

  let idealTimeFormatted = kpi.ideal_time; // Assume kpi.ideal_time is a string like "120 sec"
  if (kpi.ideal_time !== undefined) {
    const idealTimeInSeconds = extractNumericalValue(kpi.ideal_time);
    if (idealTimeInSeconds >= 60) {
      const minutes = Math.floor(idealTimeInSeconds / 60);
      const seconds = idealTimeInSeconds % 60;
      idealTimeFormatted = `${minutes} min${seconds > 0 ? ` ${seconds.toFixed(2)} sec` : ''}`;
    }
  }
  

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



      
  if (compare && kpitask2 && kpitask2.length > index && kpitask2[index].value && kpitask2[index].ideal_time !== undefined) {
    const user2Value = extractNumericalValue(kpitask2[index].value);
        const timeDifference2 = user2Value - idealTimeNumerical;
    
        if (timeDifference2 > 0) {
            timeDifference2Color = 'red';
            timeDifference2Formatted = "+" + getFormattedTime(timeDifference2);
        } else {
            timeDifference2Color = 'green';
            timeDifference2Formatted = getFormattedTime(timeDifference2);
        }
    }
      
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
                    "Ideal time": idealTimeFormatted,
                    "Spotting attempts by user 1": kpi.Spotting_attempt, // Add this line
                    "Collision by user 1": kpi.collision, // And this line
                    "Spotting attempts by user 2": kpitask2[index].Spotting_attempt, // Add this line
                    "Collision by user 2": kpitask2[index].collision,// And this line
                    "ideal range": kpi.range.min + "-" + kpi.range.max,
                    "Time taken by user 1":
                      getFormattedTime(kpi.value) +
                      (kpi.unit ? " " + kpi.unit : ""),
                    "Time taken by user 2":
                      getFormattedTime(kpitask2[index].value) +
                      " " +
                      (kpitask2[index].unit ? " " + kpitask2[index].unit : ""),
                      time_difference_user1: timeDifferenceFormatted,
                      time_difference_color_user1: timeDifferenceColor,
                      time_difference_user2: timeDifference2Formatted,
                      time_difference_color_user2: timeDifference2Color
      
                  }
                : {
                    ...kpi,

                    "Time taken by user":
                      getFormattedTime(kpi.value) +
                      (kpi.unit ? " " + kpi.unit : ""),
                    decimalValue: kpi.value,
                    range: [min, max],
                    "Ideal time": idealTimeFormatted,
                    "Spotting attempts by user": kpi.Spotting_attempt, // Add this line
                    "Collision by user": kpi.collision, // And this line
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
                    "Assessment Question with correct checklist": kpi.question,  // Assuming the data is in kpi.question
                    "Answer user1": replaceRightWithIcon(kpi.answer),  // Assuming the answer data is in kpi.answer for user1
                    "Answer user2": replaceRightWithIcon(kpitask2[index].answer),
                    "checklist selected by user1": replaceRightWithIcon(kpi.checklist),  // Use replaceWithEmojis for checklist
                    "checklist selected by user2": replaceRightWithIcon(kpitask2[index].checklist),  // And here for user2's checklist
                    "Time taken by user 1": `${getFormattedTime(kpi.value)}`,
                    "Time taken by user 2": `${getFormattedTime(kpitask2[index].value)}`,

                    "value user2": `${getFormattedTime(
                      kpitask2[index]?.value !== undefined ? kpitask2[index].value : 0
                    )}`,
                    ideal_time: kpi?.ideal_time,
                    time_difference_user1: timeDifferenceFormatted,
                      time_difference_color_user1: timeDifferenceColor,
                      time_difference_user2: timeDifference2Formatted,
                      time_difference_color_user2: timeDifference2Color
                  }
                : {
                    ...kpi,
                    "Assessment Question with correct checklist": kpi.question,  // Assuming the data is in kpi.question
                    "Answer": replaceRightWithIcon(kpi.answer),  // Assuming the answer data is in kpi.answer
                    "checklist selected by user": replaceRightWithIcon(kpi.checklist), // Assuming the checklist data is in kpi.checklist
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
                  "value user2": kpitask2[index].value ? "True" : "False"
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
                  "value user2": kpitask2[index].value + " " + kpi?.unit
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
  }, [kpitask1, kpitask2]);

   return (
    <div className="w-full">
            <style>{pulseAnimation}</style>

      <div className="py-3">
        <div className="bg-gradient-to-r from-green-200 via-blue-100 to-purple-200 rounded-t-lg shadow p-3 border-b-2 border-blue-300">
          <div className="flex items-center justify-between text-blue-800">
            <span className="icon text-2xl">📊</span>{" "}
            {/* Replace with an actual icon if possible */}
            <h2 className="text-xl md:text-2xl font-semibold">
              {kpiTitle} - Insights and Analytics
            </h2>
            <button onClick={handleOpenModal} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center" style={{ animation: 'pulse 2s infinite' }}>
              <span className="mr-2">🔍</span>
              Click here for Insights
            </button>            
            <div className="flex items-center">
              <span className="icon text-xl mr-2">🔍</span>{" "}
              {/* Replace with an actual icon if possible */}
              <span className="icon text-xl">📈</span>{" "}
              {/* Replace with an actual icon if possible */}
            </div>
          </div>
        </div>
          {/* The modal component */}
     {/* The modal component */}
     {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="KPI Insights">
          <div dangerouslySetInnerHTML={generateInsights()} />
        </Modal>
      )}
      </div>

      <div className="">
        <div className="flex flex-col md:flex-row gap-4">
          {booleanKpis && booleanKpis.length > 0 && (

            <CustomTable
              columns={
                compare && kpitask2
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
                compare && kpitask2
                  ? ["name", "value user1", "value user2"]
                  : ["name", "value"]
              }
              rows={stringKpis.map(row => ({ ...row, className: "table-row-hover" }))}
              colorField="time_difference_color"  // Specify the color field here

              />
          )}
        </div>

        <div className="w-full flex flex-col gap-4">
          {/* Decimal valued kpis */}
          {decimalKpis.length > 0 && (

            <div>
              <CustomTable
               columns={
                compare && kpitask2
                  ? [
                    kpitask1.some(kpi => kpi.question) ? "Assessment Question with correct checklist" : null,
                    kpitask1.some(kpi => kpi.answer) ? "Answer user1" : null,
                    kpitask2.some(kpi => kpi.answer) ? "Answer user2" : null,
                      kpitask1.some(kpi => kpi.checklist) ? "checklist selected by user1" : null,
                      kpitask2.some(kpi => kpi.checklist) ? "checklist selected by user2" : null,
                      kpitask1.some(kpi => kpi.name) ? "name" : null,
                      kpitask1.some(kpi => kpi.value) ? "Time taken by user 1" : null,
                      kpitask2.some(kpi => kpi.value) ? "Time taken by user 2" : null,
                      kpitask1.some(kpi => kpi.Spotting_attempt) ? "Spotting attempts by user 1" : null,
                      kpitask2.some(kpi => kpi.Spotting_attempt) ? "Spotting attempts by user 2" : null,
                      kpitask1.some(kpi => kpi.collision) ? "Collision by user 1" : null,
                      kpitask2.some(kpi => kpi.collision) ? "Collision by user 2" : null,
                      hasIdealTime ? "time_difference_user1" : null,
                      hasIdealTime ? "time_difference_user2" : null,
                      hasIdealTime ? "Ideal time" : null,
                      hasSpeed ? "speed" : null
                    ].filter(Boolean)
                  : [
                    kpitask1.some(kpi => kpi.question) ? "Assessment Question with correct checklist" : null,
                    kpitask1.some(kpi => kpi.answer) ? "Answer" : null,
                    kpitask1.some(kpi => kpi.checklist) ? "checklist selected by user" : null,
                    kpitask1.some(kpi => kpi.name) ? "name" : null,
                    kpitask1.some(kpi => kpi.value) ? "Time taken by user" : null,
                    kpitask1.some(kpi => kpi.Spotting_attempt) ? "Spotting attempts by user" : null,
                    kpitask1.some(kpi => kpi.collision) ? "Collision by user" : null,
                      hasIdealTime ? "time_difference" : null,
                      hasIdealTime ? "Ideal time" : null,
                      hasSpeed ? "speed" : null
                    ].filter(Boolean)
              }
                rows={decimalKpis.map(row => ({ ...row, className: "table-row-hover" }))}
                colorField="time_difference_color" // Pass the color field to CustomTable
                

              />
              </div>
              
          )}
          {rangeKpis.length > 0 && (


            <CustomTable
            columns={
              compare && kpitask2
                ? ["name", "Time taken by user 1", "Time taken by user 2", hasIdealTime ? "time_difference_user1" : null, hasIdealTime ? "time_difference_user2" : null, hasIdealTime ? "Ideal time" : null, kpitask1.some(kpi => kpi.Spotting_attempt) ? "Spotting attempts by user 1" : null,
                kpitask2.some(kpi => kpi.Spotting_attempt) ? "Spotting attempts by user 2" : null,kpitask1.some(kpi => kpi.collision) ? "Collision by user 1" : null,
                kpitask2.some(kpi => kpi.collision) ? "Collision by user 2" : null,hasSpeed ? "speed" : null].filter(Boolean)
                
                : ["name", "Time taken by user", hasIdealTime ? "time_difference" : null, hasIdealTime ? "Ideal time" : null, kpitask1.some(kpi => kpi.Spotting_attempt) ? "Spotting attempts by user" : null,
                kpitask1.some(kpi => kpi.collision) ? "Collision by user" : null , hasSpeed ? "speed" : null].filter(Boolean)
            }
            rows={rangeKpis.map(row => ({ ...row, className: "table-row-hover" }))}
            colorField="time_difference_color"  // Specify the color field here
            

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



export default KpiReport1;