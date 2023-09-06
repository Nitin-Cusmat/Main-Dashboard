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

  useEffect(() => {
    let bKpis = [];
    let dKpis = [];
    let sKpis = [];
    let rKpis = [];
    kpis1.forEach((kpi, index) => {
      switch (kpi.type) {
        case "number":
          if (kpi.range) {
            const min = kpi.range.min ? kpi.range.min : 0;
            let max = kpi.range.max;
            max = Math.ceil(max);

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
                      (kpis2[index].unit ? " " + kpis2[index].unit : "")
                  }
                : {
                    ...kpi,
                    "Time taken by user":
                      getFormattedTime(kpi.value) +
                      (kpi.unit ? " " + kpi.unit : ""),
                    decimalValue: kpi.value,
                    range: [min, max],
                    "Ideal time": kpi?.ideal_time,
                    "ideal range": kpi.range.min + "-" + kpi.range.max
                  }
            );
          } else {
            dKpis.push(
              compare
                ? {
                    ...kpi,
                    "value user1": `${getFormattedTime(kpi.value)}`,
                    "value user2": `${getFormattedTime(
                      kpis2[index]?.value !== undefined ? kpis2[index].value : 0
                    )}`,
                    ideal_time: kpi?.ideal_time
                  }
                : {
                    ...kpi,
                    ideal_time: kpi?.ideal_time,
                    value_unit: `${getFormattedTime(kpi.value)}`
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
              rows={booleanKpis}
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
              rows={stringKpis}
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
                    ? [
                        "name",
                        "value user1",
                        "value user2",
                        kpis1.every(kpi => kpi.ideal_time !== undefined)
                          ? "ideal_time"
                          : null
                      ]
                    : [
                        "name",
                        "value_unit",
                        kpis1.every(kpi => kpi.ideal_time !== undefined)
                          ? "ideal_time"
                          : null
                      ]
                }
                rows={decimalKpis}
                columnsMap={{
                  name: "Name",
                  value_unit: "Time taken by user",
                  "value user1": "Time taken by user 1",
                  "value user2": "Time taken by user 2",
                  ideal_time: "Ideal time"
                }}
              />
              {/* <div className="border">
                <div className=" p-5 text-dark text-sm md:text-md lg:text-lg">
                  Time Taken by KPIS
                </div>
                <div className=" w-full h-full flex justify-center max-h-[500px]">
                  <Doughnut
                    options={{
                      plugins: {
                        legend: {
                          display: true,
                          position: "bottom",
                          labels: {
                            usePointStyle: true,
                            pointStyle: "circle"
                          }
                        },
                        datalabels: { display: true }
                      }
                    }}
                    data={{
                      labels: decimalKpis ? decimalKpis.map(k => k.name) : [],
                      datasets: compare
                        ? [
                            {
                              label: "User 1",
                              data: decimalKpis.map(k =>
                                parseFloat(k["value user1"])
                              ),
                              backgroundColor: Object.values(CHART_COLORS),
                              hoverOffset: 4
                            },
                            {
                              label: "User 2",
                              data: decimalKpis.map(k =>
                                parseFloat(k["value user2"])
                              ),
                              backgroundColor: Object.values(CHART_COLORS),
                              hoverOffset: 4
                            }
                          ]
                        : [
                            {
                              data: decimalKpis.map(k => parseFloat(k.value)),

                              backgroundColor: Object.values(CHART_COLORS),
                              hoverOffset: 4
                            }
                          ]
                    }}
                  />
                </div>
              </div> */}
            </div>
          )}
          {rangeKpis.length > 0 && (
            <CustomTable
              columns={
                compare && kpis2
                  ? [
                      "name",
                      "Time taken by user 1",
                      "Time taken by user 2",
                      rangeKpis.every(kpi => kpi.ideal_time !== undefined)
                        ? "Ideal time"
                        : null
                    ]
                  : [
                      "name",
                      "Time taken by user",
                      rangeKpis.every(kpi => kpi.ideal_time !== undefined)
                        ? "Ideal time"
                        : null
                    ]
              }
              rows={rangeKpis}
            />
          )}
        </div>
        {rangeKpis.length > 0 && (
          <div className="border">
            <RangeBarChart
              rangeData={rangeKpis}
              compare={compare}
              title="KPI with respect to its values and its ideal range"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiReport;
