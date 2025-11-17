# project-delta
UI FIX for UNA class registration

User story
As a new web developer who is a studet at this university.
I wanted to try and fix so UI/UX of whe way the registration page looks(just a sample of classes).
So that other students like me can have an easier time registration for classes.

Test Case
Should take about two clicks to select. This message is at the bottome of the page: Selected: MA 101 (MWF 8:00 to 8:50 AM) • Total clicks: 2.

ChatGPT was used to help create most of the CSS, JS, HTML. Was updated to look better. Used VS code, bootstrap 5, Google fonts, NU Validator, WAVE, Google Chrome, GitHub and GitHub Pages

NU Validator

```js

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
