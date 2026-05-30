'use strict';



/**
 * add event listener on multiple elements
 */

const addEventOnElements = function (elements, eventType, callback) {
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].addEventListener(eventType, callback);
  }
}



/**
 * PRELOADER
 */

const preloader = document.querySelector("[data-preloader]");

window.addEventListener("DOMContentLoaded", function () {
  preloader.classList.add("loaded");
  document.body.classList.add("loaded");
});



/**
 * NAVBAR
 * navbar toggle for mobile
 */

const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const navToggleBtn = document.querySelector("[data-nav-toggle-btn]");
const navbar = document.querySelector("[data-navbar]");
const overlay = document.querySelector("[data-overlay]");

const toggleNavbar = function () {
  navbar.classList.toggle("active");
  navToggleBtn.classList.toggle("active");
  overlay.classList.toggle("active");
  document.body.classList.toggle("nav-active");
}

addEventOnElements(navTogglers, "click", toggleNavbar);



/**
 * HEADER
 * header active when window scroll down to 100px
 */

const header = document.querySelector("[data-header]");

window.addEventListener("scroll", function () {
  if (window.scrollY >= 100) {
    header.classList.add("active");
  } else {
    header.classList.remove("active");
  }
});



/**
 * SLIDER
 */

const sliders = document.querySelectorAll("[data-slider]");

const initSlider = function (currentSlider) {

  const sliderContainer = currentSlider.querySelector("[data-slider-container]");
  const sliderPrevBtn = currentSlider.querySelector("[data-slider-prev]");
  const sliderNextBtn = currentSlider.querySelector("[data-slider-next]");

  let totalSliderVisibleItems = Number(getComputedStyle(currentSlider).getPropertyValue("--slider-items"));
  let totalSlidableItems = sliderContainer.childElementCount - totalSliderVisibleItems;

  let currentSlidePos = 0;

  const moveSliderItem = function () {
    sliderContainer.style.transform = `translateX(-${sliderContainer.children[currentSlidePos].offsetLeft}px)`;
  }

  /**
   * NEXT SLIDE
   */
  const slideNext = function () {
    const slideEnd = currentSlidePos >= totalSlidableItems;

    if (slideEnd) {
      currentSlidePos = 0;
    } else {
      currentSlidePos++;
    }

    moveSliderItem();
  }

  sliderNextBtn.addEventListener("click", slideNext);

  /**
   * PREVIOUS SLIDE
   */
  const slidePrev = function () {
    if (currentSlidePos <= 0) {
      currentSlidePos = totalSlidableItems;
    } else {
      currentSlidePos--;
    }

    moveSliderItem();
  }

  sliderPrevBtn.addEventListener("click", slidePrev);

  const dontHaveExtraItem = totalSlidableItems <= 0;
  if (dontHaveExtraItem) {
    sliderNextBtn.style.display = 'none';
    sliderPrevBtn.style.display = 'none';
  }

  /**
   * slide with [shift + mouse wheel]
   */

  currentSlider.addEventListener("wheel", function (event) {
    if (event.shiftKey && event.deltaY > 0) slideNext();
    if (event.shiftKey && event.deltaY < 0) slidePrev();
  });

  /**
   * RESPONSIVE
   */

  window.addEventListener("resize", function () {
    totalSliderVisibleItems = Number(getComputedStyle(currentSlider).getPropertyValue("--slider-items"));
    totalSlidableItems = sliderContainer.childElementCount - totalSliderVisibleItems;

    moveSliderItem();
  });

}

for (let i = 0, len = sliders.length; i < len; i++) { initSlider(sliders[i]); }

setInterval(() => {
  for (let i = 0; i < sliders.length; i++) {
    sliders[i].querySelector("[data-slider-next]").click();
  }
}, 4000);



/**
 * BACK TO TOP BUTTON
 */

const backTopBtn = document.querySelector("[data-back-top-btn]");

window.addEventListener("scroll", function () {
  if (window.scrollY >= 100) {
    backTopBtn.classList.add("active");
  } else {
    backTopBtn.classList.remove("active");
  }
});

backTopBtn.addEventListener("click", function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
});



/**
 * DARK / LIGHT THEME TOGGLE
 */

const themeBtn = document.querySelector("[data-theme-btn]");

themeBtn.addEventListener("click", function () {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
});



/**
 * SECTION / TAB NAVIGATION
 * Shows one page-section at a time; nav links act as tabs.
 */

const pageSections = document.querySelectorAll("[data-page]");
const navLinks     = document.querySelectorAll(".navbar-link[href]");

// Expose globally for inline onclick handlers
window.showPage = showPage;

function showPage(pageId) {
  // hide all sections
  pageSections.forEach(function (s) { s.classList.remove("page-active"); });

  // show every element tagged with this page
  document.querySelectorAll('[data-page="' + pageId + '"]').forEach(function (s) {
    s.classList.add("page-active");
  });

  // mark active nav link
  navLinks.forEach(function (link) {
    const target = link.getAttribute("href").replace("#", "");
    link.classList.toggle("page-active", target === pageId);
  });

  // Toggle body page class (used for logo visibility, etc.)
  document.body.className = document.body.className
    .split(" ").filter(function(c) { return !/^page-/.test(c); }).join(" ");
  document.body.classList.add("page-" + pageId);

  window.scrollTo({ top: 0, behavior: "smooth" });
  history.replaceState(null, "", "#" + pageId);

}

// init — respect URL hash, otherwise default to home
const initPage = location.hash ? location.hash.slice(1) : "home";
showPage(initPage);

// wire up nav clicks
navLinks.forEach(function (link) {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    showPage(this.getAttribute("href").replace("#", ""));
  });
});
