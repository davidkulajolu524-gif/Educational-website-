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
const apiUrl = path => `${window.location.protocol === "file:" ? "http://127.0.0.1:8000" : ""}${path}`;
let marketplaceCourses = [];

// -----------------------------
// Dark Mode
// -----------------------------

function setTheme(theme) {
    body.classList.toggle("dark", theme === "dark");
    localStorage.setItem("eduverse-theme", theme);

    if (!darkModeButton) return;
    const icon = darkModeButton.querySelector("i");
    icon.classList.toggle("fa-sun", theme === "dark");
    icon.classList.toggle("fa-moon", theme !== "dark");
}

function toggleDarkMode() {
    setTheme(body.classList.contains("dark") ? "light" : "dark");
}

setTheme(localStorage.getItem("eduverse-theme") || "light");
darkModeButton?.addEventListener("click", toggleDarkMode);

// -----------------------------
// Mobile Navigation
// -----------------------------

mobileMenuButton?.addEventListener("click", () => {
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

    if (!backToTopButton) return;

    if (window.scrollY > 300) {
            backToTopButton.style.display = "block";
    } else {
        backToTopButton.style.display = "none";
    }

}

window.addEventListener("scroll", handleScroll);

backToTopButton?.addEventListener("click", () => {

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

    if (!testimonials.length) return;

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

    if (!searchInput) return;

    const searchTerm = searchInput.value.trim().toLowerCase();

    courseCards.forEach(course => {

        const title = course.querySelector("h3").textContent.toLowerCase();

        course.style.display = title.includes(searchTerm)
            ? "block"
            : "none";

    });

}

searchInput?.addEventListener("input", filterCourses);

document.querySelectorAll(".lesson-toggle").forEach(button => {
    button.addEventListener("click", () => {
        const list = button.nextElementSibling;
        const isOpen = list.classList.toggle("open");
        button.textContent = isOpen ? "Hide Lessons" : "View Lessons";
    });
});

async function loadLessons() {
    const marketplace = document.getElementById("marketplaceCourses");
    if (marketplace) {
        try {
            marketplaceCourses = await (await fetch(apiUrl("/api/courses"))).json();
            renderMarketplace(marketplaceCourses);
            startPromoTimer();
        } catch (error) {
            marketplace.innerHTML = "<p>Courses are temporarily unavailable. Please refresh and try again.</p>";
        }
        return;
    }
    const homeCourses = document.getElementById("homeCourses");
    if (homeCourses) {
        try {
            const response = await fetch(apiUrl("/api/courses"));
            if (!response.ok) throw new Error("Unable to load courses");
            const courses = await response.json();
            renderHomeCourses(courses);
        } catch (error) {
            homeCourses.innerHTML = "<p>Courses are temporarily unavailable. Please refresh and try again.</p>";
        }
        return;
    }
    const lessonLists = document.querySelectorAll(".lesson-list");
    if (!lessonLists.length) return;

    try {
        const response = await fetch(apiUrl("/api/courses"));
        if (!response.ok) throw new Error("Unable to load lessons");
        const courses = await response.json();
        lessonLists.forEach(list => {
            const course = courses.find(item => item.id === Number(list.closest(".course-card").dataset.courseId));
            if (!course) return;
            list.innerHTML = course.lesson_list.map(lesson => `<li><strong>${lesson.title}</strong><br>${lesson.topic}</li>`).join("");
        });
    } catch (error) {
        lessonLists.forEach(list => { list.innerHTML = "<li>Lessons will be available soon.</li>"; });
    }
}

loadLessons();

function renderHomeCourses(courses) {
    const homeCourses = document.getElementById("homeCourses");
    if (!homeCourses) return;
    homeCourses.innerHTML = courses.map(course => `<article class="course-card" data-course-id="${course.id}"><i class="fa-solid fa-book-open"></i><h3>${course.title}</h3><p>${course.category} learning path with practical topics and projects.</p><span>${course.lessons} Lessons</span>${course.price > 0 ? `<button class="btn home-enroll-button" data-course-id="${course.id}" type="button">Pay $${promoIsActive(course) ? course.price : course.original_price}</button>` : `<button class="btn home-enroll-button" data-course-id="${course.id}" type="button">Start course</button>`}<button class="lesson-toggle" type="button">View topics</button><ol class="lesson-list">${course.lesson_list.map(lesson => `<li><strong>${lesson.title}</strong><br>${lesson.topic}</li>`).join("")}</ol></article>`).join("");
    homeCourses.querySelectorAll(".lesson-toggle").forEach(button => button.addEventListener("click", () => {
        const list = button.nextElementSibling;
        const open = list.classList.toggle("open");
        button.textContent = open ? "Hide topics" : "View topics";
    }));
    homeCourses.querySelectorAll(".home-enroll-button").forEach(button => button.addEventListener("click", () => {
        const course = courses.find(item => item.id === Number(button.dataset.courseId));
        if (course.price > 0) openCheckout(course);
        else openCourse(course.id);
    }));
}

function openCourse(courseId) {
    const user = JSON.parse(localStorage.getItem("eduverse-user") || "null");
    const destination = `learn.html?course=${courseId}`;
    if (!user) {
        window.location.href = `auth.html?returnTo=${encodeURIComponent(destination)}`;
        return;
    }
    const enrolled = JSON.parse(localStorage.getItem("eduverse-enrolled") || "[]");
    if (!enrolled.includes(courseId)) {
        enrolled.push(courseId);
        localStorage.setItem("eduverse-enrolled", JSON.stringify(enrolled));
    }
    window.location.href = destination;
}

function openCheckout(course) {
    if (!course || course.price <= 0) return;
    const user = JSON.parse(localStorage.getItem("eduverse-user") || "null");
    if (!user) {
        window.location.href = `auth.html?returnTo=${encodeURIComponent(`learn.html?course=${course.id}`)}`;
        return;
    }
    const modal = document.getElementById("checkoutModal") || createCheckoutModal();
    modal.querySelector("[data-checkout-title]").textContent = `Complete ${course.title}`;
    modal.querySelector("[data-checkout-price]").textContent = `$${promoIsActive(course) ? course.price : course.original_price}`;
    modal.querySelector("#checkoutCourseId").value = course.id;
    modal.querySelector("#checkoutForm").reset();
    modal.querySelector("#checkoutCourseId").value = course.id;
    modal.querySelector("#checkoutMessage").textContent = "";
    modal.hidden = false;
    modal.querySelector("#checkoutCardholder").focus();
}

function createCheckoutModal() {
    const modal = document.createElement("div");
    modal.id = "checkoutModal";
    modal.className = "checkout-modal";
    modal.hidden = true;
    modal.innerHTML = `<div class="checkout-dialog" role="dialog" aria-modal="true" aria-labelledby="checkoutTitle"><button class="checkout-close" type="button" aria-label="Close checkout"><i class="fa-solid fa-xmark"></i></button><p class="eyebrow">SECURE CHECKOUT</p><h2 id="checkoutTitle" data-checkout-title>Complete payment</h2><div class="checkout-total"><span>Course access</span><strong data-checkout-price>$0</strong></div><form id="checkoutForm"><input id="checkoutCourseId" type="hidden"><label for="checkoutCardholder">Cardholder name</label><input id="checkoutCardholder" name="cardholder" autocomplete="cc-name" required><label for="checkoutCardType">Card type</label><select id="checkoutCardType" name="cardType" required><option value="">Select card type</option><option value="Visa">Visa</option><option value="Mastercard">Mastercard</option><option value="American Express">American Express</option><option value="Discover">Discover</option></select><label for="checkoutCardNumber">Card number</label><input id="checkoutCardNumber" name="cardNumber" inputmode="numeric" autocomplete="cc-number" minlength="12" maxlength="19" placeholder="1234 5678 9012 3456" required><div class="checkout-fields"><div><label for="checkoutExpiry">Expiry</label><input id="checkoutExpiry" name="expiry" autocomplete="cc-exp" placeholder="MM/YY" pattern="(0[1-9]|1[0-2])\\/[0-9]{2}" required></div><div><label for="checkoutCvc">CVC</label><input id="checkoutCvc" name="cvc" inputmode="numeric" autocomplete="cc-csc" minlength="3" maxlength="4" required></div></div><p id="checkoutMessage" class="checkout-message" role="status"></p><button class="certificate-button checkout-submit" type="submit"><i class="fa-solid fa-lock"></i> Pay and start course</button></form></div>`;
    document.body.appendChild(modal);
    modal.querySelector(".checkout-close").addEventListener("click", () => { modal.hidden = true; });
    modal.addEventListener("click", event => { if (event.target === modal) modal.hidden = true; });
    modal.querySelector("#checkoutForm").addEventListener("submit", event => {
        event.preventDefault();
        const courseId = Number(modal.querySelector("#checkoutCourseId").value);
        const cardType = modal.querySelector("#checkoutCardType").value;
        const cardNumber = modal.querySelector("#checkoutCardNumber").value.replace(/\D/g, "");
        const cardPrefixes = { Visa: /^4/, Mastercard: /^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/, "American Express": /^3[47]/, Discover: /^(6011|65|64[4-9])/ };
        if (!cardPrefixes[cardType]?.test(cardNumber)) {
            modal.querySelector("#checkoutMessage").textContent = `Enter a valid ${cardType} card number.`;
            modal.querySelector("#checkoutCardNumber").focus();
            return;
        }
        const enrolled = JSON.parse(localStorage.getItem("eduverse-enrolled") || "[]");
        if (!enrolled.includes(courseId)) enrolled.push(courseId);
        localStorage.setItem("eduverse-enrolled", JSON.stringify(enrolled));
        modal.hidden = true;
        window.location.href = `learn.html?course=${courseId}`;
    });
    return modal;
}

function promoIsActive(course) {
    return course.promo_ends && new Date(course.promo_ends) > new Date();
}

function renderMarketplace(courses) {
    const marketplace = document.getElementById("marketplaceCourses");
    if (!marketplace) return;
    const term = searchInput?.value.trim().toLowerCase() || "";
    const filtered = courses.filter(course => course.title.toLowerCase().includes(term) || course.category.toLowerCase().includes(term));
    marketplace.innerHTML = filtered.map(course => {
        const active = promoIsActive(course);
        const paid = course.price > 0;
        const enrolled = JSON.parse(localStorage.getItem("eduverse-enrolled") || "[]").includes(course.id);
        return `<article class="course-card marketplace-card" data-course-id="${course.id}"><div class="marketplace-card-top"><span class="course-type ${paid ? "paid" : "free"}">${course.type}</span>${active ? `<span class="discount-badge">-${course.discount}%</span>` : ""}</div><i class="fa-solid ${paid ? "fa-layer-group" : "fa-gift"}"></i><h3>${course.title}</h3><p>${course.category} learning path with practical topics and projects.</p><span>${course.lessons} Lessons</span><div class="price-row">${paid ? `<strong>$${active ? course.price : course.original_price}</strong>${active ? `<del>$${course.original_price}</del>` : ""}` : "<strong>Free</strong>"}</div><button class="enroll-button" data-course-id="${course.id}" type="button">${enrolled ? "Open course" : paid ? "Enroll now" : "Enroll free"}</button><button class="lesson-toggle" type="button">View topics</button><ol class="lesson-list">${course.lesson_list.map(lesson => `<li><strong>${lesson.title}</strong><br>${lesson.topic}</li>`).join("")}</ol></article>`;
    }).join("") || "<p>No courses match that search.</p>";
    marketplace.querySelectorAll(".lesson-toggle").forEach(button => button.addEventListener("click", () => {
        const list = button.nextElementSibling;
        const open = list.classList.toggle("open");
        button.textContent = open ? "Hide topics" : "View topics";
    }));
    marketplace.querySelectorAll(".enroll-button").forEach(button => button.addEventListener("click", () => {
        const id = Number(button.dataset.courseId);
        const course = courses.find(item => item.id === id);
        const enrolled = JSON.parse(localStorage.getItem("eduverse-enrolled") || "[]");
        if (!JSON.parse(localStorage.getItem("eduverse-user") || "null")) {
            window.location.href = `auth.html?returnTo=${encodeURIComponent(`learn.html?course=${id}`)}`;
            return;
        }
        if (course.price > 0 && !enrolled.includes(id)) {
            openCheckout(course);
            return;
        }
        if (!enrolled.includes(id)) {
            enrolled.push(id);
            localStorage.setItem("eduverse-enrolled", JSON.stringify(enrolled));
        }
        openCourse(id);
    }));
}

searchInput?.addEventListener("input", () => {
    if (marketplaceCourses.length) renderMarketplace(marketplaceCourses);
});

function startPromoTimer() {
    const timer = document.getElementById("promoTimer");
    const promoCourse = marketplaceCourses.find(course => promoIsActive(course));
    if (!timer || !promoCourse) { if (timer) timer.textContent = "Explore free and paid courses"; return; }
    const update = () => {
        const remaining = Math.max(0, new Date(promoCourse.promo_ends) - new Date());
        if (!remaining) { timer.textContent = "Promo ended. Prices are back to normal."; renderMarketplace(marketplaceCourses); return; }
        const hours = Math.floor(remaining / 3600000);
        const minutes = Math.floor((remaining % 3600000) / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        timer.textContent = `Limited offer ends in ${hours}h ${minutes}m ${seconds}s`;
    };
    update();
    setInterval(update, 1000);
}

const authForm = document.getElementById("authForm");
const authMessage = document.getElementById("authMessage");
const authNameField = document.getElementById("nameField");
const authPassword = document.getElementById("authPassword");
const authSubmit = document.querySelector(".auth-submit");
let authMode = "signup";

document.querySelectorAll(".auth-tab").forEach(tab => {
    tab.addEventListener("click", () => {
        authMode = tab.dataset.mode;
        document.querySelectorAll(".auth-tab").forEach(item => item.classList.toggle("active", item === tab));
        authNameField.hidden = authMode === "login";
        document.getElementById("authName").required = authMode === "signup";
        authPassword.autocomplete = authMode === "login" ? "current-password" : "new-password";
        authSubmit.textContent = authMode === "login" ? "Log in" : "Create account";
        authMessage.textContent = "";
    });
});

authForm?.addEventListener("submit", async event => {
    event.preventDefault();
    authSubmit.disabled = true;
    authSubmit.textContent = authMode === "login" ? "Logging in..." : "Creating account...";
    authMessage.textContent = "";

    try {
        const response = await fetch(apiUrl(`/api/${authMode}`), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.fromEntries(new FormData(authForm)))
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || "Something went wrong.");
        authMessage.textContent = result.message;
        authMessage.className = "auth-message success";
        localStorage.setItem("eduverse-user", JSON.stringify({ name: result.name, email: authForm.email.value }));
        if (authMode === "signup") authForm.reset();
        const returnTo = new URLSearchParams(window.location.search).get("returnTo");
        setTimeout(() => { window.location.href = returnTo || "dashboard.html"; }, 700);
    } catch (error) {
        authMessage.textContent = error instanceof TypeError
            ? "The learning server is unavailable. Open this page through http://127.0.0.1:8000 or start FastAPI."
            : error.message;
        authMessage.className = "auth-message error";
    } finally {
        authSubmit.disabled = false;
        authSubmit.textContent = authMode === "login" ? "Log in" : "Create account";
    }
});

const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const resetPasswordForm = document.getElementById("resetPasswordForm");
const resetEmail = document.getElementById("resetEmail");
const resetMessage = document.getElementById("resetMessage");

forgotPasswordForm?.addEventListener("submit", async event => {
    event.preventDefault();
    const submit = forgotPasswordForm.querySelector("button");
    submit.disabled = true;
    resetMessage.textContent = "";
    try {
        const response = await fetch(apiUrl("/api/forgot-password"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: resetEmail.value })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || "Unable to create a reset code.");
        resetMessage.textContent = result.reset_token ? `${result.message} Your local reset code is ${result.reset_token}` : result.message;
        resetMessage.className = "auth-message success";
        resetPasswordForm.hidden = false;
    } catch (error) {
        resetMessage.textContent = error instanceof TypeError ? "The learning server is unavailable." : error.message;
        resetMessage.className = "auth-message error";
    } finally {
        submit.disabled = false;
    }
});

resetPasswordForm?.addEventListener("submit", async event => {
    event.preventDefault();
    const submit = resetPasswordForm.querySelector("button");
    submit.disabled = true;
    try {
        const response = await fetch(apiUrl("/api/reset-password"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: resetEmail.value, token: resetPasswordForm.token.value, password: resetPasswordForm.password.value })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || "Unable to reset password.");
        resetMessage.textContent = result.message;
        resetMessage.className = "auth-message success";
        resetPasswordForm.reset();
        forgotPasswordForm.hidden = true;
        resetPasswordForm.hidden = true;
    } catch (error) {
        resetMessage.textContent = error instanceof TypeError ? "The learning server is unavailable." : error.message;
        resetMessage.className = "auth-message error";
    } finally {
        submit.disabled = false;
    }
});


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

    if (!heroTitle) return;

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

    const contactForm = document.getElementById("contactForm");
    contactForm?.addEventListener("submit", async event => {
        event.preventDefault();
        const button = contactForm.querySelector("button");
        button.disabled = true;
        button.textContent = "Sending...";

        try {
            const response = await fetch(contactForm.action, {
                method: "POST",
                headers: { "Accept": "application/json" },
                body: new FormData(contactForm)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.detail || "Unable to send message.");
            contactForm.reset();
            button.textContent = result.email_sent ? "Message sent" : "Message received";
        } catch (error) {
            button.textContent = error.message;
        } finally {
            setTimeout(() => {
                button.disabled = false;
                button.textContent = "Send Message";
            }, 3000);
        }
    });

});

