// Popup open/close
const wrapper = document.querySelector('.wrapper');
const btnPopup = document.querySelector('.btnLogin-popup');
const iconClose = document.querySelector('.icon-close');

btnPopup.addEventListener('click', () => {
    wrapper.classList.add('active-popup');
});

iconClose.addEventListener('click', () => {
    wrapper.classList.remove('active-popup');
});

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

// Correct SHA-256 hashes for username & password
const correctUserHash =
    "958fb87d2ff95f6f1272f00d3effdd938ff757b6567e1254f4c5adb7bf08f983";
const correctPassHash =
    "f38631b9ec8b0f0d8c76fc5fcebe0577d9819e71e524c9b50ecdb30d2ee1a61b";

// Login handler
document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const userid = document.getElementById("userid").value.trim();
    const password = document.getElementById("password").value;

    const userHash = CryptoJS.SHA256(userid).toString();
    const passHash = CryptoJS.SHA256(password).toString();

    if (userHash === correctUserHash && passHash === correctPassHash) {

        const expiry = Date.now() + 3600000; // 1 hour
        localStorage.setItem("control_access", btoa(expiry));
        localStorage.setItem("control_until", expiry);

        wrapper.classList.remove("active-popup");
        alert("Login successful! Taking you to control panel...");
        window.location.href = "Control_freq.html";

    } else {
        alert("Wrong User ID or Password!");
        document.getElementById("userid").value = "";
        document.getElementById("password").value = "";
    }
});
