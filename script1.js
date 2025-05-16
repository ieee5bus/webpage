                            ///////////////////   Index page functions   //////////////////////
// Fetch the buttons ids                           
const wrapper = document.querySelector('.wrapper');
const btnPopup = document.querySelector('.btnLogin-popup');
const informationVisible = document.querySelector('.information');

btnPopup.addEventListener('click', () => {
    window.location.href="register.html";
    informationVisible?.classList.remove("visible");
});

///////////////////   To go to home and about page   //////////////////////
document.addEventListener("DOMContentLoaded", () => {
    const informationBox = document.querySelector(".information");
    const homeSection = document.querySelector("#home");
    setTimeout(() => {
        informationBox.classList.add("visible");
    }, 500);
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    informationBox.classList.add("visible");
                } else {
                    informationBox.classList.remove("visible");
                }
            });
        },
        { threshold: 0.5 }
    );
    observer.observe(homeSection);
});
