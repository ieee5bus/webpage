///////////////////   On the time of Load all data are fetched   //////////////////////

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Fully Loaded");
    const automatic = document.getElementById("automatic");
    const manual = document.getElementById("manual");
    const mode = document.getElementById("currentmode");
    const showmanual = document.getElementById("manualcontrol");
    const showmanualreadings = document.getElementById("manualcontrolreadings");

    const cap1on = document.getElementById("cap1on");
    const cap1off = document.getElementById("cap1off");
    const cap2on = document.getElementById("cap2on");
    const cap2off = document.getElementById("cap2off");
    const cap3on = document.getElementById("cap3on");
    const cap3off = document.getElementById("cap3off");
    const capShutdown = document.getElementById("capshutdown");

///////////////////   Firebase Configuration   //////////////////////
    const firebaseConfig = {
        apiKey: "AIzaSyBUwgFB8LFKRDdEb8Kuoi-r5hGE84KTTOE",
        authDomain: "ieee5bus.firebaseapp.com",
        databaseURL: "https://ieee5bus-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "ieee5bus",
        storageBucket: "ieee5bus.appspot.com",
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

///////////////////   Keys and Control  //////////////////////
    const defaultControlState = {
        manual: false,
        automatic:false,
        cap1: false,
        cap2: false,
        cap3: false
    };

    const controlRef = database.ref("vol_control");
    controlRef.once("value").then(snapshot => {
        if (!snapshot.exists()) {
            controlRef.set(defaultControlState);
            console.log("Default control keys created in Firebase.");
        } else {
            console.log("Control keys already exist.");
        }
    });

///////////////////   update the values  //////////////////////
    function updateControlField(field, value) {
        database.ref(`vol_control/${field}`).set(value)
            .then(() => console.log(`${field} updated to`, value))
            .catch(error => console.error("Error updating Firebase:", error));
    }

///////////////////   Mode selection   //////////////////////
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
        showmanual.style.display = "block";
        showmanualreadings.style.display = "block";
    });

///////////////////   Manual Control   //////////////////////
    const caps = {
        cap1: { active: false, value: 8 },
        cap2: { active: false, value: 16 },
        cap3: { active: false, value: 32 }
    };

    function updateTotalCap() {  // Function to calculate the capacitor added
        let total = 0;
        for (const cap in caps) {
            if (caps[cap].active) total += caps[cap].value;
        }
        capShutdown.textContent = `${total} uF`;
        updateControlField("cap_shed", total);
    }

    function initializeButtonStates() {
        const capButtons = [
            { on: cap1on, off: cap1off },
            { on: cap2on, off: cap2off },
            { on: cap3on, off: cap3off }
        ];
        capButtons.forEach(({ on, off }, index) => {
            if (off) {
                off.classList.add("off-active");
                console.log(`Initialized cap${index + 1}off with off-active`);
            }
            if (on) {
                on.classList.remove("on-active");
                console.log(`Initialized cap${index + 1}on without on-active`);
            }
        });
    }

    function toggleCap(capKey, state) {  // On/OFF button writings
        caps[capKey].active = state;
        updateControlField(capKey, state);
        const capButtons = {
            cap1: { on: cap1on, off: cap1off },
            cap2: { on: cap2on, off: cap2off },
            cap3: { on: cap3on, off: cap3off }
        };
        const { on, off } = capButtons[capKey];
        console.log(`Toggling ${capKey} with state=${state}`);
        if (state) {
            if (on) {
                on.classList.add("on-active");
                console.log(`${capKey}on set to on-active`);
            }
            if (off) {
                off.classList.remove("off-active");
                console.log(`${capKey}off cleared off-active`);
            }
        } else {
            if (off) {
                off.classList.add("off-active");
                console.log(`${capKey}off set to off-active`);
            }
            if (on) {
                on.classList.remove("on-active");
                console.log(`${capKey}on cleared on-active`);
            }
        }
        updateTotalCap();
    }

    cap1on?.addEventListener("click", () => toggleCap("cap1", true));
    cap1off?.addEventListener("click", () => toggleCap("cap1", false));
    cap2on?.addEventListener("click", () => toggleCap("cap2", true));
    cap2off?.addEventListener("click", () => toggleCap("cap2", false));
    cap3on?.addEventListener("click", () => toggleCap("cap3", true));
    cap3off?.addEventListener("click", () => toggleCap("cap3", false));

    initializeButtonStates();

///////////////////   Table data entry   //////////////////////
async function dataentry() {
    const latestData = {};
    for (const busNumber of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
        try {
            const snapshot = await database.ref(`meters/Unit_${busNumber}`).limitToLast(1).once("value");
            const data = snapshot.val();
            if (data) {
                const latestTimestamp = Object.keys(data)[0];
                const latestDataEntry = data[latestTimestamp];
                if (!latestDataEntry) continue;

                latestData[busNumber] = {
                    Voltage_AN: latestDataEntry.Voltage_AN?.toFixed(3) || "N/A",
                    PowerFactor: latestDataEntry.PowerFactor?.toFixed(3) || "N/A",
                };

                const powerfactorElement = document.getElementById(`powerfactor-${busNumber}`);
                const voltagelnElement = document.getElementById(`voltageln-${busNumber}`);
                if (powerfactorElement) powerfactorElement.textContent = latestData[busNumber].PowerFactor;
                if (voltagelnElement) voltagelnElement.textContent = latestData[busNumber].Voltage_AN;
                console.log(`Data for Unit_${busNumber} updated successfully`);
            }
        } catch (error) {
            console.error(`Error fetching data for Unit_${busNumber}:`, error);
        }
    }
}
setInterval(dataentry,2000) // Run once on page load and at every 2s

///////////////////   Navigation Button   //////////////////////   
const close = document.getElementById("closebutton");
close?.addEventListener("click", () => {
    window.location.href = "dashboard.html";
});

const freq_control = document.getElementById('freqcontrol');
if (freq_control) {
    freq_control.addEventListener('click', () => {
        window.location.href = 'Control_freq.html';
    });
}

});