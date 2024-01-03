import React, { useState } from "react";
import ReactECharts from "echarts-for-react";
import Chart from "react-apexcharts";
import * as echarts from "echarts";
import { constSelector } from "recoil";
import { func } from "prop-types";



const Reliance = ({ attemptData, attemptData2, compare = false }) => {
  const [selectedCollisionType, setSelectedCollisionType] = useState("total");
  const [selectedArea, setSelectedArea] = useState('all');
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [insightText, setInsightText] = React.useState("");

  // Initialize other collision types if needed

  let brakeData = [];
  let accelerationData = [];
  let timeData = [];
  let rpmData = [];
  let speedData = [];
  let speedDataFiltered = []; // Declare it here
  let gearNames = [];
  let modeData = [];
  let speedDataFiltered1 = []; // Declare it here
  let totalCollisions = {}; // Object to store total collisions by gear
  let additionalSpeedData = {};

  let maxSpeedByGear = {};
  let collisionCountByGear = {};

  const modeDurations = {};
  let lastMode = null;
  let lastTime = 0;

  const modeCount = {};

  let kpiNames = [];
  let kpiValues = [];


  const InsightButton = ({ onClick }) => (
    <button className="pulseBtn"
      style={{
        // position: "absolute",
        top: "20px",
        right: "20px",
        zIndex: 10,
        backgroundColor: " rgb(59 130 246)", // Light blue background
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
        transition: "background-color 0.3s ease", // Smooth transition for hover effect
        margin: "5px 5px"
      }}
      onClick={onClick}
      onMouseOver={e => (e.target.style.backgroundColor = " rgb(59 130 246)")} // Darker green on hover
      onMouseOut={e => (e.target.style.backgroundColor = " rgb(59 130 246)")} // Back to light green
    >
      Get Insight
    </button>
  );

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const Modal = ({ onClose, children }) => (
    <div className="fixed inset-0 bg-grey bg-opacity-10 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
        <div className="modal-header flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-800">
            Graph Insights
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 text-2xl"
          >
            &times; {/* Unicode for 'X' symbol */}
          </button>
        </div>
        <div className="modal-body" style={{ color: "black" }} >{children}</div>
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

  // message for graph insights
  const SpeedTimeInsight = () => {
    // Assuming PathlessSpeedData is an array of numeric values
    const speedData = PathlessSpeedData;

    // Check if the speed consistently exceeds a threshold
    const consistentHighSpeed = speedData.every(speed => speed > 5); // Adjust the threshold as needed

    // Check if there are sudden spikes in speed
    const suddenSpikes = speedData.some((speed, index) => {
      const nextSpeed = speedData[index + 1];
      return nextSpeed && nextSpeed - speed > 5; // Adjust the threshold as needed
    });

    // Generate insight text based on the analysis
    let insightText = "No issues detected, This graph shows speed over the duration of time";


    if (consistentHighSpeed) {
      insightText = "The vehicle is consistently traveling at a high speed. Driver may need to reduce speed for safety.";
    } else if (suddenSpikes) {
      insightText = "Sudden spikes in speed detected. Driver may need to be cautious and avoid abrupt acceleration.";
    }

    // Set the generated insight text and open the modal
    setInsightText(insightText);
    setModalOpen(true);
  };

  const LevelTimeTaken = () => {
    const maxTimeIndex = chartConfig.series.indexOf(Math.max(...chartConfig.series));
    const taskWithMaxTime = kpiNames[maxTimeIndex];
    const averageTime = chartConfig.series.reduce((acc, val) => acc + val, 0) / chartConfig.series.length;
    const aboveAverageTasks = kpiNames.filter((name, index) => chartConfig.series[index] > averageTime);


    const insights = `
      Performance Evaluation:
      The task "${taskWithMaxTime}" takes the longest time among all tasks.
  
      Task Efficiency:
      On average, tasks take ${averageTime.toFixed(2)} hrs. Tasks taking longer than average include:
      ${aboveAverageTasks.join(', ')}
  
      Training Recommendation:
      Consider providing training for tasks where the driver spends a significant amount of time to improve efficiency.
    `;

    // Update state with insights and open the modal
    setInsightText(insights);
    setModalOpen(true);
  };

  const PowerTime = () => {
    const modes = modeData
    const acceleration = PathlessAccelerationData
    const breaks = PathlessBreakData

    const calculateModePercentage = (mode) => {
      const modeCount = modes.filter((m) => m === mode).length;
      const totalModes = modes.length;
      return (modeCount / totalModes) * 100;
    };
    const powerModePercentage = calculateModePercentage("POWER");
    if (powerModePercentage > 33) {
      const insightText = "Driver is working in power mode, which may lead to extra fuel consumption and reduce fuel efficiency.";
      setInsightText(insightText);
    }
    const economyModePercentage = calculateModePercentage("ECONOMY");
    if (economyModePercentage > 50) {
      const insightText = "Driver is fuel-efficient by working in economy mode consistently, this leads to less fuel consumption of fuel and increase efficiency.";

      setInsightText(insightText);
    }
    setModalOpen(true);
  };

  const VehSpeedTimeInsight = () => {
    // Assuming PathlessAccelerationData and PathlessBreakData are arrays of numeric values
    const accelerationData = PathlessAccelerationData;
    const breakData = PathlessBreakData;

    // Count how many times both acceleration and brakes are greater than zero
    const countExceedingThreshold = accelerationData.reduce((count, acceleration, index) => {
      if (acceleration > 0 && breakData[index] > 0) {
        return count + 1;
      }
      return count;
    }, 0);

    // Generate insight text based on the count
    const insightText =
      countExceedingThreshold > 2
        ? "The driver may not be fuel-efficient and may need training. High acceleration and braking observed multiple times."
        : "This graph analysis shows that the driver is not applying breaks and acceleration together hence the driver is fuel efficient."
    // Set the generated insight text and open the modal
    setInsightText(insightText);
    setModalOpen(true);
  };


  const LoadDumpParkInsight = () => {
    // Assuming loadingSpeedData, dumpingSpeedData, and parkingSpeedData are arrays of numeric values
    const loadingSpeedData = speedDataFiltered;
    const dumpingSpeedData = speedDataFiltered1;
    const parkingSpeedData = additionalSpeedData;

    // Check if the speed during loading is greater than 5
    const highLoadingSpeed = loadingSpeedData.some(speed => speed > 5);

    // Check if the speed during dumping is greater than 5
    const highDumpingSpeed = dumpingSpeedData.some(speed => speed > 5);

    // Check if the speed during parking is greater than 5
    const highParkingSpeed = parkingSpeedData.some(speed => speed > 5);

    // Generate insight text based on the analysis
    let insightText = "This graph shows the speed analysis of dumper while loading, dumping and parking.";

    if (highLoadingSpeed) {
      insightText = "High speed detected during loading. Driver may need to control speed for safety.";
    } else if (highDumpingSpeed) {
      insightText = "High speed detected during dumping. Driver may need to control speed for safety.";
    } else if (highParkingSpeed) {
      insightText = "High speed detected during parking. Driver may need to control speed for safety.";
    }

    // Set the generated insight text and open the modal
    setInsightText(insightText);
    setModalOpen(true);
  };

  const CollisionInsight = () => {
    // Calculate total collisions across all gears
    const totalCollisions = gears1.reduce(
      (acc, gear) => acc + getCollisionCount(gear),
      0
    );

    // Initialize an array to store insights
    const insights = [];

    // Check if there are any collisions
    if (totalCollisions > 0) {
      insights.push(`After analyzing this graph, ${totalCollisions} total collisions were detected, indicating potential safety concerns.`);

      // Check individual gears for collisions and speed
      gears1.forEach((gear) => {
        const collisions = getCollisionCount(gear);
        const maxSpeed = maxSpeedByGear[gear];

        if (collisions > 0) {
          insights.push(`Gear ${gear} has ${collisions} collisions at a maximum speed of ${maxSpeed} m/s.`);
          if (collisions > 1) {
            insights.push(`\x1b[31mAttention: Multiple collisions on Gear ${gear} indicate a potential area for safety improvement.\x1b[0m`);
          }
        }
      });

      // Set the insights as text
      const combinedInsightText = insights.join('\n');
      setInsightText(combinedInsightText);

      // Open the modal to display insights
      setModalOpen(true);
    } else {
      // If no collisions, display a message indicating safety
      const combinedInsightText = 'No collisions detected. The vehicle appears to be operating safely.';
      setInsightText(combinedInsightText);
      setModalOpen(true);
    }
  };




  const RpmLoading = () => {
    // Assuming rpmData is an array of numeric values
    const rpmDataArray = rpmData; // Replace with the actual data variable

    // Check if RPM exceeds the ideal value during loading
    const highRpmDuringLoading = rpmDataArray.some(rpm => rpm > 1800); // Adjust the threshold as needed

    // Generate insight text based on the analysis
    let insightText = "Insight: No issues detected.";

    if (highRpmDuringLoading) {
      insightText = "Insight: High RPM detected during loading. Driver may need to control RPM for fuel efficiency and engine health.";
    }

    // Set the generated insight text and open the modal
    setInsightText(insightText);
    setModalOpen(true);
  };

  const RpmunLoading = () => {
    // Assuming rpmData is an array of numeric values
    const rpmDataArray = rpmData; // Replace with the actual data variable

    // Check if RPM exceeds the ideal value during loading
    const highRpmDuringLoading = rpmDataArray.some(rpm => rpm > 800); // Adjust the threshold as needed

    // Generate insight text based on the analysis
    let insightText = "Insight: No issues detected.";

    if (highRpmDuringLoading) {
      insightText = "Insight: High RPM detected during loading. Driver may need to control RPM for fuel efficiency and engine health.";
    }

    // Set the generated insight text and open the modal
    setInsightText(insightText);
    setModalOpen(true);
  };

  if (attemptData && attemptData.kpis) {
    kpiNames = attemptData.kpis.map(kpi => kpi.name);
    kpiValues = attemptData.kpis.map(kpi => parseFloat(kpi.value));
  }

  let kpiNames2 = [];
  let kpiValues2 = [];

  if (attemptData2 && attemptData2.kpis) {
    kpiNames2 = attemptData2.kpis.map(kpi => kpi.name);
    kpiValues2 = attemptData2.kpis.map(kpi => parseFloat(kpi.value));
  }
  // Step 2: Prepare data for the pie chart

  const intervals = [];
  const pieces = [];
  const intervalsunloading = [];

  if (attemptData) {
    const {
      path: { actual_path }
    } = attemptData;

    const filteredData = Object.keys(actual_path)
      .map(key => actual_path[key])
      .flat();


    speedDataFiltered = filteredData // this code is for two line chart where need to see dumping area and loading area
      .filter(item => item.loadingarea === "1")
      .map(item => {
        return {
          value: [item.time, parseFloat(item.speed)],
          symbol: "none" // Optional: to hide individual data point symbols
        };
      }).sort((a, b) => {
        // Convert the string to a number for comparison
        let firstValueA = parseFloat(a.value[0]);
        let firstValueB = parseFloat(b.value[0]);

        return firstValueA - firstValueB;
      });

    speedDataFiltered1 = filteredData // this code is for two line chart where need to see dumping area and loading area
      .filter(item => item.dumpingarea === "1")
      .map(item => {
        return {
          value: [item.time, parseFloat(item.speed)],
          symbol: "none" // Optional: to hide individual data point symbols
        };
      }).sort((a, b) => {
        // Convert the string to a number for comparison
        let firstValueA = parseFloat(a.value[0]);
        let firstValueB = parseFloat(b.value[0]);

        return firstValueA - firstValueB;
      });

    additionalSpeedData = filteredData // this code is for two line chart where need to see dumping area and loading area
      .filter(item => item.parkingarea === "1")
      .map(item => {
        return {
          value: [item.time, parseFloat(item.speed)],
          symbol: "none" // Optional: to hide individual data point symbols
        };
      }).sort((a, b) => {
        // Convert the string to a number for comparison
        let firstValueA = parseFloat(a.value[0]);
        let firstValueB = parseFloat(b.value[0]);

        return firstValueA - firstValueB;
      });

    filteredData.forEach(item => {
      const gear = item.gear;
      // Initialize the object for each gear if not already done
      if (!totalCollisions[gear]) {
        totalCollisions[gear] = 0;
        // Initialize other collision types here
      }

      // Update collision counts
      totalCollisions[gear] += parseInt(item.collisionStatus, 10);
      // Update other collision types here
    });

    brakeData = filteredData.map(item => item.brake);
    accelerationData = filteredData.map(item => item.acceleration);
    timeData = filteredData.map(item => item.time);
    rpmData = filteredData.map(item => item.rpm);
    speedData = filteredData.map(item => item.speed);
    modeData = filteredData.map(item => item.mode);

    gearNames = [...new Set(filteredData.map(item => item.gear))];

    filteredData.forEach(item => {
      // This is for gear colloision graph from line 62 to line 95
      const gear = item.gear;
      const collisionStatus = item.collisionStatus; // This is a string

      if (!collisionCountByGear[gear]) {
        collisionCountByGear[gear] = 0;
      }

      if (collisionStatus === "1") {
        // Compare as a string
        collisionCountByGear[gear]++;
      }
    });

    filteredData.forEach(item => {
      const gear = item.gear;
      const collisionStatus = parseInt(item.collisionStatus, 10); // Convert to a number

      if (!collisionCountByGear[gear]) {
        collisionCountByGear[gear] = 0;
      }

      if (collisionStatus === 1) {
        // Now comparing numbers
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

    filteredData.forEach(item => {
      // this is for pie chart of mode from line 98 to 122
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
          modeDurations[lastMode] =
            (modeDurations[lastMode] || 0) + (currentTime - lastTime);
        }
        // Update last mode and time
        lastMode = currentMode;
        lastTime = currentTime;
      } else if (index === filteredData.length - 1) {
        // Calculate duration for the last mode entry
        modeDurations[currentMode] =
          (modeDurations[currentMode] || 0) + (currentTime - lastTime);
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

    let startIntervalunloading = null;

    for (let i = 0; i < filteredData.length; i++) {
      const point = filteredData[i];
      if (point.unloadingstatus === "1") {
        if (startIntervalunloading === null) {
          startIntervalunloading = point.time;
        }
        pieces.push({
          lte: i + 1,
          color: "red"
        });
      } else {
        if (startIntervalunloading !== null) {
          intervalsunloading.push([
            { name: "UnLoading", xAxis: startIntervalunloading },
            { name: "UnLoading", xAxis: point.time }
          ]);
          startIntervalunloading = null;
        }
        pieces.push({
          lte: i + 1,
          color: "green"
        });
      }
    }
    if (startIntervalunloading !== null) {
      intervalsunloading.push([
        { name: "UnLoading", xAxis: startIntervalunloading },
        { name: "UnLoading", xAxis: filteredData[filteredData.length - 1].time }
      ]);
    }
  }


  let intervals_user2_load = []; // Array to store intervals_user1_load for attemptData2
  let intervals_user2_unload = [];
  let startInterval1 = null;
  let startInterval2 = null;
  let rpmData1 = [];

  let modeDurations_User2 = [];
  let lastMode1 = null;
  let lastTime1 = 0;

  if (attemptData2 && attemptData2.path && attemptData2.path.actual_path) {
    // Flatten and sort the data from attemptData2
    const pathlessData2 = Object.keys(attemptData2.path.actual_path)
      .map(key => attemptData2.path.actual_path[key])
      .flat()
      .map(({ path, ...item }) => item) // Remove 'path' property
      .sort((a, b) => parseFloat(a.time) - parseFloat(b.time)); // Sort based on time

    //  For Loading user 2
    for (let i = 0; i < pathlessData2.length; i++) {
      const point = pathlessData2[i];
      if (point.loadingstatus === "1") {
        if (startInterval1 === null) {
          startInterval1 = point.time;
        }
        pieces.push({
          lte: i + 1,
          color: "red"
        });
      } else {
        if (startInterval1 !== null) {
          intervals_user2_load.push([
            { name: "Loading", xAxis: startInterval1 },
            { name: "Loading", xAxis: point.time }
          ]);
          startInterval1 = null;
        }
        // pieces.push({
        //   lte: i + 1,
        //   color: "green"
        // });
      }
    }
    if (startInterval1 !== null) {
      intervals_user2_load.push([
        { name: "Loading", xAxis: startInterval1 },
        { name: "Loading", xAxis: pathlessData2[pathlessData2.length - 1].time }
      ]);
    }

    //  For Unloading user 2
    // Process pathlessData2 to identify intervals_user1_load for loading status
    for (let i = 0; i < pathlessData2.length; i++) {
      const point = pathlessData2[i];
      if (point.unloadingstatus === "1") {
        if (startInterval2 === null) {
          startInterval2 = point.time;
        }
        pieces.push({
          lte: i + 1,
          color: "red"
        });
      } else {
        if (startInterval2 !== null) {
          intervals_user2_unload.push([
            { name: "Unloading", xAxis: startInterval2 },
            { name: "Unloading", xAxis: point.time }
          ]);
          startInterval2 = null;
        }
        // pieces.push({
        //   lte: i + 1,
        //   color: "green"
        // });
      }
    }
    if (startInterval2 !== null) {
      intervals_user2_unload.push([
        { name: "Unloading", xAxis: startInterval2 },
        { name: "Unloading", xAxis: pathlessData2[pathlessData2.length - 1].time }
      ]);
    }

    // Getting RPm data for user 2
    rpmData1 = pathlessData2.map(item => item.rpm);

    // mode duration for user 2
    pathlessData2.forEach((item, index) => {
      const currentMode = item.mode;
      const currentTime = parseFloat(item.time);

      if (lastMode1 !== currentMode) {
        if (lastMode1 !== null) {
          // Calculate duration for the last mode
          modeDurations_User2[lastMode1] =
            (modeDurations_User2[lastMode1] || 0) + (currentTime - lastTime1);
        }
        // Update last mode and time
        lastMode1 = currentMode;
        lastTime1 = currentTime;
      } else if (index === pathlessData2.length - 1) {
        // Calculate duration for the last mode entry
        modeDurations_User2[currentMode] =
          (modeDurations_User2[currentMode] || 0) + (currentTime - lastTime1);
      }
    });
  }
  let speedDataFiltered2 = [];
  let speedDataFiltered1_2 = [];
  let additionalSpeedData2 = [];

  if (attemptData2 && attemptData2.path && attemptData2.path.actual_path) {
    const filteredData2 = Object.keys(attemptData2.path.actual_path)
      .map(key => attemptData2.path.actual_path[key])
      .flat();

    // Loading Area
    speedDataFiltered2 = filteredData2
      .filter(item => item.loadingarea === "1")
      .map(item => ({
        value: [item.time, parseFloat(item.speed)],
        symbol: "none"
      }))
      .sort((a, b) => parseFloat(a.value[0]) - parseFloat(b.value[0]));

    // Dumping Area
    speedDataFiltered1_2 = filteredData2
      .filter(item => item.dumpingarea === "1")
      .map(item => ({
        value: [item.time, parseFloat(item.speed)],
        symbol: "none"
      }))
      .sort((a, b) => parseFloat(a.value[0]) - parseFloat(b.value[0]));

    // Parking Area
    additionalSpeedData2 = filteredData2
      .filter(item => item.parkingarea === "1")
      .map(item => ({
        value: [item.time, parseFloat(item.speed)],
        symbol: "none"
      }))
      .sort((a, b) => parseFloat(a.value[0]) - parseFloat(b.value[0]));
  }

  let filteredData = [];
  if (attemptData && attemptData.path && attemptData.path.actual_path) {
    filteredData = Object.keys(attemptData.path.actual_path)
      .map(key => attemptData.path.actual_path[key])
      .flat();
  }

  const getCollisionCount = gear => {
    let count = 0;
    filteredData.forEach(item => {
      if (item.gear === gear) {
        let collisionCount = 0;

        // Check the selectedCollisionType and calculate accordingly
        switch (selectedCollisionType) {
          case "pedestrial":
            collisionCount = parseInt(item.pedestrial_colloision, 10) || 0;
            break;
          case "object":
            collisionCount = parseInt(item.object_colloision, 10) || 0;
            break;
          case "mines":
            collisionCount = parseInt(item.mines_colloision, 10) || 0;
            break;
          case "total": // Assuming 'total' is the key for total collisions
            collisionCount = parseInt(item.collisionStatus, 10) || 0;
            break;
          case "all":
            // Sum all collision types for 'All' option
            collisionCount += parseInt(item.pedestrial_colloision, 10) || 0;
            collisionCount += parseInt(item.object_colloision, 10) || 0;
            collisionCount += parseInt(item.mines_colloision, 10) || 0;
            collisionCount += parseInt(item.collisionStatus, 10) || 0;
            break;
          // Default case if needed
        }

        count += collisionCount;
      }
    });
    return count;
  };

  let attemptData2PathData = []

  if (attemptData2 && attemptData2.path && attemptData2.path.actual_path) {
    attemptData2PathData = [
      ...attemptData2.path.actual_path.path1,
      ...attemptData2.path.actual_path.path0,
      ...attemptData2.path.actual_path["path-1"]
    ];
  }

  // const getCollisionCountAttemptData2 = (gear, attemptData2, selectedCollisionType) => {
  //   let count = 0;
  //   attemptData2.forEach(item => {
  //     if (item.gear === gear) {
  //       let collisionCount = 0;

  //       // Check the selectedCollisionType and calculate accordingly
  //       switch (selectedCollisionType) {
  //         case "pedestrial":
  //           collisionCount = parseInt(item.pedestrial_colloision, 10) || 0;
  //           break;
  //         case "object":
  //           collisionCount = parseInt(item.object_colloision, 10) || 0;
  //           break;
  //         case "mines":
  //           collisionCount = parseInt(item.mines_colloision, 10) || 0;
  //           break;
  //         case "total": // Assuming 'total' is the key for total collisions
  //           collisionCount = parseInt(item.collisionStatus, 10) || 0;
  //           break;
  //         case "all":
  //           // Sum all collision types for 'All' option
  //           collisionCount += parseInt(item.pedestrial_colloision, 10) || 0;
  //           collisionCount += parseInt(item.object_colloision, 10) || 0;
  //           collisionCount += parseInt(item.mines_colloision, 10) || 0;
  //           collisionCount += parseInt(item.collisionStatus, 10) || 0;
  //           break;
  //         // Default case if needed
  //       }

  //       count += collisionCount;
  //     }
  //   });
  //   return count;
  // };

  const getCollisionCount2 = gear => {
    let count = 0;
    attemptData2PathData.forEach(item => {
      if (item.gear === gear) {
        let collisionCount = 0;

        // Check the selectedCollisionType and calculate accordingly
        switch (selectedCollisionType) {
          case "pedestrial":
            collisionCount = parseInt(item.pedestrial_colloision, 10) || 0;
            break;
          case "object":
            collisionCount = parseInt(item.object_colloision, 10) || 0;
            break;
          case "mines":
            collisionCount = parseInt(item.mines_colloision, 10) || 0;
            break;
          case "total": // Assuming 'total' is the key for total collisions
            collisionCount = parseInt(item.collisionStatus, 10) || 0;
            break;
          case "all":
            // Sum all collision types for 'All' option
            collisionCount += parseInt(item.pedestrial_colloision, 10) || 0;
            collisionCount += parseInt(item.object_colloision, 10) || 0;
            collisionCount += parseInt(item.mines_colloision, 10) || 0;
            collisionCount += parseInt(item.collisionStatus, 10) || 0;
            break;
          // Default case if needed
        }

        count += collisionCount;
      }
    });
    return count;
  };


  const getFilteredDataByArea = () => {
    switch (selectedArea) {
      case 'loading':
        return speedDataFiltered;
      case 'dumping':
        return speedDataFiltered1;
      case 'parking':
        return additionalSpeedData;
      default:
        return null; // Return null or an appropriate default value
    }
  };

  const filteredChartData = getFilteredDataByArea();

  // const speedTimeData = attemptData.map(item => {
  //   return [parseFloat(item.time), parseFloat(item.speed)];
  // });

  const gears = Object.keys(maxSpeedByGear);
  const maxSpeeds = Object.values(maxSpeedByGear);

  const gears1 = Object.keys(collisionCountByGear);
  // const totalCollisions = Object.values(collisionCountByGear);

  const totalTime = kpiValues.reduce((acc, val) => acc + val, 0) / 60; // Convert total to hours

  const pieChartData = Object.keys(modeDurations).map(mode => {
    return { name: mode, value: modeDurations[mode] };
  });


  // pathless data variables

  const PathlessData = filteredData.map(({ path, ...item }) => item);

  const sortedPathlessData = PathlessData.sort((a, b) => (parseFloat(a.time) > parseFloat(b.time)) ? 1 : -1);

  const PathlessTimeData = sortedPathlessData.map(item => item.time);
  const PathlessSpeedData = sortedPathlessData.map(item => item.speed);
  const PathlessAccelerationData = sortedPathlessData.map(item => item.acceleration);
  const PathlessBreakData = sortedPathlessData.map(item => item.brake);

  let pathlessTimeData2 = [];
  let pathlessAccelerationData2 = [];
  let pathlessBrakeData2 = [];
  let PathlessSpeedData2 = [];


  const pieChartDataUser2 = Object.keys(modeDurations_User2).map(mode => {
    return { name: mode, value: modeDurations_User2[mode] };
  });

  if (attemptData2 && attemptData2.path && attemptData2.path.actual_path) {
    const pathlessData2 = Object.keys(attemptData2.path.actual_path)
      .map(key => attemptData2.path.actual_path[key])
      .flat()
      .map(({ path, ...item }) => item) // Remove 'path' property and extract the rest
      .sort((a, b) => parseFloat(a.time) - parseFloat(b.time)); // Sort based on time

    pathlessTimeData2 = pathlessData2.map(item => item.time);
    pathlessAccelerationData2 = pathlessData2.map(item => item.acceleration);
    pathlessBrakeData2 = pathlessData2.map(item => item.brake);
    PathlessSpeedData2 = pathlessData2.map(item => item.speed);
  }

  const vehicleChartOptions = {
    // acc and break graph
    title: {
      text: compare ? "Vehicle Analytics - User 1" : "Vehicle Analytics",
      subtext: "Acceleration vs break with respect to time",
      left: "center"
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        animation: false
      },
      formatter: function (params) {
        // Assuming the first series in the params array corresponds to the time axis label
        let timeValue = params[0].axisValueLabel; // Or params[0].axisValue if axisValueLabel is not available        

        let result = `Time: ${Number(timeValue).toFixed(2)} sec`; // Prepend 'Time: ' to the axis value (time)           

        // Append other series data
        params.forEach(param => {
          result += `<br/>${param.marker}${param.seriesName}: ${Number(param.value).toFixed(2)}`;

        });

        // params.forEach(param1 => {
        //   result1 += `<br/>${param1.marker}${param1.seriesName}: ${param1.value}`;
        // });

        return result;
      }
    },
    legend: {
      data: compare ? ["Acceleration - User 1", "Brake - User 1"] : ["Acceleration", "Brake"],
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
        left: 60,
        right: 50,
        height: "30%"
      },
      {
        left: 60,
        right: 50,
        top: "55%",
        height: "30%"
      }
    ],
    xAxis: [
      {
        type: "category",
        boundaryGap: false,
        axisLine: { onZero: true },
        // data: timeData
        data: PathlessTimeData
      },
      {
        gridIndex: 1,
        type: "category",
        boundaryGap: false,
        axisLine: { onZero: true },
        // data: timeData,
        data: PathlessTimeData
        // position: "top"
      }
    ],
    yAxis: [
      {
        name: "Acceleration",
        type: "value",
        max: 1,
        formatter: "{value}%"
      },
      {
        gridIndex: 1,
        name: "Brake",
        type: "value",
        inverse: false,
        nameLocation: "middle", // Place the name in the middle of the axis
        nameGap: 35,
        max: 1,
        formatter: "{value}"
      }
    ],
    series: [
      {
        name: compare ? "Acceleration - User 1" : "Acceleration",
        type: "line",
        symbolSize: 8,
        hoverAnimation: false,
        data: PathlessAccelerationData
      },
      {
        name: compare ? "Brake - User 1" : "Brake",
        type: "line",
        xAxisIndex: 1,
        yAxisIndex: 1,
        symbolSize: 8,
        hoverAnimation: false,
        data: PathlessBreakData
      }
    ]
  };
  const vehicleChartOptionscomp = {
    // acc and break graph
    title: {
      text: compare ? "Vehicle Analytics - User 2" : "Vehicle Analytics",
      subtext: "Speed vs time graph",
      left: "center"
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        animation: false
      },
      formatter: function (params) {
        // Assuming the first series in the params array corresponds to the time axis label
        let timeValue = params[0].axisValueLabel; // Or params[0].axisValue if axisValueLabel is not available
        let result = `Time: ${Number(timeValue).toFixed(2)} sec`; // Prepend 'Time: ' to the axis value (time)

        // Append other series data
        params.forEach(param => {
          result += `<br/>${param.marker}${param.seriesName}: ${Number(param.value).toFixed(2)}`;
        });

        return result;
      }
    },
    legend: {
      data: ["Acceleration - User 2", "Brake - User 2"],
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
        left: 60,
        right: 50,
        height: "30%"
      },
      {
        left: 60,
        right: 50,
        top: "55%",
        height: "30%"
      }
    ],
    xAxis: [
      {
        type: "category",
        boundaryGap: false,
        axisLine: { onZero: true },
        data: pathlessTimeData2
      },
      {
        gridIndex: 1,
        type: "category",
        boundaryGap: false,
        axisLine: { onZero: true },
        data: pathlessTimeData2,
        // position: "top"
      }
    ],
    yAxis: [
      {
        name: "Acceleration",
        type: "value",
        max: 1,
        formatter: "{value}%"
      },
      {
        gridIndex: 1,
        name: "Brake",
        type: "value",
        inverse: false,
        nameLocation: "middle", // Place the name in the middle of the axis
        nameGap: 35,
        max: 1,
        formatter: "{value}"
      }
    ],
    series: [
      {
        name: "Acceleration - User 2",
        type: "line",
        symbolSize: 8,
        hoverAnimation: false,
        data: pathlessAccelerationData2
      },
      {
        name: "Brake - User 2",
        type: "line",
        xAxisIndex: 1,
        yAxisIndex: 1,
        symbolSize: 8,
        hoverAnimation: false,
        data: pathlessBrakeData2
      }
    ]
  };

  const rpmChartOptions = {
    title: {
      text: compare ? ["Rpm Vs Time During Loading - User 1"] : ["Rpm Vs Time During Loading"],
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross"
      },
      formatter: function (params) {
        // Assuming the first series in the params array corresponds to the time axis label
        let timeValue = params[0].axisValueLabel; // Or params[0].axisValue if axisValueLabel is not available
        let result = `Time: ${Number(timeValue).toFixed(2)} sec`; // Prepend 'Time: ' to the axis value (time)

        // Append other series data
        params.forEach(param => {
          if (param.seriesName === "Rpm Vs Time During Loading" || param.seriesName === "Rpm Vs Time During Loading - User 1") {
            result += `<br/>${param.marker}${param.seriesName}: <b>${Number(param.value).toFixed(2)} RPM</b>`;
          }
        });

        return result;
      }
    },

    visualMap: {
      top: 50,
      right: 10,
      pieces: [
        {
          gt: 1500,
          lte: 1800,
          color: 'green'
        }
      ],
      outOfRange: {
        color: 'red'
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
      data: PathlessTimeData,
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
    // visualMap: {
    //   show: false,
    //   dimension: 0,
    //   pieces: pieces
    // },
    legend: {
      // data: ['Ideal Speed at Time of Loading'], // Labels for the legend,
      formatter: function (name) {
        return `Ideal RPM range when status is loading`
      },
      orient: 'vertical', // Vertical layout
      right: '10', // Adjust the right value as needed
      top: '30', // Adjust the top value as needed
    },
    series: [
      {
        name: compare ? "Rpm Vs Time During Loading - User 1" : "Rpm Vs Time During Loading",
        type: "line",
        smooth: true,
        data: rpmData,
        markArea: {
          itemStyle: {
            color: "rgba(255, 173, 177, 0.4)"
          },
          data: intervals
        }
      },
      {
        // name: "Ideal RPM Range During Loading",
        type: 'line',
        data: Array.from({ length: PathlessTimeData.length }),
        markArea: {
          itemStyle: {
            color: "#e6ffe6" //green
          },
          data: [
            [   // New mark area for RPM 1000 to 1500
              { yAxis: 1500 },
              { yAxis: 1800 }
            ]
          ]
        },
        showSymbol: false, // Hide data points for the ideal line
      }
    ]
  };

  let rpmData2 = [];

  if (attemptData2 && attemptData2.path && attemptData2.path.actual_path) {
    // Flatten and extract the RPM data from attemptData2
    const pathlessData2 = Object.keys(attemptData2.path.actual_path)
      .map(key => attemptData2.path.actual_path[key])
      .flat()
      .map(({ path, ...item }) => item); // Remove 'path' property

    rpmData2 = pathlessData2.map(item => parseFloat(item.rpm));
  }



  const rpmChartOptions1 = {
    title: {
      text: "Rpm Vs Time During Loading - User 2"
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross"
      },
      formatter: function (params) {
        // Assuming the first series in the params array corresponds to the time axis label
        let timeValue = params[0].axisValueLabel; // Or params[0].axisValue if axisValueLabel is not available
        let result = `Time: ${Number(timeValue).toFixed(2)} sec`; // Prepend 'Time: ' to the axis value (time)

        // Append other series data
        params.forEach(param => {
          if (param.seriesName === "Rpm Vs Time During Loading - User 2") {
            result += `<br/>${param.marker}${param.seriesName}: <b>${Number(param.value).toFixed(2)} RPM</b>`;
          }
        });

        return result;
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
      data: pathlessTimeData2,
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
      top: 50,
      right: 10,
      pieces: [
        {
          gt: 1500,
          lte: 1800,
          color: 'green'
        }
      ],
      outOfRange: {
        color: 'red'
      }
    },
    legend: {
      // data: ['Ideal Speed at Time of Loading'], // Labels for the legend,
      formatter: function (name) {
        return `Ideal RPM range when status is loading`
      },
      orient: 'vertical', // Vertical layout
      right: '10', // Adjust the right value as needed
      top: '30', // Adjust the top value as needed
    },
    series: [
      {
        name: "Rpm Vs Time During Loading - User 2",
        type: "line",
        smooth: true,
        data: rpmData1,
        markArea: {
          itemStyle: {
            color: "rgba(255, 173, 177, 0.4)"
          },
          data: intervals_user2_load
        }
      },
      {
        // name: "Ideal RPM Range During Loading",
        type: 'line',
        data: Array.from({ length: PathlessTimeData.length }),
        markArea: {
          itemStyle: {
            color: "#e6ffe6" //green
          },
          data: [
            [   // New mark area for RPM 1000 to 1500
              { yAxis: 1500 },
              { yAxis: 1800 }
            ]
          ]
        },
        showSymbol: false, // Hide data points for the ideal line
      }
    ]
  };
  const handleCollisionTypeChange = event => {
    setSelectedCollisionType(event.target.value);
  };
  const handleAreaChange = (event) => {
    setSelectedArea(event.target.value);
  };

  const getGearChartData = () => {
    switch (selectedCollisionType) {
      case "pedestrial":
        // return data for pedestrian collisions
        break;
      case "object":
        // return data for object collisions
        break;
      // ... handle other cases
      default:
        return totalCollisions;
    }
  };

  const rpmChartUnloading = {
    title: {
      text: compare ? ["Rpm Vs Time During Unloading - User 1"] : ["Rpm Vs Time During Unloading"],
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross"
      },
      formatter: function (params) {
        // Assuming the first series in the params array corresponds to the time axis label
        let timeValue = params[0].axisValueLabel; // Or params[0].axisValue if axisValueLabel is not available
        let result = `Time: ${Number(timeValue).toFixed(2)} sec`; // Prepend 'Time: ' to the axis value (time)

        // Append other series data
        params.forEach(param => {
          if (param.seriesName === "Rpm Vs Time During Unloading - User 1" || param.seriesName === "Rpm Vs Time During Unloading") {
            result += `<br/>${param.marker}${param.seriesName}: <b>${Number(param.value).toFixed(2)} RPM</b>`;
          }
        });

        return result;
      }

    },
    visualMap: {
      top: 50,
      right: 10,
      pieces: [
        {
          gt: 1500,
          lte: 1800,
          color: 'green'
        }
      ],
      outOfRange: {
        color: 'red'
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
      data: PathlessTimeData,
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
    // visualMap: {
    //   show: false,
    //   dimension: 0,
    //   pieces: pieces
    // },
    legend: {
      formatter: function (name) {
        return ` Ideal RPM range when status is Unloading`;
      },
      // data: ['Ideal Speed at Time of Loading'], // Labels for the legend
      orient: 'vertical', // Vertical layout
      right: '10', // Adjust the right value as needed
      top: '30', // Adjust the top value as needed,      
    },
    series: [
      {
        name: compare ? "Rpm Vs Time During Unloading - User 1" : "Rpm Vs Time During Unloading",
        type: "line",
        smooth: true,
        data: rpmData,
        markArea: {
          itemStyle: {
            color: "rgba(255, 173, 177, 0.4)"
          },
          data: intervalsunloading
        }
      },
      {
        // name: "Ideal RPM Range During Loading",
        type: 'line',
        data: Array.from({ length: PathlessTimeData.length }),
        markArea: {
          itemStyle: {
            color: "#e6ffe6" //green
          },
          data: [
            [   // New mark area for RPM 1000 to 1500
              { yAxis: 1500 },
              { yAxis: 1800 }
            ]
          ]
        },
        showSymbol: false, // Hide data points for the ideal line
      }
    ]
  };

  const rpmChartUnloading1 = {
    title: {
      text: compare ? ["Rpm Vs Time During UnLoading - User 2"] : ["Rpm Vs Time During Loading"],
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross"
      },
      formatter: function (params) {
        // Assuming the first series in the params array corresponds to the time axis label
        let timeValue = params[0].axisValueLabel; // Or params[0].axisValue if axisValueLabel is not available
        let result = `Time: ${Number(timeValue).toFixed(2)} sec`; // Prepend 'Time: ' to the axis value (time)

        // Append other series data
        params.forEach(param => {
          if (param.seriesName === "Rpm Vs Time During UnLoading - User 2") {
            result += `<br/>${param.marker}${param.seriesName}: <b>${Number(param.value).toFixed(2)} RPM</b>`;
          }
        });

        return result;
      }
    },
    visualMap: {
      top: 50,
      right: 10,
      pieces: [
        {
          gt: 1500,
          lte: 1800,
          color: 'green'
        }
      ],
      outOfRange: {
        color: 'red'
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
      data: pathlessTimeData2,
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
    // visualMap: {
    //   show: false,
    //   dimension: 0,
    //   pieces: pieces
    // },
    legend: {
      // data: ['Ideal Speed at Time of Loading'], // Labels for the legend
      formatter: function (name) {
        return ` Ideal RPM range when status is Unloading`;
      },
      orient: 'vertical', // Vertical layout
      right: '10', // Adjust the right value as needed
      top: '30', // Adjust the top value as needed
    },
    series: [
      {
        name: "Rpm Vs Time During UnLoading - User 2",
        type: "line",
        smooth: true,
        data: rpmData1,
        markArea: {
          itemStyle: {
            color: "rgba(255, 173, 177, 0.4)"
          },
          data: intervals_user2_unload
        }
      },
      {
        // name: "Ideal RPM Range During Loading",
        type: 'line',
        data: Array.from({ length: PathlessTimeData.length }),
        markArea: {
          itemStyle: {
            color: "#e6ffe6" //green
          },
          data: [
            [   // New mark area for RPM 1000 to 1500
              { yAxis: 1500 },
              { yAxis: 1800 }
            ]
          ]
        },
        showSymbol: false, // Hide data points for the ideal line
      }
    ]
  };

  const series1 = [
    {
      // gear colloision graph
      name: "Max Speed",
      type: "column",
      data: maxSpeeds
    },
    {
      name: "Total Collisions",
      type: "line",
      data: gears1.map(gear => getCollisionCount(gear))
    }

  ];
  const options1 = {
    chart: {
      height: 350,
      type: "line"
    },
    tooltip: {
      x: {
        show: true,
        formatter: function (
          value,
          { series, seriesIndex, dataPointIndex, w }
        ) {
          // Fetch the gear name using dataPointIndex
          const gearName = gears1[dataPointIndex];
          // return "Gear: " + gearName; // Displays "Gear: N" for the first bar, "Gear: D" for the second, etc.
          return '<div style="color: black;">Gear: ' + gearName + '</div > ';
        }
      }
    },
    stroke: {
      width: [0, 4]
    },
    title: {
      text: compare ? "Gear Collision Graph - User 1" : "Gear Collision Graph",
    },
    dataLabels: {
      enabled: true,
      enabledOnSeries: [1]
    },
    labels: gears1,
    xaxis: {
      type: "category",
      categories: gears1, // gear names for the x-axis labels
      title: {
        text: "Gears", // Title for the x-axis
        style: {
          fontFamily: "Helvetica, Arial, sans-serif",
          fontWeight: 600
          // other style properties as needed
        }
      }
    },

    yaxis: [
      {
        title: {
          text: "Speed"
        }
      },
      {
        opposite: true,
        title: {
          text: "Total Collisions"
        }
      }
    ]

  };
  let maxSpeedByGear1 = {};
  let collisionCountByGear1 = {};

  if (attemptData2 && attemptData2.path && attemptData2.path.actual_path) {
    // Flatten the data from attemptData2
    const pathlessData2 = Object.keys(attemptData2.path.actual_path)
      .map(key => attemptData2.path.actual_path[key])
      .flat();

    pathlessData2.forEach(item => {
      const gear = item.gear;
      const speed = parseFloat(item.speed);
      const collisionStatus = parseInt(item.collisionStatus, 10);

      // Max speed calculation
      if (!maxSpeedByGear1[gear] || maxSpeedByGear1[gear] < speed) {
        maxSpeedByGear1[gear] = speed;
      }

      // Collision count calculation
      collisionCountByGear1[gear] = (collisionCountByGear1[gear] || 0) + (collisionStatus === 1 ? 1 : 0);
    });
  }

  // Get gears and max speeds for attemptData2
  const gears2 = Object.keys(maxSpeedByGear1);
  const maxSpeeds2 = Object.values(maxSpeedByGear1);

  const series2 = [
    {
      // gear colloision graph
      name: "Max Speed",
      type: "column",
      data: maxSpeeds2
    },
    {
      name: "Total Collisions",
      type: "line",
      data: gears2.map(gear => getCollisionCount2(gear) || 0)
    }
  ];
  const options2 = {
    chart: {
      height: 350,
      type: "line"
    },
    tooltip: {
      x: {
        show: true,
        formatter: function (
          value,
          { series, seriesIndex, dataPointIndex, w }
        ) {
          // Fetch the gear name using dataPointIndex
          const gearName = gears2[dataPointIndex];
          return "Gear: " + gearName; // Displays "Gear: N" for the first bar, "Gear: D" for the second, etc.
        }
      }
    },
    stroke: {
      width: [0, 4]
    },
    title: {
      text: compare ? "Gear Collision Graph - User 2" : "Gear Collision Graph",
    },
    dataLabels: {
      enabled: true,
      enabledOnSeries: [1]
    },
    labels: gears2,
    xaxis: {
      type: "category",
      categories: gears2, // gear names for the x-axis labels
      title: {
        text: "Gears", // Title for the x-axis
        style: {
          fontFamily: "Helvetica, Arial, sans-serif",
          fontWeight: 600
          // other style properties as needed
        }
      }
    },

    yaxis: [
      {
        title: {
          text: "Speed"
        }
      },
      {
        opposite: true,
        title: {
          text: "Total Colloision"
        }
      }
    ]
  };

  const optionspeed = {
    title: {
      text: compare ? "Speed vs Time - User 1" : "Speed vs Time",
      subtext: "Vehicle Speed Analysis",
      left: "center"
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross"
      },

      formatter: function (params) {
        return `Time: ${params[0].axisValue} sec <br/>Speed: ${(params[0].data[1]).toFixed(2)} m/s`; // Display speed in m/s
      }
    },
    // legend: {
    //   data: ["Speed"],
    //   left: "10%"
    // },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%", // Increase this value to move the chart up
      containLabel: true
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: PathlessTimeData,
      axisLabel: {
        formatter: function (value) {
          return `${value} s`;
        }
      }
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "{value} m/s",
        show: true
      }
    },
    series: [
      {
        name: "Speed",
        type: "line",
        smooth: true,
        lineStyle: {
          color: "#007bff",
          width: 2
        },
        itemStyle: {
          color: "#007bff"
        },
        areaStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "rgba(0, 123, 255, 0.5)" // top color
              },
              {
                offset: 1,
                color: "rgba(0, 123, 255, 0)" // bottom color, more transparent
              }
            ])
          }
        },
        // added pathless speed
        data: PathlessSpeedData.map((speed, index) => [
          PathlessTimeData[index],
          parseFloat(speed)
        ])
      }
    ],
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 100
      },
      {
        start: 0,
        end: 10,
        handleIcon: "M8.2,13.6V4H11v9.6L15.5,18H20v3H0v-3h4.5L8.2,13.6z",
        handleSize: "80%",
        handleStyle: {
          color: "#fff",
          shadowBlur: 3,
          shadowColor: "rgba(0, 0, 0, 0.6)",
          shadowOffsetX: 2,
          shadowOffsetY: 2
        }
      }
    ],
    animation: {
      duration: 1000,
      easing: "cubicInOut"
    }
  };


  const optionspeedcomp = {
    title: {
      text: "Speed vs Time - User 2",
      subtext: "Vehicle Speed Analysis",
      left: "center"
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross"
      },
      formatter: function (params) {
        return `Time: ${params[0].axisValue} sec <br/>Speed: ${params[0].data[1]} m/s`;
      }
    },
    legend: {
      data: ["Speed - User 2"],
      left: "10%"
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%", // Increase this value to move the chart up
      containLabel: true
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: pathlessTimeData2,
      axisLabel: {
        formatter: function (value) {
          return `${value} s`;
        }
      }
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "{value} km/h"
      }
    },
    series: [
      {
        name: "Speed - User 2",
        type: "line",
        smooth: true,
        lineStyle: {
          color: "#007bff",
          width: 2
        },
        itemStyle: {
          color: "#007bff"
        },
        areaStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "rgba(0, 123, 255, 0.5)" // top color
              },
              {
                offset: 1,
                color: "rgba(0, 123, 255, 0)" // bottom color, more transparent
              }
            ])
          }
        },
        data: PathlessSpeedData2
      }
    ],
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 100
      },
      {
        start: 0,
        end: 10,
        handleIcon: "M8.2,13.6V4H11v9.6L15.5,18H20v3H0v-3h4.5L8.2,13.6z",
        handleSize: "80%",
        handleStyle: {
          color: "#fff",
          shadowBlur: 3,
          shadowColor: "rgba(0, 0, 0, 0.6)",
          shadowOffsetX: 2,
          shadowOffsetY: 2
        }
      }
    ],
    animation: {
      duration: 1000,
      easing: "cubicInOut"
    }
  };

  const chartConfig = {

    series: kpiValues.map(value => parseFloat(parseFloat(value).toFixed(1))),
    options: {
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " sec"; // Add " sec" after the value
          }
        }
      },
      chart: {
        width: 380,
        type: "donut",
        dropShadow: {
          enabled: true,
          color: "#111",
          top: -1,
          left: 3,
          blur: 3,
          opacity: 0.2
        }
      },
      stroke: {
        width: 0
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              total: {
                showAlways: true,
                show: true,
                label: "Total Hours",
                formatter: function () {
                  return totalTime.toFixed(2) + " hrs";
                }
              }
            }
          }
        }
      },
      labels: kpiNames,
      dataLabels: {
        dropShadow: {
          blur: 3,
          opacity: 0.8
        }
      },
      fill: {
        type: "pattern",
        opacity: 1,
        pattern: {
          enabled: true,
          style: [
            "verticalLines",
            "squares",
            "horizontalLines",
            "circles",
            "slantedLines"
          ]
        }
      },
      states: {
        hover: {
          filter: "none"
        }
      },
      theme: {
        palette: "palette2"
      },
      title: {
        text: compare ? "Different Task Time KPI-User 1" : "",
        align: 'center',
        style: {
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '20px',
          color: '#34495e',
          textShadow: '0px 1px 2px rgba(0, 0, 0, 0.5)',
          padding: '10px',
          borderRadius: '5px',
          background: 'linear-gradient(to right, #bdc3c7, #2c3e50)', // Gradient background
        }
      },
      legend: {
        show: true,
        position: "top" // Set this property to false to hide the legend
      }
      // ... other configurations if necessary
    }
  };

  const chartConfig1 = {

    series: kpiValues2.map(value => parseFloat(parseFloat(value).toFixed(1))),
    options: {
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " sec"; // Add " sec" after the value
          }
        }
      },
      chart: {
        width: 380,
        type: "donut",
        dropShadow: {
          enabled: true,
          color: "#111",
          top: -1,
          left: 3,
          blur: 3,
          opacity: 0.2
        }
      },
      stroke: {
        width: 0
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              total: {
                showAlways: true,
                show: true,
                label: "Total Hours",
                formatter: function () {
                  return totalTime.toFixed(2) + " hrs";
                }
              }
            }
          }
        }
      },
      labels: kpiNames2,
      dataLabels: {
        dropShadow: {
          blur: 3,
          opacity: 0.8
        }
      },
      fill: {
        type: "pattern",
        opacity: 1,
        pattern: {
          enabled: true,
          style: [
            "verticalLines",
            "squares",
            "horizontalLines",
            "circles",
            "slantedLines"
          ]
        }
      },
      states: {
        hover: {
          filter: "none"
        }
      },
      theme: {
        palette: "palette2"
      },
      title: {
        text: "Different Task Time KPI-User 2",
        align: 'center',
        style: {
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '20px',
          color: '#34495e',
          textShadow: '0px 1px 2px rgba(0, 0, 0, 0.5)',
          padding: '10px',
          borderRadius: '5px',
          background: 'linear-gradient(to right, #bdc3c7, #2c3e50)', // Gradient background
        }
      },
      legend: {
        show: true,
        position: "top" // Set this property to false to hide the legend
      }
      // ... other configurations if necessary
    }
  };

  const option1 = {
    // pie chart of different mode
    tooltip: {
      trigger: "item",
      formatter: function (params) {
        // params.value[0] for category name, params.value[1] for value
        let name = params.name;
        let value = params.value;
        let percentage = params.percent;
        return `${name}: ${value.toFixed(1)} sec (${percentage}%)`;
      }
    },
    legend: {
      orient: "vertical",
      left: 10,
      data: pieChartData.map(item => item.name)
    },
    series: [
      {
        name: "Time (sec)",
        type: "pie",
        radius: ["40%", "55%"],
        label: {
          formatter: "{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ",
          backgroundColor: "#eee",
          borderColor: "#aaa",
          borderWidth: 1,
          borderRadius: 4,
          // shadowBlur:3,
          // shadowOffsetX: 2,
          // shadowOffsetY: 2,
          // shadowColor: '#999',
          // padding: [0, 7],
          rich: {
            a: {
              color: "#999",
              lineHeight: 22,
              align: "center"
            },
            // abg: {
            //     backgroundColor: '#333',
            //     width: '100%',
            //     align: 'right',
            //     height: 22,
            //     borderRadius: [4, 4, 0, 0]
            // },
            hr: {
              borderColor: "#aaa",
              width: "100%",
              borderWidth: 0.5,
              height: 0
            },
            b: {
              fontSize: 16,
              lineHeight: 33
            },
            per: {
              color: "#eee",
              backgroundColor: "#334455",
              padding: [2, 4],
              borderRadius: 2
            }
          }
        },
        data: pieChartData.map(item => ({
          name: item.name,
          value: parseFloat(item.value.toFixed(2)) // Round the value to 2 decimal places
        }))
      }
    ]
  };

  const optionpiecomp = {
    // pie chart of different mode
    tooltip: {
      trigger: "item",
      formatter: function (params) {
        // params.value[0] for category name, params.value[1] for value
        let name = params.name;
        let value = params.value;
        let percentage = params.percent;
        return `${name}: ${value.toFixed(1)} (${percentage}%)`;
      }
    },
    legend: {
      orient: "vertical",
      left: 10,
      data: pieChartData.map(item => item.name)
    },
    series: [
      {
        name: "Time (sec)",
        type: "pie",
        radius: ["40%", "55%"],
        label: {
          formatter: "{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ",
          backgroundColor: "#eee",
          borderColor: "#aaa",
          borderWidth: 1,
          borderRadius: 4,
          // shadowBlur:3,
          // shadowOffsetX: 2,
          // shadowOffsetY: 2,
          // shadowColor: '#999',
          // padding: [0, 7],
          rich: {
            a: {
              color: "#999",
              lineHeight: 22,
              align: "center"
            },
            // abg: {
            //     backgroundColor: '#333',
            //     width: '100%',
            //     align: 'right',
            //     height: 22,
            //     borderRadius: [4, 4, 0, 0]
            // },
            hr: {
              borderColor: "#aaa",
              width: "100%",
              borderWidth: 0.5,
              height: 0
            },
            b: {
              fontSize: 16,
              lineHeight: 33
            },
            per: {
              color: "#eee",
              backgroundColor: "#334455",
              padding: [2, 4],
              borderRadius: 2
            }
          }
        },
        data: pieChartData.map(item => ({
          name: item.name,
          value: parseFloat(item.value.toFixed(2)) // Round the value to 2 decimal places
        }))
      }
    ]
  };

  const getLoadingAreaOption = () => {
    return {
      title: {
        text: 'Loading Area (Speed should be below 5)-User 1',
        left: 'center',
        textStyle: { fontSize: 14 }
      },
      tooltip: {
        trigger: 'axis',
        formatter: params => {
          let result = `Time: ${Number(params[0].axisValue).toFixed(2)} sec<br/>`;
          params.forEach(param => {
            const speedValue = param.data.value[1];
            const color = speedValue > 5 ? '#FF0000' : '#00FF00'; // Red if speed > 5, green otherwise
            result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>`;
            result += `Speed: ${speedValue} m/s<br/>`;
          });
          return result;
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: PathlessTimeData,
        name: 'Time (sec)',
        nameLocation: 'middle',
        nameGap: 30
      },
      yAxis: {
        type: 'value',
        name: 'Speed (m/s)',
        nameLocation: 'middle',
        nameGap: 50,
        splitLine: { show: false }
      },
      series: [{
        type: 'line',
        symbol: 'none',
        data: speedDataFiltered,
        markLine: {
          data: [{ name: 'Ideal Speed', yAxis: 5 }],
          label: { formatter: 'Ideal Speed' },
          lineStyle: { type: 'dashed', color: '#f00' }
        },
        lineStyle: {
          normal: { color: params => params.value[1] > 5 ? '#FF0000' : '#00FF00' }
        },
        itemStyle: {
          normal: { color: params => params.value[1] > 5 ? '#FF0000' : '#00FF00' }
        },
        showSymbol: true,
        symbolSize: 4
      }],
      grid: {
        left: '10%',
        right: '10%',
        top: '5%', // Reduced to minimal to make the chart closer to the top
        height: '20%', // Minimal height to ensure more charts fit vertically
      },
    };
  };

  const getLoadingAreaOption2 = () => {
    return {
      title: {
        text: 'Loading Area (Speed should be below 5)-User 2',
        left: 'center',
        textStyle: { fontSize: 14 }
      },
      tooltip: {
        trigger: 'axis',
        formatter: params => {
          let result = `Time: ${Number(params[0].axisValue).toFixed(2)} sec<br/>`;
          params.forEach(param => {
            const speedValue = param.data.value[1];
            const color = speedValue > 5 ? '#FF0000' : '#00FF00'; // Red if speed > 5, green otherwise
            result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>`;
            result += `Speed: ${speedValue} m/s<br/>`;
          });
          return result;
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: pathlessTimeData2,
        name: 'Time (sec)',
        nameLocation: 'middle',
        nameGap: 30
      },
      yAxis: {
        type: 'value',
        name: 'Speed (m/s)',
        nameLocation: 'middle',
        nameGap: 50,
        splitLine: { show: false }
      },
      series: [{
        type: 'line',
        symbol: 'none',
        data: speedDataFiltered2,
        markLine: {
          data: [{ name: 'Ideal Speed', yAxis: 5 }],
          label: { formatter: 'Ideal Speed' },
          lineStyle: { type: 'dashed', color: '#f00' }
        },
        lineStyle: {
          normal: { color: params => params.value[1] > 5 ? '#FF0000' : '#00FF00' }
        },
        itemStyle: {
          normal: { color: params => params.value[1] > 5 ? '#FF0000' : '#00FF00' }
        },
        showSymbol: true,
        symbolSize: 4
      }],
      grid: {
        left: '10%',
        right: '10%',
        top: '5%', // Reduced to minimal to make the chart closer to the top
        height: '20%', // Minimal height to ensure more charts fit vertically
      },
    };
  };
  const getDumpingAreaOption = () => {
    return {
      title: {
        text: 'Dumping Area (Speed should be below 5)-User 1',
        left: 'center',
        top: '3%', // Reduce this percentage to move the title up

        textStyle: { fontSize: 14 }
      },
      tooltip: {
        trigger: 'axis',
        formatter: params => {
          let result = `Time: ${Number(params[0].axisValue).toFixed(2)} sec<br/>`;
          params.forEach(param => {
            const speedValue = param.data.value[1];
            const color = speedValue > 5 ? '#FF0000' : '#00FF00'; // Red if speed > 5, green otherwise
            result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>`;
            result += `Speed: ${speedValue} m/s<br/>`;
          });
          return result;
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: PathlessTimeData,
        name: 'Time (sec)',
        nameLocation: 'middle',
        nameGap: 30
      },
      yAxis: {
        type: 'value',
        name: 'Speed (m/s)',
        nameLocation: 'middle',
        nameGap: 50,
        splitLine: { show: false },
        // You might want to adjust the max setting to ensure the peaks are not clipped
        max: function (value) {
          return value.max + 1; // Add some padding to the top of the yAxis
        }
      },
      series: [{
        type: 'line',
        symbol: 'none',
        data: speedDataFiltered1,
        markLine: {
          data: [{ name: 'Ideal Speed', yAxis: 5 }],
          label: { formatter: 'Ideal Speed' },
          lineStyle: { type: 'dashed', color: '#f00' }
        },
        lineStyle: {
          normal: { color: params => params.value[1] > 5 ? '#FF0000' : '#00FF00' }
        },
        itemStyle: {
          normal: { color: params => params.value[1] > 5 ? '#FF0000' : '#00FF00' }
        },
        showSymbol: true,
        symbolSize: 4
      }],
      grid:  // Adjustments for the Dumping Area grid
      {
        left: '10%',
        right: '10%',
        top: '30%', // Reduced top margin to bring the chart closer to the Loading Area chart
        height: '20%', // Same height as the first chart
        gridIndex: 1
      },
    };
  };
  const getDumpingAreaOption2 = () => {
    return {
      title: {
        text: 'Dumping Area (Speed should be below 5)-User 2',
        left: 'center',
        top: '3%', // Reduce this percentage to move the title up

        textStyle: { fontSize: 14 }
      },
      tooltip: {
        trigger: 'axis',
        formatter: params => {
          let result = `Time: ${Number(params[0].axisValue).toFixed(2)} sec<br/>`;
          params.forEach(param => {
            const speedValue = param.data.value[1];
            const color = speedValue > 5 ? '#FF0000' : '#00FF00'; // Red if speed > 5, green otherwise
            result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>`;
            result += `Speed: ${speedValue} m/s<br/>`;
          });
          return result;
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: pathlessTimeData2,
        name: 'Time (sec)',
        nameLocation: 'middle',
        nameGap: 30
      },
      yAxis: {
        type: 'value',
        name: 'Speed (m/s)',
        nameLocation: 'middle',
        nameGap: 50,
        splitLine: { show: false },
        // You might want to adjust the max setting to ensure the peaks are not clipped
        max: function (value) {
          return value.max + 1; // Add some padding to the top of the yAxis
        }
      },
      series: [{
        type: 'line',
        symbol: 'none',
        data: speedDataFiltered1_2,
        markLine: {
          data: [{ name: 'Ideal Speed', yAxis: 5 }],
          label: { formatter: 'Ideal Speed' },
          lineStyle: { type: 'dashed', color: '#f00' }
        },
        lineStyle: {
          normal: { color: params => params.value[1] > 5 ? '#FF0000' : '#00FF00' }
        },
        itemStyle: {
          normal: { color: params => params.value[1] > 5 ? '#FF0000' : '#00FF00' }
        },
        showSymbol: true,
        symbolSize: 4
      }],
      grid:  // Adjustments for the Dumping Area grid
      {
        left: '10%',
        right: '10%',
        top: '30%', // Reduced top margin to bring the chart closer to the Loading Area chart
        height: '20%', // Same height as the first chart
        gridIndex: 1
      },
    };
  };
  const getParkingAreaOption = () => {
    return {
      title: {
        text: 'Parking Area (Speed should be below 5)-User 1',
        left: 'center',
        top: '37%', // Adjusted to move the title higher

        textStyle: { fontSize: 14 }
      },
      tooltip: {
        trigger: 'axis',
        formatter: params => {
          let result = `Time: ${Number(params[0].axisValue).toFixed(2)} sec<br/>`;
          params.forEach(param => {
            const speedValue = param.data.value[1];
            const color = '#007bff'; // You can choose a color for parking area
            result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>`;
            result += `Speed: ${speedValue} m/s<br/>`;
          });
          return result;
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: PathlessTimeData,
        name: 'Time (sec)',
        nameLocation: 'middle',
        nameGap: 30
      },
      yAxis: {
        type: 'value',
        name: 'Speed (m/s)',
        nameLocation: 'middle',
        nameGap: 50,
        splitLine: { show: false }
      },
      series: [{
        type: 'line',
        symbol: 'circle',
        symbolSize: 5,
        data: additionalSpeedData,
        lineStyle: {
          normal: {
            color: '#FFA500',
            width: 2
          }
        },
        itemStyle: {
          normal: { color: '#FFA500' }
        },
      }],
      grid: {
        left: '10%',
        right: '10%',
        top: '55%', // Further reduced top margin to bring this chart closer to the Dumping Area chart
        height: '20%', // Same height as the other charts
        gridIndex: 2
      }
    };
  };
  const getParkingAreaOption2 = () => {
    return {
      title: {
        text: 'Parking Area (Speed should be below 5)-User 2',
        left: 'center',
        top: '37%', // Adjusted to move the title higher

        textStyle: { fontSize: 14 }
      },
      tooltip: {
        trigger: 'axis',
        formatter: params => {
          let result = `Time: ${Number(params[0].axisValue).toFixed(2)} sec<br/>`;
          params.forEach(param => {
            const speedValue = param.data.value[1];
            const color = '#007bff'; // You can choose a color for parking area
            result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>`;
            result += `Speed: ${speedValue} m/s<br/>`;
          });
          return result;
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: pathlessTimeData2,
        name: 'Time (sec)',
        nameLocation: 'middle',
        nameGap: 30
      },
      yAxis: {
        type: 'value',
        name: 'Speed (m/s)',
        nameLocation: 'middle',
        nameGap: 50,
        splitLine: { show: false }
      },
      series: [{
        type: 'line',
        symbol: 'circle',
        symbolSize: 5,
        data: additionalSpeedData2,
        lineStyle: {
          normal: {
            color: '#FFA500',
            width: 2
          }
        },
        itemStyle: {
          normal: { color: '#FFA500' }
        },
      }],
      grid: {
        left: '10%',
        right: '10%',
        top: '55%', // Further reduced top margin to bring this chart closer to the Dumping Area chart
        height: '20%', // Same height as the other charts
        gridIndex: 2
      }
    };
  };

  const option = {    // option for two lines chart dumping and loading area

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
    //     max: timeData.length - 1
    // }],


    title: [{
      text: compare ? 'Loading Area (speed should be below 5) - User 1' : 'Loading Area (speed should be below 5)',
      left: 'center',
      top: '2%', // Adjust based on your layout
      textStyle: {
        fontSize: 14 // Adjust font size if necessary
      }
    }, {
      text: compare ? 'Dumping Area (Speed should be below 5) - User 1' : 'Dumping Area (Speed should be below 5)',
      left: 'center',
      top: '38%', // Adjust so it's below the first chart
      textStyle: {
        fontSize: 14
      }
    }, {
      text: compare ? 'Parking Area (speed should be below 5) - User 1' : 'Parking Area (speed should be below 5)',
      left: 'center',
      top: '72%', // Adjust so it's below the second chart
      textStyle: {
        fontSize: 14
      }
    }],
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        let result = `Time: ${Number(params[0].axisValue).toFixed(2)} sec<br/>`;

        params.forEach(param => {
          // Assuming each param corresponds to one of the line series
          if (param.data && param.data.value && param.data.value.length === 2) {
            const speedValue = param.data.value[1];
            const color = speedValue > 5 ? '#FF0000' : '#00FF00'; // Red if speed > 5, green otherwise
            result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>`;
            result += `Speed: ${speedValue} m/s<br/>`;
          } else {
            result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:#FF0000;"></span>`;
            result += `Speed: Data Not Available<br/>`;
          }
        });

        return result;
      }
    },
    xAxis: [{
      type: 'category',
      boundaryGap: false,
      data: PathlessTimeData,
      name: 'Time (sec)', // Label for the X-axis
      nameLocation: 'middle', // Location of the label
      nameGap: 30, // Gap b
    }, {
      type: 'category',
      boundaryGap: false,
      data: PathlessTimeData,
      name: 'Time (sec)', // Label for the X-axis
      nameLocation: 'middle', // Location of the label
      nameGap: 30, // Gap b
      gridIndex: 1
    },
    {
      type: 'category',
      boundaryGap: false,
      data: PathlessTimeData,
      name: 'Time (sec)', // Label for the X-axis
      nameLocation: 'middle', // Location of the label
      nameGap: 30, // Gap b
      gridIndex: 2
    }],
    yAxis: [{
      type: 'value',
      name: 'Speed (m/s)', // Label for the Y-axis
      nameLocation: 'middle', // Location of the label
      nameGap: 50, // 
      splitLine: { show: false }
    }, {
      type: 'value',
      name: 'Speed (m/s)', // Label for the Y-axis
      nameLocation: 'middle', // Location of the label
      nameGap: 50, // 
      splitLine: { show: false },
      gridIndex: 1
    },
    {
      type: 'value',
      name: 'Speed (m/s)', // Label for the Y-axis
      nameLocation: 'middle', // Location of the label
      nameGap: 50, // 
      splitLine: { show: false },
      gridIndex: 2
    }],
    grid: [
      // First Chart (Loading Area)
      {
        left: '10%',
        right: '10%',
        top: '10%', // Adjust based on title size
        height: '20%', // Set the height of the chart
      },
      // Second Chart (Dumping Area)
      {
        left: '10%',
        right: '10%',
        top: '44%', // Start below the title of the second chart
        height: '20%',
      },
      // Third Chart (Parking Area)
      {
        left: '10%',
        right: '10%',
        top: '76%', // Start below the title of the third chart
        height: '20%',
      }
    ],
    series: [{
      type: 'line',
      symbol: 'none', // This hides the data point markers
      data: speedDataFiltered1,
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
        }
      },
      lineStyle: {
        normal: {
          color: function (params) {
            // Check if the current segment is above the threshold
            return params.value[1] > 5 ? '#00FF00' : '#00FF00';
          }
        }
      },
      itemStyle: {
        normal: {
          color: function (params) {
            // Apply the same logic to individual points
            return params.value[1] > 5 ? '#00FF00' : '#00FF00';
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
        }
      },
      xAxisIndex: 1,
      yAxisIndex: 1
    },
    {
      name: 'Additional Speed Data', // Give a meaningful name
      type: 'line',
      data: additionalSpeedData,
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
        }
      },
      symbol: 'circle', // or any other symbol you prefer
      symbolSize: 5,
      lineStyle: {
        normal: {
          color: '#FFA500', // A distinct color for this line
          width: 2, // Line width
        }
      },
      itemStyle: {
        normal: {
          color: '#FFA500', // Same as line color for consistency
        }
      },
      xAxisIndex: 2,
      yAxisIndex: 2
    }
    ]
  };

  const option2 = {    // option for two lines chart dumping and loading area

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
    //     max: timeData.length - 1
    // }],


    title: [{
      text: compare ? 'Loading Area (speed should be below 5) - User 2' : 'Loading Area (speed should be below 5)',
      left: 'center',
      top: '2%', // Adjust based on your layout
      textStyle: {
        fontSize: 14 // Adjust font size if necessary
      }
    }, {
      text: compare ? 'Dumping Area (Speed should be below 5) - User 2' : 'Dumping Area (Speed should be below 5)',
      left: 'center',
      top: '38%', // Adjust so it's below the first chart
      textStyle: {
        fontSize: 14
      }
    }, {
      text: compare ? 'Parking Area (speed should be below 5) - User 2' : 'Parking Area (speed should be below 5)',
      left: 'center',
      top: '72%', // Adjust so it's below the second chart
      textStyle: {
        fontSize: 14
      }
    }],
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        let result = `Time: ${Number(params[0].axisValue).toFixed(2)} sec<br/>`;

        params.forEach(param => {
          // Assuming each param corresponds to one of the line series
          if (param.data && param.data.value && param.data.value.length === 2) {
            const speedValue = param.data.value[1];
            const color = speedValue > 5 ? '#FF0000' : '#00FF00'; // Red if speed > 5, green otherwise
            result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>`;
            result += `Speed: ${speedValue} m/s<br/>`;
          } else {
            result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:#FF0000;"></span>`;
            result += `Speed: Data Not Available<br/>`;
          }
        });

        return result;
      }
    },
    xAxis: [{
      type: 'category',
      boundaryGap: false,
      data: pathlessTimeData2,
      name: 'Time (sec)', // Label for the X-axis
      nameLocation: 'middle', // Location of the label
      nameGap: 30, // Gap b
    }, {
      type: 'category',
      boundaryGap: false,
      data: pathlessTimeData2,
      name: 'Time (sec)', // Label for the X-axis
      nameLocation: 'middle', // Location of the label
      nameGap: 30, // Gap b
      gridIndex: 1
    },
    {
      type: 'category',
      boundaryGap: false,
      data: pathlessTimeData2,
      name: 'Time (sec)', // Label for the X-axis
      nameLocation: 'middle', // Location of the label
      nameGap: 30, // Gap b
      gridIndex: 2
    }],
    yAxis: [{
      type: 'value',
      name: 'Speed (m/s)', // Label for the Y-axis
      nameLocation: 'middle', // Location of the label
      nameGap: 50, // 
      splitLine: { show: false }
    }, {
      type: 'value',
      name: 'Speed (m/s)', // Label for the Y-axis
      nameLocation: 'middle', // Location of the label
      nameGap: 50, // 
      splitLine: { show: false },
      gridIndex: 1
    },
    {
      type: 'value',
      name: 'Speed (m/s)', // Label for the Y-axis
      nameLocation: 'middle', // Location of the label
      nameGap: 50, // 
      splitLine: { show: false },
      gridIndex: 2
    }],
    grid: [
      // First Chart (Loading Area)
      {
        left: '10%',
        right: '10%',
        top: '10%', // Adjust based on title size
        height: '20%', // Set the height of the chart
      },
      // Second Chart (Dumping Area)
      {
        left: '10%',
        right: '10%',
        top: '44%', // Start below the title of the second chart
        height: '20%',
      },
      // Third Chart (Parking Area)
      {
        left: '10%',
        right: '10%',
        top: '76%', // Start below the title of the third chart
        height: '20%',
      }
    ],
    series: [{
      type: 'line',
      symbol: 'none', // This hides the data point markers
      data: speedDataFiltered2,
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
        }
      },
      lineStyle: {
        normal: {
          color: function (params) {
            // Check if the current segment is above the threshold
            return params.value[1] > 5 ? '#00FF00' : '#00FF00';
          }
        }
      },
      itemStyle: {
        normal: {
          color: function (params) {
            // Apply the same logic to individual points
            return params.value[1] > 5 ? '#00FF00' : '#00FF00';
          }
        }
      },
      showSymbol: true,
      symbolSize: 4,
    }, {
      type: 'line',
      showSymbol: false,
      data: speedDataFiltered1_2,
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
        }
      },
      xAxisIndex: 1,
      yAxisIndex: 1
    },
    {
      name: 'Additional Speed Data', // Give a meaningful name
      type: 'line',
      data: additionalSpeedData2,
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
        }
      },
      symbol: 'circle', // or any other symbol you prefer
      symbolSize: 5,
      lineStyle: {
        normal: {
          color: '#FFA500', // A distinct color for this line
          width: 2, // Line width
        }
      },
      itemStyle: {
        normal: {
          color: '#FFA500', // Same as line color for consistency
        }
      },
      xAxisIndex: 2,
      yAxisIndex: 2
    }
    ]
  };

  return (
    <>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <div
          style={{
            display: "inline-block",
            padding: "10px",
            borderRadius: "5px",
            background: "linear-gradient(to right, #bdc3c7, #2c3e50)",
            color: "#fff",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: "20px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)"
          }}
        >
          Different Task Time KPI

        </div>
        <div style={{ float: "right", display: 'flex' }}>
          <InsightButton onClick={LevelTimeTaken} />
        </div>
        {isModalOpen && (
          <Modal onClose={handleCloseModal}>
            <h2></h2>
            <p>{insightText}</p>
          </Modal>
        )}

      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >

        <Chart
          options={chartConfig.options}
          series={chartConfig.series}
          type="donut"
          width={870} // Adjust width if needed
          height={350}
        />
        {compare && (
          <Chart
            options={chartConfig1.options}
            series={chartConfig1.series}
            type="donut"
            width={870} // Adjust width if needed
            height={350}
          />
        )}

      </div>

      <div
        style={{ textAlign: "center", marginTop: "30px", marginBottom: "0px" }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "10px",
            borderRadius: "5px",
            background: "linear-gradient(to right, #bdc3c7, #2c3e50)",
            color: "#fff",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: "20px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)"
          }}
        >
          Different Modes Time
        </div>
        <div style={{ float: "right" }}>
          <InsightButton onClick={PowerTime} />
        </div>
        {isModalOpen && (
          <Modal onClose={handleCloseModal}>
            <h2></h2>
            <p>{insightText}</p>
          </Modal>
        )}
        <div
          style={compare ? { display: "flex", justifyContent: "center", alignItems: "center" } : {}}
        >
          <ReactECharts
            style={compare ? { height: "500px", width: "500px" } : { height: "500px", margin: "30px 0" }}
            option={option1}
            notMerge={true}
            lazyUpdate={true}
          />

          {compare && (
            <ReactECharts
              style={{ width: "500px", height: "500px" }} // Adds vertical margin
              option={optionpiecomp}
              notMerge={true}
              lazyUpdate={true}
            />
          )}
        </div>
        <div style={{ float: "right", margin: "5px" }}>
          <InsightButton onClick={VehSpeedTimeInsight} />
        </div>
        {isModalOpen && (
          <Modal onClose={handleCloseModal}>
            <h2></h2>
            <p>{insightText}</p>
          </Modal>
        )}
        <ReactECharts
          style={{ height: "500px", margin: "60px 0" }} // Adds vertical margin
          option={vehicleChartOptions}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>
      {compare && (
        <ReactECharts
          style={{ height: "500px", margin: "30px 0" }} // Adds vertical margin
          option={vehicleChartOptionscomp}
          notMerge={true}
          lazyUpdate={true}
        />
      )}

      {/* Area filter dropdown */}
      <div
        className="area-filter-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "30px",
          marginBottom: "20px"
        }}
      >

        <div
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            background: "linear-gradient(to right, #8e9eab, #eef2f3)", // Gradient background
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px"
          }}
        >
          <label
            htmlFor="areaFilter"
            style={{
              fontWeight: "bold",
              fontSize: "18px",
              color: "#2c3e50",
              fontFamily: "Arial, Helvetica, sans-serif"
            }}
          >
            Select Area:
          </label>
          <select
            id="areaFilter"
            value={selectedArea}
            onChange={handleAreaChange}
            style={{
              padding: "5px 15px",
              borderRadius: "5px",
              border: "1px solid #ddd",
              fontSize: "16px",
              color: "#333",
              background: "white",
              cursor: "pointer",
              outline: "none"
            }}
          >
            <option value="all">All Areas</option>
            <option value="loading">Loading Area</option>
            <option value="dumping">Dumping Area</option>
            <option value="parking">Parking Area</option>
          </select>
        </div>
        <div style={{ float: "right" }}>
          <InsightButton onClick={LoadDumpParkInsight} />
        </div>
        {isModalOpen && (
          <Modal onClose={handleCloseModal}>
            <h2></h2>
            <p>{insightText}</p>
          </Modal>
        )}
      </div>


      {selectedArea === 'all' ? (
        <>
          {/* Render all charts for 'all' selection */}
          <ReactECharts
            style={{ height: "500px", margin: "30px 0" }}
            option={option} // Option for the loading area chart
            notMerge={true}
            lazyUpdate={true}
          />
          {compare && (
            <ReactECharts
              style={{ height: "500px", margin: "30px 0" }}
              option={option2} // Chart for User 2
              notMerge={true}
              lazyUpdate={true}
            />
          )}
          {/* ... similarly, add the other charts using the same 'option' ... */}
        </>
      ) : null}

      {/* Conditionally render charts based on the selected area */}
      {selectedArea === 'loading' && (
        <>
          <ReactECharts
            style={{ height: "500px", margin: "30px 0" }}
            option={getLoadingAreaOption()} // Chart for User 1
            notMerge={true}
            lazyUpdate={true}
          />
          {compare && (
            <ReactECharts
              style={{ height: "500px", margin: "30px 0" }}
              option={getLoadingAreaOption2()} // Chart for User 2
              notMerge={true}
              lazyUpdate={true}
            />
          )}
        </>
      )}

      {selectedArea === 'dumping' && (
        <>
          <ReactECharts
            style={{ height: "500px", margin: "30px 0" }}
            option={getDumpingAreaOption()} // Chart for User 1
            notMerge={true}
            lazyUpdate={true}
          />
          {compare && (
            <ReactECharts
              style={{ height: "500px", margin: "30px 0" }}
              option={getDumpingAreaOption2()} // Chart for User 2
              notMerge={true}
              lazyUpdate={true}
            />
          )}
        </>
      )}
      {selectedArea === 'parking' && (
        <>

          <ReactECharts
            style={{ height: "500px", margin: "30px 0" }}
            option={getParkingAreaOption()} // Chart for User 1
            notMerge={true}
            lazyUpdate={true}
          />
          {compare && (
            <ReactECharts
              style={{ height: "500px", margin: "30px 0" }}
              option={getParkingAreaOption2()} // Chart for User 2
              notMerge={true}
              lazyUpdate={true}
            />
          )}
        </>
      )}
      <div>
        <div style={{ float: "right" }}>
          <InsightButton onClick={SpeedTimeInsight} />
        </div>
        {isModalOpen && (
          <Modal onClose={handleCloseModal}>
            <h2></h2>
            <p>{insightText}</p>
          </Modal>
        )}
      </div>
      <div>
        <ReactECharts
          style={compare ? { height: "500px", margin: "30px 0", marginTop: "75px" } : { height: "500px", margin: "30px 0", marginTop: "5px" }} // Adds vertical margin
          option={optionspeed}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>
      {compare && (
        <ReactECharts
          style={{ height: "500px", margin: "30px 0" }} // Adds vertical margin
          option={optionspeedcomp}
          notMerge={true}
          lazyUpdate={true}
        />
      )}
      {/* <div>
        <div style={{ float: "right" }}>
          <InsightButton onClick={SpeedTimeInsight} />
        </div>
        {isModalOpen && (
          <Modal onClose={handleCloseModal}>
            <h2></h2>
            <p>{insightText}</p>
          </Modal>
        )}
        <ReactECharts
          style={{ height: "500px", margin: "30px 0" }} // Adds vertical margin
          option={optionspeednew}
          notMerge={true}
          lazyUpdate={true}
        />
      </div> */}
      <div>
        <div style={{ float: "right" }}>
          <InsightButton onClick={RpmLoading} />
        </div>
        {isModalOpen && (
          <Modal onClose={handleCloseModal}>
            <h2></h2>
            <p>{insightText}</p>
          </Modal>
        )}
      </div>
      <div>

        <ReactECharts
          style={compare ? { height: "500px", margin: "30px 0", marginTop: "75px" } : { height: "500px", margin: "30px 0", marginTop: "5px" }} // Adds vertical margin
          option={rpmChartOptions}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>

      {compare && (
        <ReactECharts
          style={{ height: "500px", margin: "30px 0" }} // Adds vertical margin
          option={rpmChartOptions1}
          notMerge={true}
          lazyUpdate={true}
        />
      )}

      <div>
        <div style={{ float: "right" }}>
          <InsightButton onClick={RpmunLoading} />
        </div>
        {isModalOpen && (
          <Modal onClose={handleCloseModal}>
            <h2></h2>
            <p>{insightText}</p>
          </Modal>
        )}

      </div>
      <div>

        <ReactECharts
          style={compare ? { height: "500px", margin: "30px 0", marginTop: "75px" } : { height: "500px", margin: "30px 0", marginTop: "5px" }} // Adds vertical margin
          option={rpmChartUnloading}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>

      {compare && (
        <ReactECharts
          style={{ height: "500px", margin: "30px 0" }} // Adds vertical margin
          option={rpmChartUnloading1}
          notMerge={true}
          lazyUpdate={true}
        />
      )}

<div>
        <div style={{ float: "right" }}>
          <InsightButton onClick={CollisionInsight} />
        </div>
        {isModalOpen && (
          <Modal onClose={handleCloseModal}>
            <h2></h2>
            <p>{insightText}</p>
          </Modal>
        )}
      </div>
      <div className="filter-container">
        <div>
          <label htmlFor="collisionType" className="filter-label">
            Select Collision Type:
          </label>
          <select style={{ backgroundColor: "#3b82f6" }}
            id="collisionType"
            className="filter-select"
            value={selectedCollisionType}
            onChange={handleCollisionTypeChange}
          >
            <option value="all">All</option>
            <option value="total">Normal Collisions</option>
            <option value="pedestrial">Pedestrian Collisions</option>
            <option value="object">Object Collisions</option>
            <option value="mines">Mines Collisions</option>
            {/* ... other options ... */}
          </select>
        </div>
      </div>
      <Chart
        options={options1}
        series={series1} //gear collosion graph
      />
      {compare && (
        <Chart
          options={options2}
          series={series2} // Gear collision graph for User 2
        />
      )}
      ;
    </>
  );
};

export default Reliance;