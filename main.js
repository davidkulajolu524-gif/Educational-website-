/*
===========================================
 EduVerse
 Main JavaScript File
===========================================
*/

// -----------------------------
// DOM Elements
// -----------------------------

const body = document.body;
const darkModeButton = document.getElementById("theme-btn");
const mobileMenuButton = document.querySelector(".menu-btn");
const navigation = document.querySelector(".nav-links");
const backToTopButton = document.getElementById("topBtn");
const searchInput = document.getElementById("searchInput");

// -----------------------------
// Dark Mode
// -----------------------------

function toggleDarkMode() {

    body.classList.toggle("dark");

    const icon = darkModeButton.querySelector("i");

    if (body.classList.contains("dark")) {
        icon.classList.replace("fa-moon", "fa-sun");
    } else {
        icon.classList.replace("fa-sun", "fa-moon");
    }

}

darkModeButton.addEventListener("click", toggleDarkMode);

// -----------------------------
// Mobile Navigation
// -----------------------------

mobileMenuButton.addEventListener("click", () => {
    navigation.classList.toggle("active");
});

document.querySelectorAll(".nav-links a").forEach(link => {

    link.addEventListener("click", () => {
        navigation.classList.remove("active");
    });

});

// -----------------------------
// Back To Top Button
// -----------------------------

function handleScroll() {

    if (window.scrollY > 300) {
        backToTopButton.style.display = "block";
    } else {
        backToTopButton.style.display = "none";
    }

}

window.addEventListener("scroll", handleScroll);

backToTopButton.addEventListener("click", () => {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});

// -----------------------------
// Animated Statistics Counter
// -----------------------------

const counters = document.querySelectorAll(".counter");

function animateCounter(counter) {

    const target = Number(counter.dataset.target);
    let currentValue = 0;

    const step = target / 150;

    function updateCounter() {

        currentValue += step;

        if (currentValue < target) {

            counter.textContent = Math.floor(currentValue);

            requestAnimationFrame(updateCounter);

        } else {

            counter.textContent = target.toLocaleString();

        }

    }

    updateCounter();

}

const counterObserver = new IntersectionObserver((entries, observer) => {

    entries.forEach(entry => {

        if (!entry.isIntersecting) return;

        animateCounter(entry.target);

        observer.unobserve(entry.target);

    });

}, {
    threshold: 0.6
});

counters.forEach(counter => counterObserver.observe(counter));


// -----------------------------
// Progress Bar Animation
// -----------------------------

const progressBars = document.querySelectorAll(".fill");

const progressValues = {
    html: "90%",
    css: "80%",
    js: "70%"
};

const progressObserver = new IntersectionObserver((entries, observer) => {

    entries.forEach(entry => {

        if (!entry.isIntersecting) return;

        Object.keys(progressValues).forEach(skill => {

            if (entry.target.classList.contains(skill)) {
                entry.target.style.width = progressValues[skill];
            }

        });

        observer.unobserve(entry.target);

    });

}, {
    threshold: 0.5
});

progressBars.forEach(bar => progressObserver.observe(bar));


// -----------------------------
// Testimonial Slider
// -----------------------------

const testimonials = document.querySelectorAll(".testimonial");

let currentSlide = 0;

function showTestimonial(index) {

    testimonials.forEach(card => {
        card.classList.remove("active");
    });

    testimonials[index].classList.add("active");

}

function nextTestimonial() {

    currentSlide++;

    if (currentSlide >= testimonials.length) {
        currentSlide = 0;
    }

    showTestimonial(currentSlide);

}

showTestimonial(currentSlide);

setInterval(nextTestimonial, 4000);


// -----------------------------
// FAQ Accordion
// -----------------------------

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach(item => {

    const question = item.querySelector(".faq-question");

    question.addEventListener("click", () => {

        item.classList.toggle("active");

    });

});

// -----------------------------
// Course Search
// -----------------------------

const courseCards = document.querySelectorAll(".course-card");

function filterCourses() {

    const searchTerm = searchInput.value.trim().toLowerCase();

    courseCards.forEach(course => {

        const title = course.querySelector("h3").textContent.toLowerCase();

        course.style.display = title.includes(searchTerm)
            ? "block"
            : "none";

    });

}

searchInput.addEventListener("input", filterCourses);


// -----------------------------
// Scroll Reveal Animation
// -----------------------------

const revealElements = document.querySelectorAll(`
    .course-card,
    .category,
    .teacher-card,
    .progress-item,
    .stat,
    .testimonial,
    .faq-item,
    .contact
`);

revealElements.forEach(element => {
    element.classList.add("hidden");
});

const revealObserver = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (!entry.isIntersecting) return;

        entry.target.classList.add("show");
        revealObserver.unobserve(entry.target);

    });

}, {
    threshold: 0.2
});

revealElements.forEach(element => {
    revealObserver.observe(element);
});


// -----------------------------
// Contact Form
// -----------------------------

const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", event => {

    event.preventDefault();

    const name = contactForm.querySelector("input[type='text']");
    const email = contactForm.querySelector("input[type='email']");
    const message = contactForm.querySelector("textarea");

    if (
        !name.value.trim() ||
        !email.value.trim() ||
        !message.value.trim()
    ) {
        alert("Please complete all fields.");
        return;
    }

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.value)) {
        alert("Please enter a valid email address.");
        return;
    }

    alert("Thank you! Your message has been sent.");

    contactForm.reset();

});


// -----------------------------
// Button Ripple Effect
// -----------------------------

const clickableButtons = document.querySelectorAll("button, .btn");

clickableButtons.forEach(button => {

    button.addEventListener("click", event => {

        const ripple = document.createElement("span");

        const size = Math.max(
            button.clientWidth,
            button.clientHeight
        );

        ripple.classList.add("ripple");

        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;

        ripple.style.left =
            `${event.offsetX - size / 2}px`;

        ripple.style.top =
            `${event.offsetY - size / 2}px`;

        const oldRipple = button.querySelector(".ripple");

        if (oldRipple) {
            oldRipple.remove();
        }

        button.appendChild(ripple);

    });

});


// -----------------------------
// Active Navigation Link
// -----------------------------

const pageSections = document.querySelectorAll("section");
const navItems = document.querySelectorAll(".nav-links a");

function updateNavigation() {

    let currentSection = "";

    pageSections.forEach(section => {

        const sectionTop = section.offsetTop - 150;

        if (window.scrollY >= sectionTop) {
            currentSection = section.id;
        }

    });

    navItems.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === `#${currentSection}`) {
            link.classList.add("active");
        }

    });

}

window.addEventListener("scroll", updateNavigation);


// -----------------------------
// Hero Title Animation
// -----------------------------

const heroTitle = document.querySelector(".hero-content h1");

function animateHeroTitle() {

    heroTitle.animate(
        [
            {
                opacity: 0,
                transform: "translateY(40px)"
            },
            {
                opacity: 1,
                transform: "translateY(0)"
            }
        ],
        {
            duration: 900,
            easing: "ease-out",
            fill: "forwards"
        }
    );

}

window.addEventListener("load", animateHeroTitle);


// -----------------------------
// Initial Page Setup
// -----------------------------

window.addEventListener("load", () => {

    document.body.style.opacity = "1";

    updateNavigation();

    console.log("EduVerse loaded successfully.");

});