const dashboard = document.getElementById("dashboard");

async function loadDashboard() {
    if (!dashboard) return;
    const user = JSON.parse(localStorage.getItem("eduverse-user") || "null");
    if (!user) {
        window.location.href = "auth.html";
        return;
    }

    document.getElementById("studentName").textContent = user.name;
    document.getElementById("studentEmail").textContent = user.email;
    const progress = JSON.parse(localStorage.getItem("eduverse-progress") || "{}");
    const response = await fetch(apiUrl("/api/courses"));
    const courses = await response.json();
    const courseList = document.getElementById("dashboardCourses");
    courseList.innerHTML = courses.map(course => {
        const completed = Array.isArray(progress[course.id]) ? progress[course.id].length : (progress[course.id] || 0);
        const percent = Math.round((completed / course.lesson_list.length) * 100);
        return `<article class="dashboard-course"><div class="course-heading"><div><p class="eyebrow">${course.category}</p><h3>${course.title}</h3></div><strong>${percent}%</strong></div><p>${completed} of ${course.lesson_list.length} featured lessons complete</p><div class="bar"><div class="fill dashboard-fill" style="width: ${percent}%"></div></div><a class="start-lesson" href="learn.html?course=${course.id}">${percent ? "Continue learning" : "Start learning"}</a></article>`;
    }).join("");
}

