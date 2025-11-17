// app.js
// Subjects list provided by you

const SUBJECTS = {
    MA: [
        { code: '101', time: 'MWF 8:00 to 8:50 AM' },
        { code: '102', time: 'MWF 9:00 to 9:50 AM' },
        { code: '201', time: 'MWF 10:00 to 10:50 AM' },
        { code: '221', time: 'MWF 12:00 to 12:50 PM' },
        { code: '300', time: 'MWF 1:00 to 1:50 PM' }
    ],
    CS: [
        { code: '110', time: 'MW 8:00 to 9:15 AM' },
        { code: '210', time: 'MWF 3:00 to 3:30 PM' },
        { code: '250', time: 'TTH 10:30 to 11:15 AM' },
        { code: '320', time: 'MWF 2:00 to 2:50 PM' },
        { code: '411', time: 'MW 4:00 to 5:00 PM' }
    ],
    EN: [
        { code: '101', time: 'MW 8:30 to 9:20 AM' },
        { code: '201', time: 'MW9:30 to 10:45 AM' },
        { code: '305', time: 'MWF11:00 to 11:50 AM' },
        { code: '320', time: 'TTH 12:30 to 1:20 PM' }
    ],
    BI: [
        { code: '101', time: 'MWF 7:45 to 8:35 AM' },
        { code: '150', time: 'MWF 9:00 to 9:50 AM' },
        { code: '210', time: 'MWF 1:00 to 1:50 PM' },
        { code: '310', time: 'MWF 3:00 to 3:50 PM' }
    ],
    HI: [
        { code: '101', time: 'TTH 8:00 to 8:50 AM' },
        { code: '210', time: 'TTH 11:00 to 11:50 AM' },
        { code: '300', time: 'TTH 1:30 to 2:20 PM' },
        { code: '405', time: 'TTH 3:30 to 4:45 PM' }
    ],
    PH: [
        { code: '101', time: 'TTH 9:00 to 9:50 AM' },
        { code: '202', time: 'TTH 10:00 to 11:15 AM' },
        { code: '303', time: 'TTH 2:00 to 3:15 PM' }
    ],
    CIS: [
        { code: '225', time: 'TTH 8:00 to 9:20 AM' },
        { code: '315', time: 'TTH 9:30 to 10:45 AM' },
        { code: '330', time: 'TTH 11:00 to 12:15 PM' },
        { code: '344', time: 'TTH 1:00 to 1:50 PM' },
        { code: '366', time: 'TTH 2:00 to 3:15 PM' },
        { code: '376', time: 'TTH 3:30 to 4:45 PM' }
    ],
    ITE: [
        { code: '249', time: 'MWF 10:00 to 10:50 AM' },
        { code: '379', time: 'MWF 1:30 to 2:20 PM' }
    ]
};

