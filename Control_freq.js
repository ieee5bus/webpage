document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Fully Loaded");

    const automatic = document.getElementById("automatic");
    const manual = document.getElementById("manual");
    const mode = document.getElementById("currentmode");
    const showmanual = document.getElementById("manualcontrol");
    const showmanualreadings = document.getElementById("manualcontrolreadings");

///////////////////   Firebase Configuration   //////////////////////
    const firebaseConfig = {
        apiKey: "AIzaSyBUwgFB8LFKRDdEb8Kuoi-r5hGE84KTTOE",
        authDomain: "ieee5bus.firebaseapp.com",
        databaseURL: "https://ieee5bus-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "ieee5bus",
        storageBucket: "ieee5bus.firebasestorage.app",
        messagingSenderId: "898983858467",
        appId: "1:898983858467:web:d7e17f2c9570be1275fc96"
    };

///////////////////   Initialize Firebase   //////////////////////
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    console.log("Firebase Initialized:", firebase.apps.length > 0 ? "Success" : "Failed");

    ///////////////////   Auth Protection  //////////////////////
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
    .catch((error) => {
        console.error("Persistence error:", error);
    });
firebase.auth().onAuthStateChanged((user) => {
    // If no user → redirect to login
    if (!user) {
        window.location.replace("index.html");
        return;
    }
    // If user exists → allow access (nothing else needed)
});

    function updateControlField(field, value) {
        database.ref(`control/${field}`).set(value)
            .then(() => console.log(`${field} updated to`, value))
            .catch(error => console.error("Error updating Firebase:", error));
    }

/////////////////   Mode selection event listeners   //////////////////
    automatic.addEventListener("click", (event) => {
        event.preventDefault();
        mode.textContent = "Automatic";

        updateControlField("automatic", true);
        updateControlField("manual", false);

        showmanual.style.display = "none";
        showmanualreadings.style.display = "none";
    });

    manual.addEventListener("click", (event) => {
        event.preventDefault();
        mode.textContent = "Manual";

        updateControlField("manual", true);
        updateControlField("automatic", false);

        showmanual.style.display = showmanual.style.display === "none" ? "block" : "none";
        showmanualreadings.style.display = showmanualreadings.style.display === "none" ? "block" : "none";
    });

/////////////////////  Load shedding logic //////////////////////
let totalLoadShed = 0;

let regions = {
    region1: { "40W_A": false, "40W_B": false, "60W": false, "100W": false, total: 0 },
    region2: { "40W": false, "100W_A": false, "100W_B": false, total: 0 },
    region3: { "60W_A": false, "60W_B": false, "100W_A": false, "100W_B": false, total: 0 }
};

function updateLoadShed() {
    const powerMap = {
        "40W_A": 40, "40W_B": 40, "60W": 60, "100W": 100,
        "40W": 40, "100W_A": 100, "100W_B": 100,
        "60W_A": 60, "60W_B": 60
    };

    let currentLoadOn = 0;
    let totalPossibleLoad = 0;

    for (let region of Object.values(regions)) {
        for (let key in region) {
            if (key !== "total") {
                const power = powerMap[key] || 0;
                totalPossibleLoad += power;
                if (region[key]) {
                    currentLoadOn += power;
                }
            }
        }
    }

    totalLoadShed = totalPossibleLoad - currentLoadOn;

    document.getElementById("loadon").innerText = `${totalLoadShed} W`;
    document.getElementById("loadshutdown").innerText = `${currentLoadOn} W`;

    database.ref("control/load_shed").set(totalLoadShed);
}

function initializeButtonStates() {
    buttonMappings.forEach(({ id }) => {
        const onButton = document.getElementById(`${id}on`);
        const offButton = document.getElementById(`${id}off`);
        if (onButton) onButton.classList.add("on-active"); // Initially ON buttons are green
        if (offButton) offButton.classList.remove("off-active"); // OFF buttons stay light blue
    });
}

window.toggleRegion = function (region, key, power, turnOn) {
    const buttonId = buttonMappings.find(mapping => mapping.region === region && mapping.key === key)?.id;
    const onButton = document.getElementById(`${buttonId}on`);
    const offButton = document.getElementById(`${buttonId}off`);

    if (turnOn) {
        if (!regions[region][key]) {
            regions[region][key] = true;
            regions[region].total += power;
            if (offButton) offButton.classList.add("off-active"); // OFF button turns red
            if (onButton) onButton.classList.remove("on-active"); // ON button reverts to light blue
        }
    } else {
        if (regions[region][key]) {
            regions[region][key] = false;
            regions[region].total -= power;
            if (onButton) onButton.classList.add("on-active"); // ON button turns green
            if (offButton) offButton.classList.remove("off-active"); // OFF button reverts to light blue
        }
    }

    updateLoadShed();
    database.ref(`control/${region}`).set(regions[region]);
};