document.getElementById("logoutButton")?.addEventListener("click", () => {
    localStorage.removeItem("eduverse-user");
    window.location.href = "index.html";
});

loadDashboard();

const learningPage = document.getElementById("learningPage");

async function loadLearningPage() {
    if (!learningPage) return;
    const user = JSON.parse(localStorage.getItem("eduverse-user") || "null");
    if (!user) { window.location.href = `auth.html?returnTo=${encodeURIComponent(window.location.pathname.split("/").pop() + window.location.search)}`; return; }
    const courseId = Number(new URLSearchParams(window.location.search).get("course"));
    const courses = await (await fetch(apiUrl("/api/courses"))).json();
    const course = courses.find(item => item.id === courseId) || courses[0];
    const progress = JSON.parse(localStorage.getItem("eduverse-progress") || "{}");
    const completedLessons = Array.isArray(progress[course.id]) ? progress[course.id] : Array.from({ length: progress[course.id] || 0 }, (_, index) => index);
    document.getElementById("learningCategory").textContent = course.category;
    document.getElementById("learningTitle").textContent = course.title;
    document.getElementById("learningCount").textContent = `${completedLessons.length} of ${course.lesson_list.length} lessons complete`;
    const lessonList = document.getElementById("learningLessons");
    lessonList.innerHTML = course.lesson_list.map((lesson, index) => `<li class="learning-lesson ${completedLessons.includes(index) ? "completed" : ""}"><button class="lesson-complete" data-index="${index}" type="button"><i class="fa-solid ${completedLessons.includes(index) ? "fa-circle-check" : "fa-circle"}"></i></button><span><strong>${lesson.title}</strong><small>${lesson.topic}</small></span></li>`).join("");
    document.getElementById("certificatePanel").hidden = completedLessons.length < course.lesson_list.length;
    document.getElementById("certificateName").textContent = user.name;
    document.getElementById("certificateCourse").textContent = course.title;
    lessonList.querySelectorAll(".lesson-complete").forEach(button => button.addEventListener("click", () => {
        const index = Number(button.dataset.index);
        if (!completedLessons.includes(index)) completedLessons.push(index);
        progress[course.id] = completedLessons.sort((first, second) => first - second);
        localStorage.setItem("eduverse-progress", JSON.stringify(progress));
        loadLearningPage();
    }));
}