((function initApp() {
    try {
        // DOM nodes
        const subjectGroup = document.getElementById('subjectGroup');
        const courseList = document.getElementById('courseList');
        const searchInput = document.getElementById('searchInput');
        const selectBtn = document.getElementById('selectBtn');
        const clearBtn = document.getElementById('clearBtn');
        const clickCountEl = document.getElementById('clickCount');
        const timeElapsedEl = document.getElementById('timeElapsed');
        const statsArea = document.getElementById('statsArea');

        // Defensive check
        if (!subjectGroup || !courseList || !searchInput || !selectBtn || !clearBtn || !clickCountEl || !timeElapsedEl || !statsArea) {
            console.error('[ClassPicker] Missing required DOM nodes. Make sure the HTML IDs exist.');
            return;
        }

        // Click counting variables (counts until Select clicked)
        let clickCounter = 0;
        let clickCountingActive = true;
        let startTime = performance.now();

        // Other app state
        let selectedCourses = [];
        const statsLog = []; // keeps action history (not used for counting)

        // safe counting wrapped in try/catch
        function safeCountClick(action = '') {
            try {
                if (!clickCountingActive) return;
                clickCounter += 1;
                // update the small UI counter and elapsed time
                if (clickCountEl) clickCountEl.textContent = clickCounter;
                if (timeElapsedEl) timeElapsedEl.textContent = ((performance.now() - startTime) / 1000).toFixed(2);
                console.debug('[ClickCounter] +1', action, 'total=', clickCounter);
            } catch (err) {
                console.error('safeCountClick failed', err);
            }
        }

        function stopClickCounting() {
            try {
                clickCountingActive = false;
                console.debug('[ClickCounter] STOPPED at', clickCounter);
                // update stats area with final result
                statsArea.textContent = `Total clicks before selecting: ${clickCounter}`;
            } catch (err) {
                console.error('stopClickCounting failed', err);
            }
        }

        function resetClickCounter() {
            try {
                clickCounter = 0;
                clickCountingActive = true;
                startTime = performance.now();
                if (clickCountEl) clickCountEl.textContent = clickCounter;
                if (timeElapsedEl) timeElapsedEl.textContent = '0.00';
                console.debug('[ClickCounter] RESET');
            } catch (err) {
                console.error('resetClickCounter failed', err);
            }
        }

        // helper to enable/disable select button
        function updateSelectState() {
            const has = selectedCourses.length > 0;
            selectBtn.disabled = !has;
            selectBtn.setAttribute('aria-disabled', String(!has));
        }

        // render subject buttons
        function renderSubjects() {
            subjectGroup.innerHTML = '';
            Object.keys(SUBJECTS).forEach(sub => {
                const btn = document.createElement('button');
                btn.className = 'subject';
                btn.type = 'button';
                btn.setAttribute('role', 'tab');
                btn.setAttribute('aria-pressed', 'false');
                btn.textContent = sub;
                btn.addEventListener('click', () => {
                    // count this subject click
                    safeCountClick('subject:' + sub);
                    onSubjectClick(sub, btn);
                });
                btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); } });
                subjectGroup.appendChild(btn);
            });
        }

        // subject click handler (shows courses)
        function onSubjectClick(subject, btnEl) {
            try {
                const pressed = btnEl.getAttribute('aria-pressed') === 'true';
                Array.from(subjectGroup.children).forEach(b => b.setAttribute('aria-pressed', 'false'));
                btnEl.setAttribute('aria-pressed', String(!pressed));

                if (!pressed) showCoursesFor(subject);
                else {
                    clearCourses();
                    searchInput.value = '';
                }

                // log action
                statsLog.push({ action: 'subject-click', subject, t: Date.now() });
            } catch (err) {
                console.error('onSubjectClick failed', err);
            }
        }

        // show course chips (with times)
        function showCoursesFor(subject) {
            try {
                clearCourses();
                const courses = SUBJECTS[subject] || [];
                if (courses.length === 0) {
                    courseList.innerHTML = '<span class="muted">No courses</span>';
                    return;
                }
                const frag = document.createDocumentFragment();
                courses.forEach(courseObj => {
                    const label = `${subject} ${courseObj.code} (${courseObj.time})`;
                    const chip = document.createElement('button');
                    chip.className = 'chip';
                    chip.type = 'button';
                    chip.tabIndex = 0;
                    chip.setAttribute('aria-pressed', 'false');
                    chip.textContent = label;
                    chip.title = `Toggle selection ${label}`;
                    frag.appendChild(chip);
                });
                courseList.appendChild(frag);
                // prefill search input for discoverability
                searchInput.value = courses.map(c => `${subject} ${c.code} (${c.time})`).join(', ');
            } catch (err) {
                console.error('showCoursesFor failed', err);
            }
        }

        // clear courses and selection
        function clearCourses() {
            try {
                courseList.innerHTML = '';
                selectedCourses = [];
                updateSelectState();
            } catch (err) {
                console.error('clearCourses failed', err);
            }
        }

        // event delegation for chips: toggles selection and counts the click
        courseList.addEventListener('click', (ev) => {
            try {
                const chip = ev.target.closest('.chip');
                if (!chip) return;

                // count the user click (chip)
                safeCountClick('chip:' + chip.textContent.trim());

                const label = chip.textContent.trim();
                const wasPressed = chip.getAttribute('aria-pressed') === 'true';
                const nowPressed = !wasPressed;

                // visual & aria toggle
                chip.setAttribute('aria-pressed', String(nowPressed));
                chip.classList.toggle('selected', nowPressed);

                // update selected array
                if (nowPressed) {
                    if (!selectedCourses.includes(label)) selectedCourses.push(label);
                } else {
                    selectedCourses = selectedCourses.filter(s => s !== label);
                }

                // update input and select state
                searchInput.value = selectedCourses.join(', ');
                updateSelectState();

                // log
                statsLog.push({ action: 'chip-toggle', label, selected: nowPressed, t: Date.now() });
            } catch (err) {
                console.error('courseList click handler failed', err);
            }
        });

        // keyboard handling for chips (Enter/Space) — delegation via keydown
        courseList.addEventListener('keydown', (ev) => {
            try {
                const chip = ev.target.closest('.chip');
                if (!chip) return;
                if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault();
                    chip.click();
                }
            } catch (err) {
                console.error('courseList keydown failed', err);
            }
        });

        // Select button — STOP counting when clicked
        selectBtn.addEventListener('click', () => {
            try {
                // stop counting before reporting
                stopClickCounting();

                if (selectedCourses.length === 0) {
                    statsArea.textContent = `No courses selected. Total clicks before selecting: ${clickCounter}`;
                } else {
                    // show selection plus the click summary
                    statsArea.textContent = `Selected: ${selectedCourses.join(', ')} • Total clicks: ${clickCounter}`;
                    console.log('[ClassPicker] Selected courses:', selectedCourses);
                    // optionally record selection in log
                    statsLog.push({ action: 'select', selected: [...selectedCourses], clickTotal: clickCounter, t: Date.now() });
                }
            } catch (err) {
                console.error('selectBtn handler failed', err);
            }
        });

        // Clear button — resets count and clears selection
        clearBtn.addEventListener('click', () => {
            try {
                resetClickCounter();
                clearCourses();
                searchInput.value = '';
                statsArea.textContent = 'Selection cleared.';
                statsLog.push({ action: 'clear', t: Date.now() });
            } catch (err) {
                console.error('clearBtn handler failed', err);
            }
        });

        // initialize UI
        renderSubjects();
        updateSelectState();
        // initial UI count/time values
        if (clickCountEl) clickCountEl.textContent = clickCounter;
        if (timeElapsedEl) timeElapsedEl.textContent = '0.00';

        // expose for debugging
        window.ClassPicker = {
            SUBJECTS,
            getClickTotal: () => clickCounter,
            isCounting: () => clickCountingActive,
            getSelected: () => [...selectedCourses],
            getLog: () => [...statsLog]
        };

        console.debug('[ClassPicker] init complete');

    } catch (err) {
        console.error('Initialization failed', err);
    }
})());