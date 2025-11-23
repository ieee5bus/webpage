const wrapper = document.querySelector('.wrapper');
const btnPopup = document.querySelector('.btnLogin-popup');
const iconClose = document.querySelector('.icon-close');

btnPopup.addEventListener('click', () => {
    wrapper.classList.add('active-popup');
});

iconClose.addEventListener('click', () => {
    wrapper.classList.remove('active-popup');
});

document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const userid = e.target.querySelector('input[type="userid"]').value;
    const password = e.target.querySelector('input[type="password"]').value;
    const encodedUserId = atob("aWVlZTVidXNAYW1yaXRh");
    const encodedPassword = atob("ZWVlQDIxMjU="); 

    if (userid === encodedUserId && password === encodedPassword) {
        window.location.href = "Control_freq.html";
    } else {
        alert("Invalid Credentials. Try again!");
    }
});