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

const correctUserHash = "718c2106cbd01450a4d65ff8a9bcb1e28a732f0d71641c8d1cdbf8cc27c56df1";
const correctPassHash = "e15ccdeb40f36f89f0ddd42f1adcee63d01ed10cf3aff342a2bb6b813d2869ef";

document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const userid = document.getElementById("userid").value.trim();
    const password = document.getElementById("password").value;

    const userHash = CryptoJS.SHA256(userid).toString();
    const passHash = CryptoJS.SHA256(password).toString();

    console.log("Typed User:", userid);
console.log("Typed Pass:", password);

console.log("User Hash:", userHash);
console.log("Correct Hash:", correctUserHash);


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

