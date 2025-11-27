document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('image-modal');
    modal.style.display = 'block';
});

let currentCharts = {
    combined: null,
    voltage: null,
    current: null,
    power: null
};
let currentTabIndex = 0;
const tabs = ['combined-graph', 'voltage-graph', 'current-graph', 'power-graph']; // Order: Combined (1), Voltage (2), Current (3), Power (4)

/////////////////// Get the ids to display //////////////////////
const modal = document.getElementById('image-modal');
const closeModal = document.querySelector('.close-modal');

/////////////////// Functions to display the Graphs //////////////////////
async function showImage(busNumber) {
    const data = await getdata(busNumber);

    if (busNumber > 5) {
        if (busNumber == 6) {
            document.getElementById('modal-title').textContent = `Chart for Line 1-2`;
        } else if (busNumber == 7) {
            document.getElementById('modal-title').textContent = `Chart for Line 1-3`;
        } else if (busNumber == 8) {
            document.getElementById('modal-title').textContent = `Chart for Line 2-3`;
        } else if (busNumber == 9) {
            document.getElementById('modal-title').textContent = `Chart for Line 2-4`;
        } else if (busNumber == 10) {
            document.getElementById('modal-title').textContent = `Chart for Line 2-5`;
        } else if (busNumber == 11) {
            document.getElementById('modal-title').textContent = `Chart for Line 3-4`;
        } else {
            document.getElementById('modal-title').textContent = `Chart for Line 4-5`;
        }
    } else {
        document.getElementById('modal-title').textContent = `Chart for Bus ${busNumber}`;
    }

    /////////////// Destroy existing charts if they exist ///////////
    Object.keys(currentCharts).forEach(key => {
        if (currentCharts[key]) {
            currentCharts[key].destroy();
        }
    });

    ///// Combined Chart (Voltage, Current, Power) /////
    const combinedCtx = document.getElementById('combined-graph').getContext('2d');
    currentCharts.combined = new Chart(combinedCtx, {
        type: 'line',
        data: {
            labels: data.xs,
            datasets: [
                {
                    label: 'Voltage (V)',
                    data: data.vs,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false
                },
                {
                    label: 'Current (A)',
                    data: data.cs,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    fill: false
                },
                {
                    label: 'Power (W)',
                    data: data.ps,
                    backgroundColor: 'rgba(255, 26, 104, 0.2)',
                    borderColor: 'rgba(255, 26, 104, 1)',
                    borderWidth: 1,
                    fill: false
                }
            ]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time',
                        align: 'center',
                        font: {
                            size: 16
                        }
                    }
                },
                y: {
                    min: 0,
                    title: {
                        display: true,
                        text: 'V (V),  I (A),  P (W)',
                        align: 'end',
                        font: {
                            size: 16
                        }
                    }
                }
            }
        }
    });

    // Voltage Chart //
    const voltageCtx = document.getElementById('voltage-graph').getContext('2d');
    currentCharts.voltage = new Chart(voltageCtx, {
        type: 'line',
        data: {
            labels: data.xs,
            datasets: [{
                label: 'Voltage Data',
                data: data.vs,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time',
                        align: 'center',
                        font: {
                            size: 16
                        }
                    }
                },
                y: {
                    min: 0,
                    title: {
                        display: true,
                        text: 'Voltage (V)',
                        align: 'end',
                        font: {
                            size: 16
                        }
                    }
                }
            }
        }
    });

    // Current Chart //
    const currentCtx = document.getElementById('current-graph').getContext('2d');
    currentCharts.current = new Chart(currentCtx, {
        type: 'line',
        data: {
            labels: data.xs,
            datasets: [{
                label: 'Current Data',
                data: data.cs,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time',
                        align: 'center',
                        font: {
                            size: 16
                        }
                    }
                },
                y: {
                    min: 0,
                    title: {
                        display: true,
                        text: 'Current (A)',
                        align: 'end',
                        font: {
                            size: 16
                        }
                    }
                }
            }
        }
    });

    // Power Chart //
    const powerCtx = document.getElementById('power-graph').getContext('2d');
    currentCharts.power = new Chart(powerCtx, {
        type: 'line',
        data: {
            labels: data.xs,
            datasets: [{
                label: 'Power Data',
                data: data.ps,
                backgroundColor: 'rgba(255, 26, 104, 0.2)',
                borderColor: 'rgba(255, 26, 104, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time',
                        align: 'center',
                        font: {
                            size: 16
                        }
                    }
                },
                y: {
                    min: 0,
                    title: {
                        display: true,
                        text: 'Power (W)',
                        align: 'end',
                        font: {
                            size: 16
                        }
                    }
                }
            }
        }
    });

    // Initialize tab display //
    updateTabDisplay();

    // Set up real-time data updates //
    setupRealtimeData(busNumber, (data) => {
        // Update Combined Chart //
        currentCharts.combined.data.labels = data.xs;
        currentCharts.combined.data.datasets[0].data = data.vs; // Voltage
        currentCharts.combined.data.datasets[1].data = data.cs; // Current
        currentCharts.combined.data.datasets[2].data = data.ps; // Power
        currentCharts.combined.update();

        // Update Voltage Chart //
        currentCharts.voltage.data.labels = data.xs;
        currentCharts.voltage.data.datasets[0].data = data.vs;
        currentCharts.voltage.update();

        // Update Current Chart //
        currentCharts.current.data.labels = data.xs;
        currentCharts.current.data.datasets[0].data = data.cs;
        currentCharts.current.update();

        // Update Power Chart //
        currentCharts.power.data.labels = data.xs;
        currentCharts.power.data.datasets[0].data = data.ps;
        currentCharts.power.update();
    });
}

