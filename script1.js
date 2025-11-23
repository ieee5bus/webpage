//////////////////   Index page functions   //////////////////////
// Fetch the buttons ids                           
const btnPopup = document.querySelector('.btnLogin-popup');
const informationVisible = document.querySelector('.information');

btnPopup.addEventListener('click', () => {
    window.location.href="register.html";
    informationVisible?.classList.remove("visible");
});