const buttonMappings = [
    { id: "region140a", region: "region1", key: "40W_A", power: 40 },
    { id: "region140b", region: "region1", key: "40W_B", power: 40 },
    { id: "region160", region: "region1", key: "60W", power: 60 },
    { id: "region1100", region: "region1", key: "100W", power: 100 },
    { id: "region240", region: "region2", key: "40W", power: 40 },
    { id: "region2100a", region: "region2", key: "100W_A", power: 100 },
    { id: "region2100b", region: "region2", key: "100W_B", power: 100 },
    { id: "region360a", region: "region3", key: "60W_A", power: 60 },
    { id: "region360b", region: "region3", key: "60W_B", power: 60 },
    { id: "region3100a", region: "region3", key: "100W_A", power: 100 },
    { id: "region3100b", region: "region3", key: "100W_B", power: 100 },
];

buttonMappings.forEach(({ id, region, key, power }) => {
    const onButton = document.getElementById(`${id}on`);
    const offButton = document.getElementById(`${id}off`);

    if (onButton) onButton.addEventListener("click", () => toggleRegion(region, key, power, false));
    if (offButton) offButton.addEventListener("click", () => toggleRegion(region, key, power, true));
});

initializeButtonStates();

updateLoadShed();

////////////////////   Fetch power and frequency readings  //////////////////////
    async function dataentry() {
        const latestData = {};
        for (const busNumber of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
            try {
                const snapshot = await database.ref(`meters/Unit_${busNumber}`).limitToLast(1).once("value");
                const data = snapshot.val();
                if (data) {
                    const latestTimestamp = Object.keys(data)[0]; // Get latest timestamp
                    const latestDataEntry = data[latestTimestamp]; // Retrieve latest data
                    if (!latestDataEntry) {
                        console.warn(`No valid data found for Unit_${busNumber}`);
                        continue;
                    }
                    latestData[busNumber] = {
                        frequency: latestDataEntry.Frequency ? latestDataEntry.Frequency.toFixed(3) : "N/A",
                        power: latestDataEntry.Power ? latestDataEntry.Power.toFixed(3) : "N/A",
                    };
                } else {
                    console.warn(`No data found for Unit_${busNumber}`);
                }
                if (latestData[busNumber]) {
                    const powerElement = document.getElementById(`power-${busNumber}`);
                    const freqElement = document.getElementById(`frequency-${busNumber}`);
                    if (powerElement) powerElement.textContent = latestData[busNumber].power;
                    if (freqElement) freqElement.textContent = latestData[busNumber].frequency;
                    console.log(`Data for Unit_${busNumber} updated successfully`);
                }
            } catch (error) {
                console.error(`Error fetching data for Unit_${busNumber}:`, error);
            }
        }
        setInterval(applyBlinkEffect, 2000);
    }
	const showcal = document.getElementById("calculate");

if (showcal) {
    showcal.addEventListener("click", fre_calculation);
    console.log("Event listener added to showcalculated");
} else {
    console.error("Button #calculated not found in the DOM!");
}

    async function fre_calculation() {
        const referenceFrequency = 50.00;
        console.log("fre_calculation triggered");

        try {
            const snapshot = await database.ref("meters/Unit_4").limitToLast(1).once("value");
            const data = snapshot.val();
            console.log("Snapshot data for Bus 4:", data);

            if (data) {
                const latestTimestamp = Object.keys(data)[0];
                const latestDataEntry = data[latestTimestamp];

                if (latestDataEntry && latestDataEntry.Frequency) {
                    const bus4Frequency = parseFloat(latestDataEntry.Frequency);
                    const changeInFrequency = referenceFrequency - bus4Frequency;
                    const shedValue = changeInFrequency * 284.487;

                    const suggestedLoadElement = document.getElementById("suggested_load");
                    if (suggestedLoadElement) {
                        suggestedLoadElement.textContent = `${shedValue.toFixed(3)} W`;
                        console.log(`Updated Suggested Load: ${shedValue.toFixed(3)} W`);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching frequency data for Bus 4:", error);
        }
    }

    setInterval(dataentry,2000); // Fetch data once on load and at interval 2s
});

const close = document.getElementById('closebutton');

function closeFunction() {
    window.location.href = 'dashboard.html';
}

close.addEventListener('click', closeFunction);

// Navigation for Voltage Control Button
const vol_control = document.getElementById('volcontrol');
function vol_controlFunction() {
    window.location.href = 'Control_Vol.html';
}

if (vol_control) {
    vol_control.addEventListener('click', vol_controlFunction);
}

const lineLimits = {
    "power-6": 1200,  // Line 1-2
    "power-7": 250,   // Line 1-3
    "power-8": 300,   // Line 2-3
    "power-9": 300,   // Line 2-4
    "power-10": 250,   // Line 2-5
    "power-11": 350,   // Line 3-4
    "power-12": 250    // Line 4-5
};

///////////////////   Blinking Effect for over power flow   //////////////////////
function applyBlinkEffect() {
    Object.keys(lineLimits).forEach(id => {
        const element = document.getElementById(id); 
        if (element) {
            const value = parseFloat(element.textContent);
            console.log(`Checking ${id}: value = ${value}, limit = ${lineLimits[id]}`); // Debug log

            if (!isNaN(value) && value > lineLimits[id]) {
                console.log(`Applying blink to ${id}`);
                element.classList.add("blink-red");
            } else {
                console.log(`Removing blink from ${id}`);
                element.classList.remove("blink-red");
            }
        } else {
            console.warn(`Element ${id} not found`);
        }
    });
}