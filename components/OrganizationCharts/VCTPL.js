// import React from "react";
// import ReactECharts from "echarts-for-react";
// import Chart from "react-apexcharts";
// import * as echarts from 'echarts';


// const VCTPL = ({ attemptData }) => {

//     let timeData = [];
//   let speedData = [];

//   let timeDataAngle= [];
//   let angleData= [];
//   let speedDataunloading=[];
//   let angleDataunloading=[];
//   let timeDataunloading=[];
  
//   // Find the specific graph data
//   const hoistTravelGraph = attemptData && attemptData.graphs 
//     ? attemptData.graphs.find(graph => graph.name === "Speed of hoist travelup to highlighted zone while loading")
//     : null;

//     const hoistTravelGraphangle = attemptData && attemptData.graphs 
//     ? attemptData.graphs.find(graph => graph.name === "Swing angle  to highlighted zone while loading")
//     : null;

//     const hoistTravelGraphspeedunloading = attemptData && attemptData.graphs 
//     ? attemptData.graphs.find(graph => graph.name === "Speed of hoist travelup to highlighted zone while stacking")
//     : null;

//     const hoistTravelGraphangleunloading = attemptData && attemptData.graphs 
//     ? attemptData.graphs.find(graph => graph.name === "Swing angle  to highlighted zone while stacking")
//     : null;

//     if (!hoistTravelGraph || !hoistTravelGraphangle || !hoistTravelGraphspeedunloading || !hoistTravelGraphangleunloading) {
//         return <div>No Hoist Travel Graph Data Available</div>;
//       }
    
//   timeData = hoistTravelGraph.data.map(point => point.x);
//   speedData = hoistTravelGraph.data.map(point => point.y);


//   speedDataunloading = hoistTravelGraphspeedunloading.data.map(point => point.y);
//   angleDataunloading = hoistTravelGraphangleunloading.data.map(point => point.y);
//   timeDataunloading = hoistTravelGraphspeedunloading.data.map(point => point.x);



//   timeDataAngle = hoistTravelGraphangle.data.map(point => point.x);
//   angleData = hoistTravelGraphangle.data.map(point => point.y);

//   let pieChartData = [];
//   let pieChartLabels = [];

//   // Find the pie chart in the attemptData.graphs array
//   const pieChart = attemptData && attemptData.graphs && attemptData.graphs.find(graph => graph.type === 'pie');

//   if (pieChart) {
//       // Convert data strings to numbers and use labels from the pie chart
//       pieChartData = pieChart.data.map(value => parseFloat(value));
//       pieChartLabels = pieChart.labels;
//   }

//   const vehicleChartOptions = {       // acc and break graph
//     title: {
//       text: "RTGC Analytics",
//       subtext: "Speed vs Angle with respect to time while loading graph",
//       left: "center"
//     },
//    tooltip: {
//     trigger: 'axis',
//     formatter: function (params) {
//       // Assuming the first series in the params array corresponds to the time axis label
//       let timeValue = params[0].axisValueLabel; // Or params[0].axisValue if axisValueLabel is not available
//       let result = `Time: ${timeValue} (sec)`; // Prepend 'Time: ' to the axis value (time)

//       // Append other series data
//       params.forEach((param) => {
//         result += `<br/>${param.marker}${param.seriesName}: ${param.value}`;
//       });

//       return result;
//     },
//     axisPointer: {
//         animation: false
//       },
//       backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent black for readability
//       borderColor: '#777',
//       borderWidth: 1,
//       textStyle: {
//           color: '#fff'
//       },
//       padding: 10
//   },
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
//       data: timeDataAngle,
//     },
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
//         data: speedData,
//       },
//       {
//         gridIndex: 1,
//       name: "Swing Angle",
//       type: "value",
//       inverse: true,
//       nameLocation: 'middle', // Place the name in the middle of the axis
//       nameGap: 35,

//       }
//     ],
//     series: [
//       {
//         name: "Speed m/s",
//         type: "line",
//         symbolSize: 8,
//         hoverAnimation: false,
//         areaStyle: { // Adding area style for a filled look under the line
//             normal: {
//                 color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
//                     offset: 0,
//                     color: '#EDF1F4'
//                 }, {
//                     offset: 1,
//                     color: '#EDF1F4'
//                 }])
//             }
//         },
//         data: speedData,
//     },
//       {
//         name: "Swing Angle",
//         type: "line",
//         xAxisIndex: 1,
//         yAxisIndex: 1,
//         symbolSize: 8,
//         hoverAnimation: false,
//         areaStyle: { // Adding area style for a filled look under the line
//             normal: {
//                 color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
//                     offset: 0,
//                     color: '#EDF1F4'
//                 }, {
//                     offset: 1,
//                     color: '#EDF1F4'
//                 }])
//             }
//         },
//         data: angleData,
//     }
//     ]
//   };


  

