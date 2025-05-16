///////////////////   Functions of Line and Bus information (specific)   //////////////////////

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

///////////////////   Firebase Initialization   //////////////////////
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

///////////////////   Functions to fetch the data readings   //////////////////////
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

            ///////////////////   Updates the HTML table dynamically   //////////////////////
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

///////////////////   Function calling for data entry   //////////////////////
setInterval(dataentry,2000);

///////////////////   Function for closing the page   //////////////////////
const close = document.getElementById('closebutton');

function closeFunction() {
    window.location.href = 'dashboard.html';}

close.addEventListener('click', closeFunction);