document.getElementById("printCertificate")?.addEventListener("click", () => window.print());
loadLearningPage();

const certificatesPage = document.getElementById("certificatesPage");

async function loadCertificates() {
    if (!certificatesPage) return;
    const user = JSON.parse(localStorage.getItem("eduverse-user") || "null");
    if (!user) { window.location.href = "auth.html"; return; }
    document.getElementById("certificateStudentName").textContent = user.name;
    const progress = JSON.parse(localStorage.getItem("eduverse-progress") || "{}");
    const courses = await (await fetch(apiUrl("/api/courses"))).json();
    const earned = courses.filter(course => Array.isArray(progress[course.id]) && progress[course.id].length >= course.lesson_list.length);
    const list = document.getElementById("certificateList");
    list.innerHTML = earned.length ? earned.map(course => `<article class="earned-certificate"><i class="fa-solid fa-award"></i><div><p class="eyebrow">CERTIFICATE OF COMPLETION</p><h3>${course.title}</h3><p>Earned by ${user.name}</p></div><a class="certificate-button" href="learn.html?course=${course.id}">View certificate</a></article>`).join("") : "<div class=\"empty-state\"><i class=\"fa-solid fa-award\"></i><h3>Your certificates will appear here</h3><p>Complete every lesson in a course to earn your first certificate.</p><a class=\"text-link\" href=\"courses.html\">Find a course <i class=\"fa-solid fa-arrow-right\"></i></a></div>";
}

loadCertificates();