// New function to set up real-time listener //
function setupRealtimeData(busNumber, updateCallback) {
    const xs = [];
    const vs = [];
    const ps = [];
    const cs = [];

    try {
        database.ref(`meters/Unit_${busNumber}`).limitToLast(100).on("value", (snapshot) => {
            xs.length = 0; // Clear arrays
            vs.length = 0;
            ps.length = 0;
            cs.length = 0;

            const data = snapshot.val();
            if (data) {
                Object.keys(data).forEach(timestamp => {
                    const entry = data[timestamp];
                    const time = timestamp.slice(8, 10) + ":" + timestamp.slice(10, 12) + ":" + timestamp.slice(12, 14);
                    xs.push(time);
                    vs.push(entry.Voltage_AN || 0);
                    ps.push(entry.Power || 0);
                    cs.push(entry.Current || 0);
                });
                updateCallback({ xs, vs, ps, cs });
            } else {
                console.warn(`No historical data found for Unit_${busNumber}`);
                updateCallback({ xs, vs, ps, cs }); // Update with empty data
            }
        });
    } catch (error) {
        console.error(`Error setting up real-time data for Unit_${busNumber}:`, error);
        updateCallback({ xs, vs, ps, cs }); // Update with empty data on error
    }
}

// Function to switch tabs with direction for animation //
function switchTab(direction) {
    const prevTabIndex = currentTabIndex;
    // Calculate the new tab index for looping //
    currentTabIndex = (currentTabIndex + direction + tabs.length) % tabs.length;

    // Get the previous and current tabs //
    const prevTab = document.getElementById(tabs[prevTabIndex]);
    const currentTab = document.getElementById(tabs[currentTabIndex]);

    // Reset all tabs to their initial state (off-screen and hidden) //
    tabs.forEach(tabId => {
        const tab = document.getElementById(tabId);
        tab.classList.remove('active', 'slide-in-right', 'slide-out-left', 'slide-in-left', 'slide-out-right');
        tab.style.transform = direction > 0 ? 'translateX(100%)' : 'translateX(-100%)';
        tab.style.opacity = '0';
    });

    // Apply sliding animations based on direction //
    if (direction > 0) {
        prevTab.classList.add('slide-out-left');
        currentTab.classList.add('slide-in-right');
    } else {
        prevTab.classList.add('slide-out-right');
        currentTab.classList.add('slide-in-left');
    }

    // Set the current tab as active //
    currentTab.classList.add('active');
    currentTab.style.transform = 'translateX(0)';
    currentTab.style.opacity = '1';
}

// Function to update tab display (initial setup) //
function updateTabDisplay() {
    tabs.forEach((tabId, index) => {
        const tab = document.getElementById(tabId);
        if (index === currentTabIndex) {
            tab.classList.add('active');
            tab.style.transform = 'translateX(0)';
            tab.style.opacity = '1';
        } else {
            tab.classList.remove('active', 'slide-in-right', 'slide-out-left', 'slide-in-left', 'slide-out-right');
            tab.style.transform = 'translateX(100%)';
            tab.style.opacity = '0';
        }
    });
}

/////////////////// Firebase data //////////////////////
console.log("Checking Firebase...");
if (typeof firebase !== "undefined") {
    console.log("Firebase SDK Loaded");
} else {
    console.error("Firebase SDK NOT Loaded. Check your HTML script tags.");
}

/////////////////// Firebase Configuration //////////////////////
const firebaseConfig = {
    apiKey: "AIzaSyBUwgFB8LFKRDdEb8Kuoi-r5hGE84KTTOE",
    authDomain: "ieee5bus.firebaseapp.com",
    databaseURL: "https://ieee5bus-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ieee5bus",
    storageBucket: "ieee5bus.firebasestorage.app",
    messagingSenderId: "898983858467",
    appId: "1:898983858467:web:d7e17f2c9570be1275fc96"
};

/////////////////// Firebase Initialization //////////////////////
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
console.log("Firebase Initialized:", firebase.apps.length > 0 ? "Success" : "Failed");

///////////////////   Auth Protection  //////////////////////
const auth = firebase.auth();   // this line creates the auth object
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        alert("Login first, please!");
        window.location.href = "index.html";}
});

