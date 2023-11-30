import React from "react";
import ReactECharts from "echarts-for-react";
import Chart from "react-apexcharts";
import * as echarts from 'echarts';


const Apollo = ({ attemptData }) => {
    // Initialize arrays for chart data
    let kpiNames = [];
let actualValues = [];
let idealValues = [];
let pieChartData = [];

if (attemptData && attemptData.kpis) {
    attemptData.kpis.forEach(kpi => {
      kpiNames.push(kpi.name);
      actualValues.push(parseFloat(kpi.value || 0));

      // Check if ideal_time is defined and is a string
      if (typeof kpi.ideal_time === 'string') {
        const idealTimeMatch = kpi.ideal_time.match(/\d+/);
        const idealTimeValue = idealTimeMatch ? parseFloat(idealTimeMatch[0]) : 0;
        idealValues.push(idealTimeValue);
      } else {
        idealValues.push(0); // If ideal_time is undefined or not a string, use 0
      }

      // Prepare data for pie chart
      pieChartData.push({ name: kpi.name, value: parseFloat(kpi.value || 0) });
    });
  } else {
    return <div>No KPI data available</div>;
  }


  const combinedPieChartData = [];
kpiNames.forEach((name, index) => {
    combinedPieChartData.push({ name: `Actual Time`, value: actualValues[index] });
    combinedPieChartData.push({ name: `Ideal Time`, value: idealValues[index] });
  });

  const categories = [];
const seriesDataActual = [];
const seriesDataIdeal = [];

kpiNames.forEach((name, index) => {
  // Push the name twice for actual and ideal labels
  categories.push(`${name} - Actual Time`);
  categories.push(`${name} - Ideal Time`);

  // Prepare the series data for actual and ideal times
  seriesDataActual.push({ y: index * 2, x: actualValues[index] }); // Actual value
  seriesDataIdeal.push({ y: index * 2 + 1, x: idealValues[index] }); // Ideal value
});

           
    //   var canvas = document.createElement('canvas');
    //   var ctx = canvas.getContext('2d');
    //   canvas.width = canvas.height = 100;
    //   ctx.textAlign = 'center';
    //   ctx.textBaseline = 'middle';
    //   ctx.globalAlpha = 0.08;
    //   ctx.font = '20px Microsoft Yahei';
    //   ctx.translate(50, 50);
    //   ctx.rotate(-Math.PI / 4);
      

      const determineInsightText=(kpis)=> {
        let actualTimeExceeds = false;
      
        for (let i = 0; i < kpis.length; i++) {
          const kpi = kpis[i];
          const actualValue = parseFloat(kpi.value);
          let idealValue = 0;
      
          if (kpi.ideal_time && typeof kpi.ideal_time === 'string') {
            const idealTimeMatch = kpi.ideal_time.match(/\d+/);
            if (idealTimeMatch) {
              idealValue = parseFloat(idealTimeMatch[0]);
            }
          }
      
          if (actualValue > idealValue) {
            actualTimeExceeds = true;
            break;
          }
        }
      
        return actualTimeExceeds 
          ? { text: 'task exceeded ideal time', color: '#ff3333' } // Red color for exceeded case
          : { text: 'task completed within ideal time', color: '#33cc33' }; // Green color for within time
      }
      const position = determineInsightText(attemptData.kpis).text.includes('exceeded') ? '71.5%' : '69%'; // Adjust these percentages as needed

      const option1 = {
        title: {
            text: 'Ideal VS Actual Time Comparision',
            subtext: 'Apollo'
        },
        graphic: {
            elements: [{
                type: 'text',
  left: '74.5%', // Adjust the position as needed
  top: '40%',
  style: {
    text: 'Insight:',
    fill: '#355C7D', // A deep shade for the text
    font: 'bold 22px "Lucida Grande", sans-serif', // An elegant, readable font
    backgroundColor: {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [{
          offset: 0, color: 'rgba(247, 247, 247, 0.95)' // Light start of gradient
      }, {
          offset: 1, color: 'rgba(230, 230, 230, 0.95)' // Slightly darker end of gradient
      }],
      global: false
    },
    padding: [3, 8], // Slightly more padding around text
    borderRadius: 6, // Softly rounded corners
    borderWidth: 1,
    borderColor: '#d3d3d3', // Light grey border
    shadowBlur: 10,
    shadowColor: 'rgba(0, 0, 0, 0.3)', // Softer shadow
    textShadowColor: '#4b6584', // A deeper color for the emboss effect
    textShadowBlur: 0,
    textShadowOffsetX: 0,
    textShadowOffsetY: 1, // Gives a subtle embossed effect
    lineHeight: 30,
    textAlign: 'center',
    textVerticalAlign: 'middle'
  }
            },{
              type: 'text',
              left: position, // Adjust left and top positions as needed
              top: '50%',
              style: {
                text: determineInsightText(attemptData.kpis).text,
                fill: determineInsightText(attemptData.kpis).color,
                font: 'bold 14px Arial',
                textAlign: 'center',
                backgroundColor: '#454545', // White background
                borderColor: determineInsightText(attemptData.kpis).color,
                borderWidth: 2,
                borderRadius: 4,
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.3)',
                shadowOffsetX: 3,
                shadowOffsetY: 3,
                padding: [6, 3] // Vertical and horizontal padding
              }
            }]
          },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['Actual', 'Ideal', 'KPIs']
        },
        grid: {
            left: '5%',    // Increase left margin
            right: '40%',  // Increase right margin to give more space to the pie chart
            top: '10%',    // Increase top margin
            bottom: '10%', // Increase bottom margin
            containLabel: true
        },
        xAxis: {
          type: 'category',
          data: kpiNames,
          axisLabel: {
            show: true,
            formatter: function (value) {
              return value; // Custom formatting
            },
            textStyle: {
              color: '#333', // Text color
            }
          } // Names for the bars
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            show: true,
            textStyle: {
              color: '#333', // Text color
            }
          }
        },
        series: [
            {
                name: 'Actual',
                type: 'bar',
                data: actualValues, // Your actual values data array
                label: {
                  show: true,
                  position: 'top'
                },
            },
          {
            name: 'Ideal',
            type: 'bar',
            data: idealValues,
            label: {
              show: true,
              position: 'top'
            }
          },
         
        ],
       
      };
     
        
 
  // const speedTimeData = attemptData.map(item => {
  //   return [parseFloat(item.time), parseFloat(item.speed)];
  // });

//   const chartData = [
//     {
//       name: 'Actual Value',
//       data: actualValues
//     },
//     {
//       name: 'Ideal Value',
//       data: idealValues
//     }
//   ];

//   const chartOptions = {
//     chart: {
//       type: 'bar',
//       height: 350,
//       stacked: true
//     },
//     plotOptions: {
//       bar: {
//         horizontal: true,
//       },
//     },
//     dataLabels: {
//       enabled: false
//     },
//     xaxis: {
//       categories: kpiNames,
//     },
//     yaxis: {
//       title: {
//         text: 'Value (sec)'
//       }
//     },
//     fill: {
//       opacity: 1
//     },
//     tooltip: {
//       y: {
//         formatter: function (val) {
//           return val + " sec"
//         }
//       }
//     }
//   };


  return (
    <>

    <ReactECharts
      style={{ height: "500px", margin: "30px 0" }} // Adds vertical margin
      option={option1}
        notMerge={true}
        lazyUpdate={true}
      />
 

    </>
  );
};

export default Apollo;