//   const vehicleChartOptions1 = {       // acc and break graph
//     title: {
//       text: "RTGC Analytics",
//       subtext: "Speed vs Angle with respect to time while unloading graph",
//       left: "center"
//     },
//    tooltip: {
//     trigger: 'axis',
//     formatter: function (params) {
//       // Assuming the first series in the params array corresponds to the time axis label
//       let timeValue = params[0].axisValueLabel; // Or params[0].axisValue if axisValueLabel is not available
//       let result = `Time: ${timeValue}`; // Prepend 'Time: ' to the axis value (time)

//       // Append other series data
//       params.forEach((param) => {
//         result += `<br/>${param.marker}${param.seriesName}: ${param.value}`;
//       });

//       return result;
//     },
//     axisPointer: {
//         animation: false
//       },
//       backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent black for readability
//       borderColor: '#777',
//       borderWidth: 1,
//       textStyle: {
//           color: '#fff'
//       },
//       padding: 10
//   },
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
//       data: timeDataunloading,
//     },
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
//         data: hoistTravelGraphspeedunloading,
//       },
//       {
//         gridIndex: 1,
//       name: "Swing Angle",
//       type: "value",
//       inverse: true,
//       nameLocation: 'middle', // Place the name in the middle of the axis
//       nameGap: 35,

//       }
//     ],
//     series: [
//       {
//         name: "Speed",
//         type: "line",
//         symbolSize: 8,
//         hoverAnimation: false,
//         areaStyle: { // Adding area style for a filled look under the line
//             normal: {
//                 color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
//                     offset: 0,
//                     color: '#EDF1F4'
//                 }, {
//                     offset: 1,
//                     color: '#EDF1F4'
//                 }])
//             }
//         },
//         data: speedDataunloading,
//     },
//       {
//         name: "Swing Angle",
//         type: "line",
//         xAxisIndex: 1,
//         yAxisIndex: 1,
//         symbolSize: 8,
//         hoverAnimation: false,
//         areaStyle: { // Adding area style for a filled look under the line
//             normal: {
//                 color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
//                     offset: 0,
//                     color: '#EDF1F4'
//                 }, {
//                     offset: 1,
//                     color: '#EDF1F4'
//                 }])
//             }
//         },
//         data: angleDataunloading,
//     }
//     ]
//   };


//   const option = {    // option for two lines chart dumping and loading area

//     // Make gradient line here
//     visualMap: [{
//         show: false,
//         type: 'continuous',
//         seriesIndex: 0,
//         min: 0,
//         max: 400
//     }, {
//         show: false,
//         type: 'continuous',
//         seriesIndex: 1,
//         dimension: 0,
//         min: 0,
//         max: timeDataAngle.length - 1
//     }],


//     title: [{
//         left: 'center',
//         text: 'Loading Area (speed should be below 5)'
//     }, ],
//     tooltip: {
//         trigger: 'axis',
//         formatter: function (params) {
//           // Extract the x-axis value (time)
//           let timeValue = params[0].axisValueLabel;
      
//           // Find the corresponding speed and angle values based on the index
//           let speedValue = speedData[params[0].dataIndex] || 'N/A';
//           let angleValue = angleData[params[0].dataIndex] || 'N/A';
      
//           return `Time: ${timeValue}<br/>Speed: ${speedValue} m/s<br/>Swing Angle: ${angleValue}`;
//         }
//       },
    
