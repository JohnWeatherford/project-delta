// =======================
// Data
// =======================
const subjects = {
    MATH: ["101", "201", "221", "241"],
    CHEM: ["101", "102", "223"],
    PHYS: ["101", "102", "221", "351"],
    BIOL: ["101", "202", "310"],
    CPSC: ["110", "121", "210", "310"],
};

// =======================
// DOM elements
// =======================
const subjectsEl = document.getElementById("subjects");
const coursesEl = document.getElementById("courses");
const searchbox = document.getElementById("searchbox");
const statsEl = document.getElementById("stats");
const clearBtn = document.getElementById("clearBtn");

// =======================
// Interaction metrics
// =======================
let clickCount = 0;
let startTime = performance.now();

// Update stats on screen
function updateStats() {
    const seconds = ((performance.now() - startTime) / 1000).toFixed(1);
    statsEl.textContent = `Clicks: ${clickCount} • Time: ${seconds}s`;
}

// Record click with error safety
function recordClick() {
    try {
        clickCount++;
        updateStats();
    } catch (err) {
        console.error("Error updating stats:", err);
    }
}

// =======================
// Render Subject Buttons
// =======================
function renderSubjects() {
    subjectsEl.innerHTML = "";

    Object.keys(subjects).forEach((subj) => {
        const btn = document.createElement("button");
        btn.className = "subject";
        btn.textContent = subj;
        btn.setAttribute("aria-pressed", "false");

        btn.addEventListener("click", () => {
            recordClick();
            document
                .querySelectorAll("button.subject")
                .forEach((b) => b.setAttribute("aria-pressed", "false"));
            btn.setAttribute("aria-pressed", "true");
            renderCourses(subj);
        });

        subjectsEl.appendChild(btn);
    });
}

// =======================
// Render Course Chips
// =======================
let selectedCourses = [];

function renderCourses(subject) {
    coursesEl.innerHTML = "";
    selectedCourses = [];

    subjects[subject].forEach((course) => {
        const chip = document.createElement("div");
        chip.className = "chip";
        chip.textContent = course;
        chip.setAttribute("role", "button");
        chip.tabIndex = 0;

        chip.addEventListener("click", () => toggleCourse(course, chip));
        chip.addEventListener("keypress", (e) => {
            if (e.key === "Enter" || e.key === " ") toggleCourse(course, chip);
        });

        coursesEl.appendChild(chip);
    });
}

function toggleCourse(course, chipEl) {
    recordClick();
    if (selectedCourses.includes(course)) {
        selectedCourses = selectedCourses.filter((c) => c !== course);
        chipEl.classList.remove("selected");
    } else {
        selectedCourses.push(course);
        chipEl.classList.add("selected");
    }
    searchbox.value = selectedCourses.join(", ");
}

// =======================
// Clear button
// =======================
clearBtn.addEventListener("click", () => {
    recordClick();
    searchbox.value = "";
    selectedCourses = [];
    document
        .querySelectorAll(".chip")
        .forEach((chip) => chip.classList.remove("selected"));
});

// =======================
// Initialize
// =======================
renderSubjects();
updateStats();