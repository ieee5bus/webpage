/////////////////// Functions of Line and Bus information (specific) //////////////////////

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
const auth = firebase.auth();
auth.onAuthStateChanged((user) => {
    if (user && !sessionStorage.getItem("stillLoggedIn")) {
        firebase.auth().signOut();
        sessionStorage.setItem("stillLoggedIn", "true");
        window.location.replace("index.html");
        return;}
    if (!user) {
        window.location.replace("index.html");}
    sessionStorage.setItem("stillLoggedIn", "true");
});

/////////////////// Functions to fetch the data readings //////////////////////
async function dataentry() {
    const latestData = {}; // Store fetched bus data
    for (const busNumber of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
        try {
            const snapshot = await database.ref(`meters/Unit_${busNumber}`).limitToLast(1).once("value");
            const data = snapshot.val();
            if (data) {
                const latestTimestamp = Object.keys(data)[0]; // Get latest timestamp
                const latestDataEntry = data[latestTimestamp]; 
                if (!latestDataEntry) {
                    console.warn(`No valid data found for Unit_${busNumber}`);
                    continue;
                }

                latestData[busNumber] = {
                    voltageln: latestDataEntry.Voltage_AN ? latestDataEntry.Voltage_AN.toFixed(3) : "N/A",
                    frequency: latestDataEntry.Frequency ? latestDataEntry.Frequency.toFixed(3) : "N/A",
                    power: latestDataEntry.Power ? latestDataEntry.Power.toFixed(3) : "N/A",
                    powerfactor: latestDataEntry.PowerFactor ? latestDataEntry.PowerFactor.toFixed(3) : "N/A",
                    current: latestDataEntry.Current ? latestDataEntry.Current.toFixed(3) : "N/A"
                };
            } else {
                console.warn(`No data found for Unit_${busNumber}`);
            }

            /////////////////// Updates the HTML table dynamically //////////////////////
            if (latestData[busNumber]) {
                document.getElementById(`voltageln-${busNumber}`).textContent = latestData[busNumber].voltageln;
                document.getElementById(`current-${busNumber}`).textContent = latestData[busNumber].current;
                document.getElementById(`power-${busNumber}`).textContent = latestData[busNumber].power;
                document.getElementById(`frequency-${busNumber}`).textContent = latestData[busNumber].frequency;
                document.getElementById(`powerfactor-${busNumber}`).textContent = latestData[busNumber].powerfactor;
            }
        } catch (error) {
            console.error(`Error fetching data for Unit_${busNumber}:`, error);
        }
    }
}

/////////////////// Function calling for data entry //////////////////////
setInterval(dataentry,2000);

/////////////////// Function for closing the page //////////////////////
const close = document.getElementById('closebutton');

function closeFunction() {
    window.location.href = 'dashboard.html';
}

close.addEventListener('click', closeFunction);

/////////////////// Function to download all meters as Excel //////////////////////
document.getElementById("download-all-btn").addEventListener("click", async () => {
    try {
        const workbook = XLSX.utils.book_new();
        const busNames = [
            "Bus_1", "Bus_2", "Bus_3", "Bus_4", "Bus_5",
            "Line_1-2", "Line_1-3", "Line_2-3", "Line_2-4", "Line_2-5", "Line_3-4", "Line_4-5"
        ];

        for (const [index, busNumber] of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].entries()) {
            const snapshot = await database.ref(`meters/Unit_${busNumber}`).limitToLast(100).once("value");
            const data = snapshot.val();

            if (!data) {
                console.warn(`No data available for Unit_${busNumber}`);
                continue;
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

            // Convert to worksheet
            const worksheet = XLSX.utils.json_to_sheet(unitData);
            // Add worksheet to workbook with bus name
            XLSX.utils.book_append_sheet(workbook, worksheet, busNames[index]);
        }

        // Write and download the Excel file
        XLSX.writeFile(workbook, "All_Meters_Data.xlsx");
    } catch (error) {
        console.error("Error generating Excel file:", error);
        alert("An error occurred while generating the Excel file.");
    }

});