//     xAxis: [{
//       type: 'category',
//       boundaryGap: false,
//       data: timeDataAngle,
//       name: 'Time (sec)', // Label for the X-axis
//       nameLocation: 'middle', // Location of the label
//       nameGap: 30, // Gap b
//     }, {
//       type: 'category',
//       boundaryGap: false,
//       data: timeDataAngle,
//       name: 'Time (sec)', // Label for the X-axis
//       nameLocation: 'middle', // Location of the label
//       nameGap: 30, // Gap b
//         gridIndex: 1
//     }],
//     yAxis: [{
//       type: 'value',
//       name: 'Speed (m/s)', // Label for the Y-axis
//       nameLocation: 'middle', // Location of the label
//       nameGap: 50, // 
//         splitLine: {show: false}
//     }, {
//       type: 'value',
//       name: 'Swing (m/s)', // Label for the Y-axis
//       nameLocation: 'middle', // Location of the label
//       nameGap: 50, // 
//         splitLine: {show: false},
//         gridIndex: 1
//     }],
//     grid: [{
//         bottom: '60%'
//     }, {
//         top: '60%'
//     }],
//     series: [{
//         type: 'line',
//         symbol: 'none', // This hides the data point markers
//         data: speedData,
//           showSymbol: true,
//           symbolSize: 4,
        
      
        
//     }, {
//         type: 'line',
//         showSymbol: false,
//         data: angleData,
//         xAxisIndex: 1,
//         yAxisIndex: 1
//     },
//    ]
// };

// const option1 = {    // option for two lines chart dumping and loading area

//     // Make gradient line here
//     visualMap: [{
//         show: false,
//         type: 'continuous',
//         seriesIndex: 0,
//         min: 0,
//         max: 400
//     }, {
//         show: false,
//         type: 'continuous',
//         seriesIndex: 1,
//         dimension: 0,
//         min: 0,
//         max: timeDataunloading.length - 1
//     }],


//     title: [{
//         left: 'center',
//         text: 'Loading Area (speed should be below 5)'
//     }, ],
//     tooltip: {
//         trigger: 'axis',
//         formatter: function (params) {
//           // Extract the x-axis value (time)
//           let timeValue = params[0].axisValueLabel;
      
//           // Find the corresponding speed and angle values based on the index
//           let speedValue = speedDataunloading[params[0].dataIndex] || 'N/A';
//           let angleValue = angleDataunloading[params[0].dataIndex] || 'N/A';
      
//           return `Time: ${timeValue}<br/>Speed: ${speedValue} m/s<br/>Swing Angle: ${angleValue}`;
//         }
//       },
      
    
//     xAxis: [{
//       type: 'category',
//       boundaryGap: false,
//       data: timeDataunloading,
//       name: 'Time (sec)', // Label for the X-axis
//       nameLocation: 'middle', // Location of the label
//       nameGap: 30, // Gap b
//     }, {
//       type: 'category',
//       boundaryGap: false,
//       data: timeDataunloading,
//       name: 'Time (sec)', // Label for the X-axis
//       nameLocation: 'middle', // Location of the label
//       nameGap: 30, // Gap b
//         gridIndex: 1
//     }],
//     yAxis: [{
//       type: 'value',
//       name: 'Speed (m/s)', // Label for the Y-axis
//       nameLocation: 'middle', // Location of the label
//       nameGap: 50, // 
//         splitLine: {show: false}
//     }, {
//       type: 'value',
//       name: 'Swing (m/s)', // Label for the Y-axis
//       nameLocation: 'middle', // Location of the label
//       nameGap: 50, // 
//         splitLine: {show: false},
//         gridIndex: 1
//     }],
//     grid: [{
//         bottom: '60%'
//     }, {
//         top: '60%'
//     }],
//     series: [{
//         type: 'line',
//         symbol: 'none', // This hides the data point markers
//         data: speedDataunloading,
//           showSymbol: true,
//           symbolSize: 4,
        
      
        
//     }, {
//         type: 'line',
//         showSymbol: false,
//         data: angleDataunloading,
//         xAxisIndex: 1,
//         yAxisIndex: 1
//     },
//    ]
// }; 

//   return (
//     <>
   

//       <ReactECharts
//          style={{ height: "500px", margin: "30px 0" }} // Adds vertical margin

//         option={vehicleChartOptions}
//         notMerge={true}
//         lazyUpdate={true}
//       />

// <ReactECharts
//          style={{ height: "500px", margin: "30px 0" }} // Adds vertical margin

//         option={vehicleChartOptions1}
//         notMerge={true}
//         lazyUpdate={true}
//       />

// <ReactECharts
//          style={{ height: "500px", margin: "30px 0" }} // Adds vertical margin

//         option={option}
//         notMerge={true}
//         lazyUpdate={true}
//       />

// <ReactECharts
//          style={{ height: "500px", margin: "30px 0" }} // Adds vertical margin

//         option={option1}
//         notMerge={true}
//         lazyUpdate={true}
//       />
//     </>
//   );
// };


// export default VCTPL;