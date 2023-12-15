import React from "react";
import ReactECharts from "echarts-for-react";
import Chart from "react-apexcharts";
import * as echarts from "echarts";

const VCTPL = ({ attemptData, attemptData2, compare = false }) => {
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [insightText, setInsightText] = React.useState("");

  let timeData = [];
  let speedData = [];

  let timeDataAngle = [];
  let angleData = [];
  let speedDataunloading = [];
  let angleDataunloading = [];
  let timeDataunloading = [];
  let timeData2 = [];
  let speedData2 = [];
  let angleData2 = [];
  let speedDataUnloading2 = [];
  let angleDataUnloading2 = [];
  let timeDataUnloading2 = [];

  // Extract data for attemptData2 if compare is true
  if (compare && attemptData2 && attemptData2.graphs) {
    // Extract graph data for attemptData2 in a similar manner as attemptData
    const hoistTravelGraph2 = attemptData2.graphs.find(
      graph => graph.name === "Speed of hoist travelup to highlighted zone while loading"
    );
    const hoistTravelGraphAngle2 = attemptData2.graphs.find(
      graph => graph.name === "Swing angle of hoist travelup to highlighted zone while loading"
    );
    const hoistTravelGraphSpeedUnloading2 = attemptData2.graphs.find(
      graph => graph.name === "Speed of hoist travelup to highlighted zone while stacking"
    );
    const hoistTravelGraphAngleUnloading2 = attemptData2.graphs.find(
      graph => graph.name === "Swing angle of hoist travelup to highlighted zone while stacking"
    );

    // Assuming each graph has a similar structure with `data` containing objects with x and y properties
    timeData2 = hoistTravelGraph2.data.map(point => point.x);
    speedData2 = hoistTravelGraph2.data.map(point => point.y);
    angleData2 = hoistTravelGraphAngle2.data.map(point => point.y);
    speedDataUnloading2 = hoistTravelGraphSpeedUnloading2.data.map(point => point.y);
    angleDataUnloading2 = hoistTravelGraphAngleUnloading2.data.map(point => point.y);
    timeDataUnloading2 = hoistTravelGraphSpeedUnloading2.data.map(point => point.x);
  }

  // Find the specific graph data
  const hoistTravelGraph =
    attemptData && attemptData.graphs
      ? attemptData.graphs.find(
        graph =>
          graph.name ===
          "Speed of hoist travelup to highlighted zone while loading"
      )
      : null;

  const hoistTravelGraphangle =
    attemptData && attemptData.graphs
      ? attemptData.graphs.find(
        graph =>
          graph.name === "Swing angle of hoist travelup to highlighted zone while loading"
      )
      : null;

  const hoistTravelGraphspeedunloading =
    attemptData && attemptData.graphs
      ? attemptData.graphs.find(
        graph =>
          graph.name ===
          "Speed of hoist travelup to highlighted zone while stacking"
      )
      : null;

  const hoistTravelGraphangleunloading =
    attemptData && attemptData.graphs
      ? attemptData.graphs.find(
        graph =>
          graph.name === "Swing angle of hoist travelup to highlighted zone while stacking"
      )
      : null;

  if (
    !hoistTravelGraph ||
    !hoistTravelGraphangle ||
    !hoistTravelGraphspeedunloading ||
    !hoistTravelGraphangleunloading
  ) {
    return <div>No Hoist Travel Graph Data Available</div>;
  }

  timeData = hoistTravelGraph.data.map(point => point.x);
  speedData = hoistTravelGraph.data.map(point => point.y);

  speedDataunloading = hoistTravelGraphspeedunloading.data.map(
    point => point.y
  );
  angleDataunloading = hoistTravelGraphangleunloading.data.map(
    point => point.y
  );
  timeDataunloading = hoistTravelGraphspeedunloading.data.map(point => point.x);

  const speedLineColor = "#1a6cc9"; // Color for the speed line
  const angleLineColor = "#78c481"; // Color for the angle line

  timeDataAngle = hoistTravelGraphangle.data.map(point => point.x);
  angleData = hoistTravelGraphangle.data.map(point => point.y);

  let pieChartData = [];
  let pieChartLabels = [];

  const highSpeedThreshold = 10; // High speed threshold
  const highAngleThreshold = 4; // High angle threshold

  let instabilityInstances = [];

  speedData.forEach((speed, index) => {
    const angle = angleData[index];
    if (speed > highSpeedThreshold && angle > highAngleThreshold) {
      instabilityInstances.push({ time: index, speed, angle });
    }
  });

  const InsightButton = ({ onClick }) => (
    <button
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        zIndex: 10,
        backgroundColor: " rgb(59 130 246)", // Light green background
        color: "white", // White text
        border: "none",
        borderRadius: "5px", // Rounded corners
        padding: "10px 15px",
        cursor: "pointer",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)", // More pronounced shadow for depth
        fontSize: "15px", // Slightly larger font size
        fontWeight: "bold", // Bold font weight
        display: "flex", // Flex display to align icon and text
        alignItems: "center", // Center items vertically
        justifyContent: "center", // Center items horizontally
        transition: "background-color 0.3s ease" // Smooth transition for hover effect
      }}
      onClick={onClick}
      onMouseOver={e => (e.target.style.backgroundColor = " rgb(59 130 246)")} // Darker green on hover
      onMouseOut={e => (e.target.style.backgroundColor = " rgb(59 130 246)")} // Back to light green
    >
      <span style={{ paddingRight: "5px", fontSize: "16px" }}>🔍</span>
      Click here for Insights
    </button>
  );

  const handleInsightClick = () => {
    const highSpeedThreshold = 5;
    const highAngleThreshold = 4;
    let hasInstability = false;

    for (let i = 0; i < speedDataunloading.length; i++) {
      if (
        speedDataunloading[i] > highSpeedThreshold &&
        angleDataunloading[i] > highAngleThreshold
      ) {
        hasInstability = true;
        break;
      }
    }

    if (hasInstability) {
      setInsightText(
        "When the speed increases, the swing angle also tends to increase. This could indicate that higher operational speeds lead to greater instability."
      );
    } else {
      setInsightText(
        "No significant correlation between high speed and swing angle was observed."
      );
    }

    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const Modal = ({ onClose, children }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
        <div className="modal-header flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Graph Insights
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 text-2xl"
          >
            &times; {/* Unicode for 'X' symbol */}
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // Find the pie chart in the attemptData.graphs array
  const pieChart =
    attemptData &&
    attemptData.graphs &&
    attemptData.graphs.find(graph => graph.type === "pie");

  if (pieChart) {
    // Convert data strings to numbers and use labels from the pie chart
    pieChartData = pieChart.data.map(value => parseFloat(value));
    pieChartLabels = pieChart.labels;
  }

  //   const vehicleChartOptions = {
  //     // acc and break graph
  //     title: {
  //       text: "RTGC Analytics",
  //       subtext: "Speed vs Angle with respect to time while loading graph",
  //       left: "center"
  //     },
  //     tooltip: {
  //       trigger: "axis",
  //       formatter: function (params) {
  //         // Assuming the first series in the params array corresponds to the time axis label
  //         let timeValue = params[0].axisValueLabel; // Or params[0].axisValue if axisValueLabel is not available
  //         let result = `Time: ${timeValue} (sec)`; // Prepend 'Time: ' to the axis value (time)

  //         // Append other series data
  //         params.forEach(param => {
  //           result += `<br/>${param.marker}${param.seriesName}: ${param.value}`;
  //         });

  //         return result;
  //       },
  //       axisPointer: {
  //         animation: false
  //       },
  //       backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent black for readability
  //       borderColor: "#777",
  //       borderWidth: 1,
  //       textStyle: {
  //         color: "#fff"
  //       },
  //       padding: 10
  //     },
  //     legend: {
  //       data: ["Speed m/s", "Swing Angle"],
  //       left: 10
  //     },
  //     toolbox: {
  //       feature: {
  //         dataZoom: {
  //           yAxisIndex: "none"
  //         },
  //         restore: {},
  //         saveAsImage: {}
  //       }
  //     },
  //     axisPointer: {
  //       link: { xAxisIndex: "all" }
  //     },
  //     dataZoom: [
  //       {
  //         show: true,
  //         realtime: true,
  //         xAxisIndex: [0, 1]
  //       },
  //       {
  //         type: "inside",
  //         realtime: true,
  //         xAxisIndex: [0, 1]
  //       }
  //     ],
  //     grid: [
  //       {
  //         left: 50,
  //         right: 50,
  //         height: "33%"
  //       },
  //       {
  //         left: 50,
  //         right: 50,
  //         top: "55%",
  //         height: "33%"
  //       }
  //     ],
  //     xAxis: [
  //       {
  //         type: "category",
  //         boundaryGap: false,
  //         axisLine: { onZero: true },
  //         data: timeDataAngle
  //       },
  //       {
  //         gridIndex: 1,
  //         type: "category",
  //         boundaryGap: false,
  //         axisLine: { onZero: true },
  //         data: timeDataAngle,
  //         position: "top"
  //       }
  //     ],
  //     yAxis: [
  //       {
  //         name: "Speed m/s",
  //         type: "value",
  //         data: speedData
  //       },
  //       {
  //         gridIndex: 1,
  //         name: "Swing Angle",
  //         type: "value",
  //         inverse: true,
  //         nameLocation: "middle", // Place the name in the middle of the axis
  //         nameGap: 35
  //       }
  //     ],
  //     series: [
  //       {
  //         name: "Speed m/s",
  //         type: "line",
  //         symbolSize: 8,
  //         hoverAnimation: false,
  //         areaStyle: {
  //           // Adding area style for a filled look under the line
  //           normal: {
  //             color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
  //               {
  //                 offset: 0,
  //                 color: "#EDF1F4"
  //               },
  //               {
  //                 offset: 1,
  //                 color: "#EDF1F4"
  //               }
  //             ])
  //           }
  //         },
  //         data: speedData
  //       },
  //       {
  //         name: "Swing Angle",
  //         type: "line",
  //         xAxisIndex: 1,
  //         yAxisIndex: 1,
  //         symbolSize: 8,
  //         hoverAnimation: false,
  //         areaStyle: {
  //           // Adding area style for a filled look under the line
  //           normal: {
  //             color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
  //               {
  //                 offset: 0,
  //                 color: "#EDF1F4"
  //               },
  //               {
  //                 offset: 1,
  //                 color: "#EDF1F4"
  //               }
  //             ])
  //           }
  //         },
  //         data: angleData
  //       }
  //     ]
  //   };

  //   const vehicleChartOptions1 = {
  //     // acc and break graph
  //     title: {
  //       text: "RTGC Analytics",
  //       subtext: "Speed vs Angle with respect to time while Stacking graph",
  //       left: "center"
  //     },
  //     tooltip: {
  //       trigger: "axis",
  //       formatter: function (params) {
  //         // Assuming the first series in the params array corresponds to the time axis label
  //         let timeValue = params[0].axisValueLabel; // Or params[0].axisValue if axisValueLabel is not available
  //         let result = `Time: ${timeValue}`; // Prepend 'Time: ' to the axis value (time)

  //         // Append other series data
  //         params.forEach(param => {
  //           result += `<br/>${param.marker}${param.seriesName}: ${param.value}`;
  //         });

  //         return result;
  //       },
  //       axisPointer: {
  //         animation: false
  //       },
  //       backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent black for readability
  //       borderColor: "#777",
  //       borderWidth: 1,
  //       textStyle: {
  //         color: "#fff"
  //       },
  //       padding: 10
  //     },
  //     legend: {
  //       data: ["Speed", "Swing Angle"],
  //       left: 10
  //     },
  //     toolbox: {
  //       feature: {
  //         dataZoom: {
  //           yAxisIndex: "none"
  //         },
  //         restore: {},
  //         saveAsImage: {}
  //       }
  //     },
  //     axisPointer: {
  //       link: { xAxisIndex: "all" }
  //     },
  //     dataZoom: [
  //       {
  //         show: true,
  //         realtime: true,
  //         xAxisIndex: [0, 1]
  //       },
  //       {
  //         type: "inside",
  //         realtime: true,
  //         xAxisIndex: [0, 1]
  //       }
  //     ],
  //     grid: [
  //       {
  //         left: 50,
  //         right: 50,
  //         height: "33%"
  //       },
  //       {
  //         left: 50,
  //         right: 50,
  //         top: "55%",
  //         height: "33%"
  //       }
  //     ],
  //     xAxis: [
  //       {
  //         type: "category",
  //         boundaryGap: false,
  //         axisLine: { onZero: true },
  //         data: timeDataunloading
  //       },
  //       {
  //         gridIndex: 1,
  //         type: "category",
  //         boundaryGap: false,
  //         axisLine: { onZero: true },
  //         data: timeDataunloading,
  //         position: "top"
  //       }
  //     ],
  //     yAxis: [
  //       {
  //         name: "Speed",
  //         type: "value",
  //         data: hoistTravelGraphspeedunloading
  //       },
  //       {
  //         gridIndex: 1,
  //         name: "Swing Angle",
  //         type: "value",
  //         inverse: true,
  //         nameLocation: "middle", // Place the name in the middle of the axis
  //         nameGap: 35
  //       }
  //     ],
  //     series: [
  //       {
  //         name: "Speed",
  //         type: "line",
  //         symbolSize: 8,
  //         hoverAnimation: false,
  //         areaStyle: {
  //           // Adding area style for a filled look under the line
  //           normal: {
  //             color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
  //               {
  //                 offset: 0,
  //                 color: "#EDF1F4"
  //               },
  //               {
  //                 offset: 1,
  //                 color: "#EDF1F4"
  //               }
  //             ])
  //           }
  //         },
  //         data: speedDataunloading
  //       },
  //       {
  //         name: "Swing Angle",
  //         type: "line",
  //         xAxisIndex: 1,
  //         yAxisIndex: 1,
  //         symbolSize: 8,
  //         hoverAnimation: false,
  //         areaStyle: {
  //           // Adding area style for a filled look under the line
  //           normal: {
  //             color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
  //               {
  //                 offset: 0,
  //                 color: "#EDF1F4"
  //               },
  //               {
  //                 offset: 1,
  //                 color: "#EDF1F4"
  //               }
  //             ])
  //           }
  //         },
  //         data: angleDataunloading
  //       }
  //     ]
  //   };

  const option = {
    // option for two lines chart dumping and loading area

    // Make gradient line here
    // visualMap: [{
    //     show: false,
    //     type: 'continuous',
    //     seriesIndex: 0,
    //     min: 0,
    //     max: 400
    // }, {
    //     show: false,
    //     type: 'continuous',
    //     seriesIndex: 1,
    //     dimension: 0,
    //     min: 0,
    //     max: timeDataAngle.length - 1
    // }],

    title: [
      {
        left: "center",
        text: compare ? "Loading Performance Analysis - User 1" : "Loading Performance Analysis",
        subtext: "Swing and Speed Metrics Over Time",
        textStyle: {
          color: "#34568B", // A sophisticated deep blue
          fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 18,
          fontStyle: "normal",
          fontWeight: "600" // Semi-bold
        },
        subtextStyle: {
          color: "#6B7280", // Dark gray for subtle contrast
          fontSize: 14,
          fontStyle: "italic"
        },
        backgroundColor: "#E3F2FD", // Light blue background
        borderColor: "#90CAF9", // Matching border color
        borderWidth: 1,
        borderRadius: 4, // Rounded corners for a modern look
        padding: [3, 15] // Top, Right, Bottom, Left padding for the title
      }
    ],
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        // Extract the x-axis value (time)
        let timeValue = params[0].axisValueLabel;

        // Find the corresponding speed and angle values based on the index
        let speedValue = speedData[params[0].dataIndex] || "N/A";
        let angleValue = angleData[params[0].dataIndex] || "N/A";
        let speedColorIcon = `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${speedLineColor};"></span>`;
        let angleColorIcon = `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${angleLineColor};"></span>`;
        return `Time: ${timeValue} Sec<br/>${speedColorIcon}Speed: ${speedValue} m/s<br/>${angleColorIcon}Swing Angle: ${angleValue}° `;
      },
      backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent black for readability
      borderColor: "#777",
      borderWidth: 1,
      textStyle: {
        color: "#fff"
      },
      padding: 10
    },

    xAxis: [
      {
        type: "category",
        boundaryGap: false,
        data: timeDataAngle,
        name: "Time (sec)", // Label for the X-axis
        nameLocation: "middle", // Location of the label
        nameGap: 30 // Gap b
      },
      {
        type: "category",
        boundaryGap: false,
        data: timeDataAngle,
        name: "Time (sec)", // Label for the X-axis
        nameLocation: "middle", // Location of the label
        nameGap: 30, // Gap b
        gridIndex: 1
      }
    ],
    yAxis: [
      {
        type: "value",
        name: "Speed (m/s)", // Label for the Y-axis
        nameLocation: "middle", // Location of the label
        nameGap: 50, //
        splitLine: { show: false }
      },
      {
        type: "value",
        name: "Swing (m/s)", // Label for the Y-axis
        nameLocation: "middle", // Location of the label
        nameGap: 50, //
        splitLine: { show: false },
        gridIndex: 1
      }
    ],
    grid: [
      {
        bottom: "60%"
      },
      {
        top: "60%"
      }
    ],
    series: [
      {
        type: "line",
        symbol: "none", // This hides the data point markers
        data: speedData,
        showSymbol: true,
        symbolSize: 4
      },
      {
        type: "line",
        showSymbol: false,
        data: angleData,
        xAxisIndex: 1,
        yAxisIndex: 1
      }
    ]
  };

  const optioncomp = compare ? {
    // option for two lines chart dumping and loading area

    // Make gradient line here
    // visualMap: [{
    //     show: false,
    //     type: 'continuous',
    //     seriesIndex: 0,
    //     min: 0,
    //     max: 400
    // }, {
    //     show: false,
    //     type: 'continuous',
    //     seriesIndex: 1,
    //     dimension: 0,
    //     min: 0,
    //     max: timeDataAngle.length - 1
    // }],

    title: [
      {
        left: "center",
        text: "Loading Performance Analysis - User 2",
        subtext: "Swing and Speed Metrics Over Time",
        textStyle: {
          color: "#34568B", // A sophisticated deep blue
          fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 18,
          fontStyle: "normal",
          fontWeight: "600" // Semi-bold
        },
        subtextStyle: {
          color: "#6B7280", // Dark gray for subtle contrast
          fontSize: 14,
          fontStyle: "italic"
        },
        backgroundColor: "#E3F2FD", // Light blue background
        borderColor: "#90CAF9", // Matching border color
        borderWidth: 1,
        borderRadius: 4, // Rounded corners for a modern look
        padding: [3, 15] // Top, Right, Bottom, Left padding for the title
      }
    ],
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        // Extract the x-axis value (time)
        let timeValue = params[0].axisValueLabel;

        // Find the corresponding speed and angle values based on the index
        let speedValue = speedData2[params[0].dataIndex] || "N/A";
        let angleValue = angleData2[params[0].dataIndex] || "N/A";
        let speedColorIcon = `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${speedLineColor};"></span>`;
        let angleColorIcon = `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${angleLineColor};"></span>`;
        return `Time: ${timeValue} Sec<br/>${speedColorIcon}Speed: ${speedValue} m/s<br/>${angleColorIcon}Swing Angle: ${angleValue}° `;
      },
      backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent black for readability
      borderColor: "#777",
      borderWidth: 1,
      textStyle: {
        color: "#fff"
      },
      padding: 10
    },

    xAxis: [
      {
        type: "category",
        boundaryGap: false,
        data: timeData2,
        name: "Time (sec)", // Label for the X-axis
        nameLocation: "middle", // Location of the label
        nameGap: 30,
        gridIndex: 0, // Gap b
      },
      {
        type: "category",
        boundaryGap: false,
        data: timeData2,
        name: "Time (sec)", // Label for the X-axis
        nameLocation: "middle", // Location of the label
        nameGap: 30, // Gap b
        gridIndex: 1
      }
    ],
    yAxis: [
      {
        type: "value",
        name: "Speed (m/s)", // Label for the Y-axis
        nameLocation: "middle", // Location of the label
        nameGap: 50, //
        splitLine: { show: false },
        gridIndex: 0,
      },
      {
        type: "value",
        name: "Swing (m/s)", // Label for the Y-axis
        nameLocation: "middle", // Location of the label
        nameGap: 50, //
        splitLine: { show: false },
        gridIndex: 1
      }
    ],
    grid: [
      {
        bottom: "60%"
      },
      {
        top: "60%"
      }
    ],
    series: [
      {
        type: "line",
        symbol: "none", // This hides the data point markers
        data: speedData2,
        showSymbol: true,
        symbolSize: 4,
        xAxisIndex: 0,
        yAxisIndex: 0,
      },
      {
        type: "line",
        showSymbol: false,
        data: angleData2,
        xAxisIndex: 1,
        yAxisIndex: 1,

      }
      // ... add more series if needed
    ]
    // ... other chart configurations
  } : null;



  const option1 = {    // this line of code is for stacking perfoamnce line chart
    // option for two lines chart dumping and loading area

    // Make gradient line here
    // visualMap: [{
    //     show: false,
    //     type: 'continuous',
    //     seriesIndex: 0,
    //     min: 0,
    //     max: 400
    // }, {
    //     show: false,
    //     type: 'continuous',
    //     seriesIndex: 1,
    //     dimension: 0,
    //     min: 0,
    //     max: timeDataunloading.length - 1
    // }],

    title: [
      {
        left: "center",
        text: compare ? "Stacking Performance Analysis - User 1" : "Stacking Performance Analysis",
        subtext: "Swing and Speed Metrics Over Time",
        textStyle: {
          color: "#34568B", // A sophisticated deep blue
          fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 18,
          fontStyle: "normal",
          fontWeight: "600" // Semi-bold
        },
        subtextStyle: {
          color: "#6B7280", // Dark gray for subtle contrast
          fontSize: 14,
          fontStyle: "italic"
        },
        backgroundColor: "#E3F2FD", // Light blue background
        borderColor: "#90CAF9", // Matching border color
        borderWidth: 1,
        borderRadius: 4, // Rounded corners for a modern look
        padding: [3, 15] // Top, Right, Bottom, Left padding for the title
      }
    ],

    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        // Extract the x-axis value (time)
        let timeValue = params[0].axisValueLabel;

        // Find the corresponding speed and angle values based on the index
        let speedValue = speedDataunloading[params[0].dataIndex] || "N/A";
        let angleValue = angleDataunloading[params[0].dataIndex] || "N/A";
        let speedColorIcon = `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${speedLineColor};"></span>`;
        let angleColorIcon = `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${angleLineColor};"></span>`;
        return `Time: ${timeValue} Sec<br/>${speedColorIcon}Speed: ${speedValue} m/s<br/>${angleColorIcon}Swing Angle: ${angleValue}° `;
      },
      backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent black for readability
      borderColor: "#777",
      borderWidth: 1,
      textStyle: {
        color: "#fff"
      },
      padding: 10
    },

    xAxis: [
      {
        type: "category",
        boundaryGap: false,
        data: timeDataunloading,
        name: "Time (sec)", // Label for the X-axis
        nameLocation: "middle", // Location of the label
        nameGap: 30 // Gap b
      },
      {
        type: "category",
        boundaryGap: false,
        data: timeDataunloading,
        name: "Time (sec)", // Label for the X-axis
        nameLocation: "middle", // Location of the label
        nameGap: 30, // Gap b
        gridIndex: 1
      }
    ],
    yAxis: [
      {
        type: "value",
        name: "Speed (m/s)", // Label for the Y-axis
        nameLocation: "middle", // Location of the label
        nameGap: 50, //
        splitLine: { show: false }
      },
      {
        type: "value",
        name: "Swing (angle)", // Label for the Y-axis
        nameLocation: "middle", // Location of the label
        nameGap: 50, //
        splitLine: { show: false },
        gridIndex: 1
      }
    ],
    grid: [
      {
        bottom: "60%"
      },
      {
        top: "60%"
      }
    ],
    series: [
      {
        type: "line",
        symbol: "none", // This hides the data point markers
        data: speedDataunloading,
        showSymbol: true,
        symbolSize: 4
      },
      {
        type: "line",
        showSymbol: false,
        data: angleDataunloading,
        xAxisIndex: 1,
        yAxisIndex: 1
      }
    ]
  };

  const option1comp = {
    // option for two lines chart dumping and loading area

    // Make gradient line here
    // visualMap: [{
    //     show: false,
    //     type: 'continuous',
    //     seriesIndex: 0,
    //     min: 0,
    //     max: 400
    // }, {
    //     show: false,
    //     type: 'continuous',
    //     seriesIndex: 1,
    //     dimension: 0,
    //     min: 0,
    //     max: timeDataunloading.length - 1
    // }],

    title: [
      {
        left: "center",
        text: "Stacking Performance Analysis - User 2",
        subtext: "Swing and Speed Metrics Over Time",
        textStyle: {
          color: "#34568B", // A sophisticated deep blue
          fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 18,
          fontStyle: "normal",
          fontWeight: "600" // Semi-bold
        },
        subtextStyle: {
          color: "#6B7280", // Dark gray for subtle contrast
          fontSize: 14,
          fontStyle: "italic"
        },
        backgroundColor: "#E3F2FD", // Light blue background
        borderColor: "#90CAF9", // Matching border color
        borderWidth: 1,
        borderRadius: 4, // Rounded corners for a modern look
        padding: [3, 15] // Top, Right, Bottom, Left padding for the title
      }
    ],

    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        // Extract the x-axis value (time)
        let timeValue = params[0].axisValueLabel;

        // Find the corresponding speed and angle values based on the index
        let speedValue = speedDataUnloading2[params[0].dataIndex] || "N/A";
        let angleValue = angleDataUnloading2[params[0].dataIndex] || "N/A";
        let speedColorIcon = `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${speedLineColor};"></span>`;
        let angleColorIcon = `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${angleLineColor};"></span>`;
        return `Time: ${timeValue} Sec<br/>${speedColorIcon}Speed: ${speedValue} m/s<br/>${angleColorIcon}Swing Angle: ${angleValue}° `;
      },
      backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent black for readability
      borderColor: "#777",
      borderWidth: 1,
      textStyle: {
        color: "#fff"
      },
      padding: 10
    },

    xAxis: [
      {
        type: "category",
        boundaryGap: false,
        data: timeDataUnloading2,
        name: "Time (sec)", // Label for the X-axis
        nameLocation: "middle", // Location of the label
        nameGap: 30 // Gap b
      },
      {
        type: "category",
        boundaryGap: false,
        data: timeDataUnloading2,
        name: "Time (sec)", // Label for the X-axis
        nameLocation: "middle", // Location of the label
        nameGap: 30, // Gap b
        gridIndex: 1
      }
    ],
    yAxis: [
      {
        type: "value",
        name: "Speed (m/s)", // Label for the Y-axis
        nameLocation: "middle", // Location of the label
        nameGap: 50, //
        splitLine: { show: false }
      },
      {
        type: "value",
        name: "Swing (angle)", // Label for the Y-axis
        nameLocation: "middle", // Location of the label
        nameGap: 50, //
        splitLine: { show: false },
        gridIndex: 1
      }
    ],
    grid: [
      {
        bottom: "60%"
      },
      {
        top: "60%"
      }
    ],
    series: [
      {
        type: "line",
        symbol: "none", // This hides the data point markers
        data: speedDataUnloading2,
        showSymbol: true,
        symbolSize: 4
      },
      {
        type: "line",
        showSymbol: false,
        data: angleDataUnloading2,
        xAxisIndex: 1,
        yAxisIndex: 1
      }
    ]
  };

  return (
    <>
      {/* this is for loading line chart of speed and swing for attemptdata1*/}
      <div style={{ position: "relative", height: "500px", margin: "30px 0" }}>
        <InsightButton onClick={handleInsightClick} />
        <ReactECharts
          style={{ height: "100%", width: "100%" }}
          option={option}
          notMerge={true}
          lazyUpdate={true}
        />
        {isModalOpen && (
          <Modal onClose={handleCloseModal}>
            <h2></h2>
            <p>{insightText}</p>
          </Modal>
        )}
      </div>

      {compare && (
        <>
          {/* this is for loading line chart of speed and swing for attemptdata2*/}
          <div style={{ position: "relative", height: "500px", margin: "30px 0" }}>
            <InsightButton onClick={handleInsightClick} />
            <ReactECharts
              style={{ height: "100%", width: "100%" }}
              option={optioncomp}  // Use the chart options for attemptData2 here
              notMerge={true}
              lazyUpdate={true}
            />
            {isModalOpen && (
              <Modal onClose={handleCloseModal}>
                <h2></h2>
                <p>{insightText}</p>
              </Modal>
            )}
          </div>
        </>
      )}
      {/* this is for stacking line chart of speed and swing for attemptdata1*/}

      <div style={{ position: "relative", height: "500px", margin: "30px 0" }}>
        <InsightButton onClick={handleInsightClick} />
        <ReactECharts
          style={{ height: "100%", width: "100%" }}
          option={option1}
          notMerge={true}
          lazyUpdate={true}
        />
        {isModalOpen && (
          <Modal onClose={handleCloseModal}>
            <h2></h2>
            <p>{insightText}</p>
          </Modal>
        )}
      </div>
      {compare && (
        <>
          {/* this is for stacking line chart of speed and swing for attemptdata2*/}
          <div style={{ position: "relative", height: "500px", margin: "30px 0" }}>
            <InsightButton onClick={handleInsightClick} />
            <ReactECharts
              style={{ height: "100%", width: "100%" }}
              option={option1comp}  // Use the chart options for attemptData2 here
              notMerge={true}
              lazyUpdate={true}
            />
            {isModalOpen && (
              <Modal onClose={handleCloseModal}>
                <h2></h2>
                <p>{insightText}</p>
              </Modal>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default VCTPL;
