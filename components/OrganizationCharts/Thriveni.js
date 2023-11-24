import React from "react";
import ReactECharts from "echarts-for-react";
import Chart from "react-apexcharts";


const Thriveni = ({ attemptData }) => {
  let brakeData = [];
  let accelerationData = [];
  let timeData = [];
  let rpmData = [];
  let speedData = [];
  let speedDataFiltered = []; // Declare it here
  let gearNames = [];
  let modeData = [];

  let maxSpeedByGear = {};
  let collisionCountByGear = {};

  const modeDurations = {};
  let lastMode = null;
  let lastTime = 0;


  const modeCount = {};


// Step 2: Prepare data for the pie chart




  const intervals = [];
  const pieces = [];

  if (attemptData) {
    const {
      path: { actual_path }
    } = attemptData;

    const filteredData = Object.keys(actual_path)
      .map(key => actual_path[key])
      .flat();

      speedDataFiltered = filteredData     // this code is for two line chart where need to see dumping area and loading area
      .filter(item => item.loadingstatus === "1")
      .map(item => {
        return {
          value: [item.time, parseFloat(item.rpm)],
          symbol: 'none' // Optional: to hide individual data point symbols
        };
      });

    brakeData = filteredData.map(item => item.brake);
    accelerationData = filteredData.map(item => item.acceleration);
    timeData = filteredData.map(item => item.time);
    rpmData = filteredData.map(item => item.rpm);
    speedData = filteredData.map(item => item.speed);
    modeData = filteredData.map(item => item.mode);

    gearNames = [...new Set(filteredData.map(item => item.gear))];

    filteredData.forEach(item => {       // This is for gear colloision graph from line 62 to line 95
      const gear = item.gear;
      const collisionStatus = item.collisionStatus; // This is a string
    
      if (!collisionCountByGear[gear]) {
        collisionCountByGear[gear] = 0;
      }
    
      if (collisionStatus === "1") { // Compare as a string
        collisionCountByGear[gear]++;
      }
    });

    filteredData.forEach(item => {
      const gear = item.gear;
      const collisionStatus = parseInt(item.collisionStatus, 10); // Convert to a number
    
      if (!collisionCountByGear[gear]) {
        collisionCountByGear[gear] = 0;
      }
    
      if (collisionStatus === 1) { // Now comparing numbers
        collisionCountByGear[gear]++;
      }
    });

    filteredData.forEach(item => {
      const gear = item.gear;
      const speed = parseFloat(item.speed); // Convert string to number
  
      if (!maxSpeedByGear[gear] || maxSpeedByGear[gear] < speed) {
        maxSpeedByGear[gear] = speed;
      }
    });


    filteredData.forEach(item => {       // this is for pie chart of mode from line 98 to 122
      const mode = item.mode;
      if (!modeCount[mode]) {
        modeCount[mode] = 0;
      }
      modeCount[mode]++;
    });

    filteredData.forEach((item, index) => {
      const currentMode = item.mode;
      const currentTime = parseFloat(item.time);
    
      if (lastMode !== currentMode) {
        if (lastMode !== null) {
          // Calculate duration for the last mode
          modeDurations[lastMode] = (modeDurations[lastMode] || 0) + (currentTime - lastTime);
        }
        // Update last mode and time
        lastMode = currentMode;
        lastTime = currentTime;
      } else if (index === filteredData.length - 1) {
        // Calculate duration for the last mode entry
        modeDurations[currentMode] = (modeDurations[currentMode] || 0) + (currentTime - lastTime);
      }
    });

    let startInterval = null;

    for (let i = 0; i < filteredData.length; i++) {
      const point = filteredData[i];
      if (point.loadingstatus === "1") {
        if (startInterval === null) {
          startInterval = point.time;
        }
        pieces.push({
          lte: i + 1,
          color: "red"
        });
      } else {
        if (startInterval !== null) {
          intervals.push([
            { name: "Loading", xAxis: startInterval },
            { name: "Loading", xAxis: point.time }
          ]);
          startInterval = null;
        }
        pieces.push({
          lte: i + 1,
          color: "green"
        });
      }
    }
    if (startInterval !== null) {
      intervals.push([
        { name: "Loading", xAxis: startInterval },
        { name: "Loading", xAxis: filteredData[filteredData.length - 1].time }
      ]);
    }
  }
  

  const gears = Object.keys(maxSpeedByGear);
  const maxSpeeds = Object.values(maxSpeedByGear);

  const gears1 = Object.keys(collisionCountByGear);
  const totalCollisions = Object.values(collisionCountByGear);


  const pieChartData = Object.keys(modeDurations).map(mode => {
    return { name: mode, value: modeDurations[mode] };
  });

  const vehicleChartOptions = {       // acc and break graph
    title: {
      text: "Vehicle Analytics",
      subtext: "Speed vs time graph",
      left: "center"
    },
   tooltip: {
    trigger: 'axis',
    axisPointer: {
      animation: false
    },
    formatter: function (params) {
      // Assuming the first series in the params array corresponds to the time axis label
      let timeValue = params[0].axisValueLabel; // Or params[0].axisValue if axisValueLabel is not available
      let result = `Time: ${timeValue}`; // Prepend 'Time: ' to the axis value (time)

      // Append other series data
      params.forEach((param) => {
        result += `<br/>${param.marker}${param.seriesName}: ${param.value}`;
      });

      return result;
    }
  },
    legend: {
      data: ["Acceleration", "Brake"],
      left: 10
    },
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: "none"
        },
        restore: {},
        saveAsImage: {}
      }
    },
    axisPointer: {
      link: { xAxisIndex: "all" }
    },
    dataZoom: [
      {
        show: true,
        realtime: true,
        xAxisIndex: [0, 1]
      },
      {
        type: "inside",
        realtime: true,
        xAxisIndex: [0, 1]
      }
    ],
    grid: [
      {
        left: 50,
        right: 50,
        height: "35%"
      },
      {
        left: 50,
        right: 50,
        top: "55%",
        height: "35%"
      }
    ],
    xAxis: [
      {
        type: "category",
        boundaryGap: false,
        axisLine: { onZero: true },
        data: timeData
      },
      {
        gridIndex: 1,
        type: "category",
        boundaryGap: false,
        axisLine: { onZero: true },
        data: timeData,
        position: "top"
      }
    ],
    yAxis: [
      {
        name: "Acceleration",
        type: "value",
        max: 1
      },
      {
        gridIndex: 1,
      name: "Brake",
      type: "value",
      inverse: true,
      nameLocation: 'middle', // Place the name in the middle of the axis
      nameGap: 35,

      }
    ],
    series: [
      {
        name: "Acceleration",
        type: "line",
        symbolSize: 8,
        hoverAnimation: false,
        data: accelerationData
      },
      {
        name: "Brake",
        type: "line",
        xAxisIndex: 1,
        yAxisIndex: 1,
        symbolSize: 8,
        hoverAnimation: false,
        data: brakeData
      }
    ]
  };

  const rpmChartOptions = {
    title: {
      text: "Rpm Vs Time During Loading"
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross"
      }
    },
    toolbox: {
      show: true,
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: timeData,
      axisLabel: {
        formatter: function (value) {
          return parseInt(value);
        }
      }
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "{value} "
      },
      axisPointer: {
        snap: true
      }
    },
    visualMap: {
      show: false,
      dimension: 0,
      pieces: pieces
    },
    series: [
      {
        name: "Rpm Vs Time During Loading",
        type: "line",
        smooth: true,
        data: rpmData,
        markArea: {
          itemStyle: {
            color: "rgba(255, 173, 177, 0.4)"
          },
          data: intervals
        }
      }
    ]
  };
  
  const option = {    // option for two lines chart dumping and loading area

      // Make gradient line here
      visualMap: [{
          show: false,
          type: 'continuous',
          seriesIndex: 0,
          min: 0,
          max: 400
      }, {
          show: false,
          type: 'continuous',
          seriesIndex: 1,
          dimension: 0,
          min: 0,
          max: timeData.length - 1
      }],


      title: [{
          left: 'center',
          text: 'Gradient along the y axis'
      }, {
          top: '55%',
          left: 'center',
          text: 'Gradient along the x axis'
      }],
      tooltip: {
          trigger: 'axis'
      },
      xAxis: [{
          data: timeData
      }, {
          data: timeData,
          gridIndex: 1
      }],
      yAxis: [{
          splitLine: {show: false}
      }, {
          splitLine: {show: false},
          gridIndex: 1
      }],
      grid: [{
          bottom: '60%'
      }, {
          top: '60%'
      }],
      series: [{
          type: 'line',
          showSymbol: false,
          data: speedData.map((speed, index) => speed !== null ? [timeData[index], speed] : [timeData[index], null]),
          markLine: {
            data: [
              {
                name: 'Ideal Speed',
                yAxis: 5
              }
            ],
            label: {
              formatter: 'Ideal Speed'
            },
            lineStyle: {
              type: 'dashed',
              color: '#f00' // You can choose the color
            }},
            lineStyle: {
              normal: {
                color: function (params) {
                  // Check if the current segment is not null and above the threshold
                  if (params.value[1] !== null) {
                    return params.value[1] > 5 ? '#FF0000' : '#00FF00'; // Red if above 5, green otherwise
                  } else {
                    return '#00FF00'; // Default color for null segments
                  }
                }
              }
            },
            itemStyle: {
              normal: {
                color: function (params) {
                  // Apply the same logic to individual points
                  return params.value[1] !== null && params.value[1] > 5 ? '#FF0000' : '#00FF00';
                }
              }
            },
            showSymbol: true,
            symbolSize: 4,
          
        
          
      }, {
          type: 'line',
          showSymbol: false,
          data: speedDataFiltered,
          markLine: {
            data: [
              {
                name: 'Ideal Speed',
                yAxis: 5
              }
            ],
            label: {
              formatter: 'Ideal Speed'
            },
            lineStyle: {
              type: 'dashed',
              color: '#f00' // You can choose the color
            }},
          xAxisIndex: 1,
          yAxisIndex: 1
      },
     ]
  };

  const series1 = [{    // gear colloision graph
    name: 'Max Speed',
    type: 'column',
    data: maxSpeeds
  }, {
    name: 'Total Collisions',
    type: 'line',
    data: totalCollisions
  }];
  const options1= {
    chart: {
      height: 350,
      type: 'line',
    },
    tooltip: {
      x: {
        show: true,
        formatter: function(value, { series, seriesIndex, dataPointIndex, w }) {
          // Fetch the gear name using dataPointIndex
          const gearName = gears1[dataPointIndex];
          return 'Gear: ' + gearName; // Displays "Gear: N" for the first bar, "Gear: D" for the second, etc.
        }
      }
    },
    stroke: {
      width: [0, 4]
    },
    title: {
      text: 'Gear Collision Graph'
    },
    dataLabels: {
      enabled: true,
      enabledOnSeries: [1]
    },
    labels: gears1,
   xaxis: {
    type: 'category',
    categories: gears1, // gear names for the x-axis labels
    title: {
      text: 'Gears', // Title for the x-axis
      style: {
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontWeight: 600,
        // other style properties as needed
      }
    }
  },

    yaxis: [{
      title: {
        text: 'Speed',
      },
    
    }, {
      opposite: true,
      title: {
        text: 'Total Colloision'
      }
    }]
  }

  const option1 = {  // pie chart of different mode
    tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: pieChartData.map(item => item.name)
    },
    series: [
        
        {
            name: '访问来源',
            type: 'pie',
            radius: ['40%', '55%'],
            label: {
                formatter: '{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ',
                backgroundColor: '#eee',
                borderColor: '#aaa',
                borderWidth: 1,
                borderRadius: 4,
                // shadowBlur:3,
                // shadowOffsetX: 2,
                // shadowOffsetY: 2,
                // shadowColor: '#999',
                // padding: [0, 7],
                rich: {
                    a: {
                        color: '#999',
                        lineHeight: 22,
                        align: 'center'
                    },
                    // abg: {
                    //     backgroundColor: '#333',
                    //     width: '100%',
                    //     align: 'right',
                    //     height: 22,
                    //     borderRadius: [4, 4, 0, 0]
                    // },
                    hr: {
                        borderColor: '#aaa',
                        width: '100%',
                        borderWidth: 0.5,
                        height: 0
                    },
                    b: {
                        fontSize: 16,
                        lineHeight: 33
                    },
                    per: {
                        color: '#eee',
                        backgroundColor: '#334455',
                        padding: [2, 4],
                        borderRadius: 2
                    }
                }
            },
            data: pieChartData

        }
    ]
};


  return (
    <>
      <ReactECharts
        style={{
          height: "500px"
        }}
        option={vehicleChartOptions}
        notMerge={true}
        lazyUpdate={true}
      />

      <ReactECharts
        style={{ height: "500px" }}   // two line chart loading and dumping area w.r to time
        option={option}
        notMerge={true}
        lazyUpdate={true}
      />

      <ReactECharts
        style={{ height: "500px" }}   // Pie chart mode
        option={option1}
        notMerge={true}
        lazyUpdate={true}
      />

      <ReactECharts
        style={{
          height: "500px"
        }}
        option={rpmChartOptions}
        notMerge={true}
        lazyUpdate={true}
      />
      <Chart options={options1} series={series1} //gear collosion graph
      />;   

    </>
  );
};

export default Thriveni;