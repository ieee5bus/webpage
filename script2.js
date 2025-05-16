                            ///////////////////   Dashboard page functions   //////////////////////

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

///////////////////   Firebase Configuration   //////////////////////
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
console.log("Firebase Initialized:", firebase.apps.length > 0 ? "Success" : "Failed");

///////////////////  Corresponding Meter Information Dispay  //////////////////////
document.querySelectorAll('[class^="bus-"]').forEach(card => {
    card.addEventListener('click', () => {
        const busNumber = parseInt(card.querySelector('h3').innerText.split(' ')[1], 10);
        if (busNumber) {
            window.location.href = `meterdata.html?bus=${busNumber}`;
        }
    });
});

///////////////////   Buttons Configuration   //////////////////////
const businfo = document.getElementById("businformation");
const lineinfo = document.getElementById("lineinformation");
const both = document.getElementById("both");
const allmeter = document.getElementById("allmeter");
const busvalueshow = document.getElementById("busvalueid");
const linevalueshow = document.getElementById("linevalueid");

///////////////////   SYSTEM READINGS PAGE   //////////////////////
allmeter.addEventListener('click', (event) => {
    event.preventDefault();
    window.location.href = 'allmeter.html';
});

///////////////////   BUS INFO -> Toggle Bus Readings On/Off   //////////////////////
businfo.addEventListener('click', (event) => {
    event.preventDefault();
    busvalueshow.style.display = 'block';
    linevalueshow.style.display = 'none'; 
    dataentrybus();
});

///////////////////   LINE INFO -> Toggle Line Readings On/Off   //////////////////////
lineinfo.addEventListener('click', (event) => {
    event.preventDefault();
    linevalueshow.style.display = 'block'; 
    busvalueshow.style.display = 'none'; 
    dataentryline();
});

///////////////////   BOTH -> Toggle Both Bus & Line Readings On/Off   //////////////////////
both.addEventListener('click', (event) => {
    event.preventDefault();
    const isBothVisible = busvalueshow.style.display === 'block' && linevalueshow.style.display === 'block';
    if (isBothVisible) {
        busvalueshow.style.display = 'none';
        linevalueshow.style.display = 'none';
    } else {
        busvalueshow.style.display = 'block';
        linevalueshow.style.display = 'block';
        dataentrybus();
        dataentryline();
    }
});

///////////////////   Fetch latest data from Firebase for buses   //////////////////////
async function dataentrybus() {
    for (let Bus = 1; Bus <= 5; Bus++) {
        try {
            database.ref(`meters/Unit_${Bus}`).limitToLast(1).on("value", (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    console.log(`Bus ${Bus} Data Retrieved:`, data);
                    const latestTimestamp = Object.keys(data)[0]; 
                    const latestData = data[latestTimestamp];
                    // Update bus data in the dashboard
                    document.getElementById(`voltageln_${Bus}`).textContent = latestData.Voltage_AN.toFixed(2) || "N/A";
                    document.getElementById(`powerfactor_${Bus}`).textContent = latestData.PowerFactor.toFixed(2) || "N/A";
                }
            });
        } catch (error) {
            console.error(`Error fetching data for Bus ${Bus}:`, error);
        }
    }
}

///////////////////   Fetch latest data from Firebase for lines   //////////////////////
async function dataentryline() {
    for (let Bus = 6; Bus <= 12; Bus++) {
        try {
            database.ref(`meters/Unit_${Bus}`).limitToLast(1).on("value", (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    console.log(`Line ${Bus} Data Retrieved:`, data);
                    const latestTimestamp = Object.keys(data)[0];
                    const latestData = data[latestTimestamp];
                    // Update line data in the dashboard
                    document.getElementById(`power_${Bus}`).textContent = latestData.Power.toFixed(2) || "N/A";
                    document.getElementById(`current_${Bus}`).textContent = latestData.Current.toFixed(2) || "N/A";
                }
            });
        } catch (error) {
            console.error(`Error fetching data for Line ${Bus}:`, error);
        }
    }
}

///////////////////   Enable draggable elements for values display   //////////////////////
document.querySelectorAll('.draggable').forEach((element) => {
    let isDragging = false, offsetX, offsetY;
    element.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - element.offsetLeft;
        offsetY = e.clientY - element.offsetTop;
        document.addEventListener('mousemove', dragElement);
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        document.removeEventListener('mousemove', dragElement);
    });

    function dragElement(e){
        if (!isDragging) return;
        element.style.left = `${e.clientX - offsetX}px`;
        element.style.top = `${e.clientY - offsetY}px`;
    }
});

///////////////////   Navigate to Control page   //////////////////////
const control = document.getElementById("control");

control.addEventListener('click', (event)=>{
    event.preventDefault();
    window.location.href = `control_auth.html`;
})
