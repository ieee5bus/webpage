document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const userid = document.querySelector('input[type="userid"]').value.trim();
    const password = document.querySelector('input[type="password"]').value;

    const correctUserHash = "0a5e7f04c9da5f1c5d50d5f6e7b8f9a0";
    const correctPassHash = "8f4e3d2d1c0b9a8c7d6e5f4g3h2i1j0k";

    const userHash = CryptoJS.SHA256(userid).toString();
    const passHash = CryptoJS.SHA256(password).toString();

    if (userHash === correctUserHash && passHash === correctPassHash) {
        const expiry = Date.now() + 3600000;
        localStorage.setItem("control_access", btoa(expiry));
        localStorage.setItem("control_until", expiry);
        window.location.href = "Control_freq.html";
    } else {
        alert("Wrong credentials, dheeks!");
        document.querySelector('input[type="userid"]').value = "";
        document.querySelector('input[type="password"]').value = "";
    }
});