/////////////////// Meter readings data fetch and readings //////////////////////
async function getdata(busNumber) {
    const xs = [];
    const vs = [];
    const ps = [];
    const cs = [];

    try {
        const snapshot = await database.ref(`meters/Unit_${busNumber}`).limitToLast(100).once("value");
        const data = snapshot.val();

        if (data) {
            Object.keys(data).forEach(timestamp => {
                const entry = data[timestamp];
                const time = timestamp.slice(8, 10) + ":" + timestamp.slice(10, 12) + ":" + timestamp.slice(12, 14);
                xs.push(time);
                vs.push(entry.Voltage_AN || 0);
                ps.push(entry.Power || 0);
                cs.push(entry.Current || 0);
            });
        } else {
            console.warn(`No historical data found for Unit_${busNumber}`);
        }
    } catch (error) {
        console.error(`Error fetching historical data for Unit_${busNumber}:`, error);
    }

    return { xs, vs, ps, cs };
}

/////////////////// Meter data Entry //////////////////////
async function dataentry(busNumber) {
    console.log(`Fetching real-time data for Unit_${busNumber}...`);

    if (busNumber > 5) {
        if (busNumber == 6) {
            document.getElementById('modal-bus-id').textContent = `Meter Reading: Line 1-2`;
        } else if (busNumber == 7) {
            document.getElementById('modal-bus-id').textContent = `Meter Reading: Line 1-3`;
        } else if (busNumber == 8) {
            document.getElementById('modal-bus-id').textContent = `Meter Reading: Line 2-3`;
        } else if (busNumber == 9) {
            document.getElementById('modal-bus-id').textContent = `Meter Reading: Line 2-4`;
        } else if (busNumber == 10) {
            document.getElementById('modal-bus-id').textContent = `Meter Reading: Line 2-5`;
        } else if (busNumber == 11) {
            document.getElementById('modal-bus-id').textContent = `Meter Reading: Line 3-4`;
        } else {
            document.getElementById('modal-bus-id').textContent = `Meter Reading: Line 4-5`;
        }
    } else {
        document.getElementById('modal-bus-id').textContent = `Meter Reading: Bus ${busNumber}`;
    }

    try {
        database.ref(`meters/Unit_${busNumber}`).limitToLast(1).on("value", (snapshot) => {
            const data = snapshot.val();
            if (data) {
                console.log("Realtime Data Retrieved:", data);
                const latestTimestamp = Object.keys(data)[0];
                const latestData = data[latestTimestamp];

                if (!latestData) {
                    console.warn(`No valid data found for Unit_${busNumber}`);
                    return;
                }

                document.getElementById("voltageln").textContent = latestData.Voltage_AN ? latestData.Voltage_AN.toFixed(3) : "N/A";
                document.getElementById("current").textContent = latestData.Current ? latestData.Current.toFixed(3) : "N/A";
                document.getElementById("power").textContent = latestData.Power ? latestData.Power.toFixed(3) : "N/A";
                document.getElementById("frequency").textContent = latestData.Frequency ? latestData.Frequency.toFixed(3) : "N/A";
                document.getElementById("powerfactor").textContent = latestData.PowerFactor ? latestData.PowerFactor.toFixed(3) : "N/A";
            } else {
                console.warn(`No data found for Unit_${busNumber}`);
            }
        });
    } catch (error) {
        console.error(`Error fetching real-time data for Unit_${busNumber}:`, error);
    }
}

/////////////////// CSV file Download //////////////////////
document.getElementById("csv-download-btn").addEventListener("click", async () => {
    const params = new URLSearchParams(window.location.search);
    const busNumber = params.get('bus');

    if (!busNumber) {
        alert("No unit selected for download!");
        return;
    }

    try {
        const snapshot = await database.ref(`meters/Unit_${busNumber}`).limitToLast(100).once("value");
        const data = snapshot.val();

        if (!data) {
            alert(`No data available for Unit_${busNumber}`);
            return;
        }

        let unitData = [];

        Object.keys(data).forEach(timestamp => {
            const entry = data[timestamp];

            unitData.push({
                Timestamp: entry.Timestamp || timestamp,
                Voltage_AN: entry.Voltage_AN || "N/A",
                Current: entry.Current || "N/A",
                PowerFactor: entry.PowerFactor || "N/A",
                Power: entry.Power || "N/A",
                Frequency: entry.Frequency || "N/A"
            });
        });

        /////////////////// Convert to CSV and download //////////////////////
        const csvData = convertToCSV(unitData);
        downloadCSV(csvData, `Unit_${busNumber}.csv`);

    } catch (error) {
        console.error(`Error fetching data for Unit_${busNumber}:`, error);
    }
});

/////////////////// Function to convert to CSV //////////////////////
function convertToCSV(data) {
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(",")];

    data.forEach(entry => {
        const values = headers.map(header => entry[header]);
        csvRows.push(values.join(","));
    });

    return csvRows.join("\n");
}

/////////////////// Function to download CSV //////////////////////
function downloadCSV(csvData, filename) {
    const blob = new Blob([csvData], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/////////////////// Close the Graph function //////////////////////
function closeModalFunction() {
    database.ref().off(); // Remove all Firebase listeners
    window.location.href = "dashboard.html";
}

/////////////////// To call the close graph function //////////////////////
closeModal.addEventListener('click', closeModalFunction);

/////////////////// Check for button actions //////////////////////
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const busNumber = params.get('bus');
    if (busNumber) {
        showImage(busNumber);
        dataentry(busNumber);
    }

});
