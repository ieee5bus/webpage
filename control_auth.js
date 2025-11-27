const wrapper = document.querySelector('.wrapper');
const btnPopup = document.querySelector('.btnLogin-popup');
const iconClose = document.querySelector('.icon-close');

btnPopup.addEventListener('click', () => {
    wrapper.classList.add('active-popup');
});
iconClose.addEventListener('click', () => {
    wrapper.classList.remove('active-popup');
});

document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const userid   = document.querySelector('input[type="userid"]').value.trim();
    const password = document.querySelector('input[type="password"]').value;
    const correctUserHash = "b0305c3e8e9f6c4f8d8d1e8f5a6b7c8d9e0f1a2b3c4d5e6f7890abcd12345678";
    const correctPassHash = "7d88f1a2b3c4d5e6f7890a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f";
    const userHash = CryptoJS.SHA256(userid).toString();
    const passHash = CryptoJS.SHA256(password).toString();
    if (userHash === correctUserHash && passHash === correctPassHash) {
        const expiry = Date.now() + 3600000;
        localStorage.setItem("control_access", btoa(expiry));
        localStorage.setItem("control_until", expiry);
        wrapper.classList.remove('active-popup');
        alert("Login successful! Taking you to control panel...");
        window.location.href = "Control_freq.html";
    } else {
        alert("Wrong User ID or Password!");
        document.querySelector('input[type="userid"]').value = "";
        document.querySelector('input[type="password"]').value = "";
    }
});
