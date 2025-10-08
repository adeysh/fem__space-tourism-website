import "./style.css";
const nav = document.querySelector(".primary-navigation");
const navToggle = document.querySelector(".mobile-nav-toggle");
const navToggleSpanEl = navToggle.querySelector("span");

navToggle.addEventListener("click", () => {
    const visibility = nav.getAttribute("data-visible");
    if (visibility === "false") {
        nav.setAttribute("data-visible", true);
        navToggleSpanEl.setAttribute("aria-expanded", true);
    } else {
        nav.setAttribute("data-visible", false);
        navToggleSpanEl.setAttribute("aria-expanded", false);
    }

    console.log(navToggle.getAttribute("aria-expanded"));
});
