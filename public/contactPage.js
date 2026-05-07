async function loadMessageCount() {
    try {
        const res = await fetch('/api/contacts');
        const json = await res.json();
        const count = (json.contacts || []).length;
        const el = document.getElementById('messageCount');
        if (el) el.textContent = `${count} request message${count !== 1 ? 's' : ''} submitted so far.`;
    } catch (e) {}
}

window.addEventListener('DOMContentLoaded', loadMessageCount);

document.getElementById('helpForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value.trim();
    const lastName  = document.getElementById('lastName').value.trim();
    const email     = document.getElementById('email').value.trim();
    const subject   = document.getElementById('subject').value;
    const message   = document.getElementById('message').value.trim();
    const errEl     = document.getElementById('formError');
    const submitBtn = document.querySelector('#helpForm button[type="submit"]');

    if (!firstName || !lastName || !email || !subject || !message) {
        errEl.textContent = 'Please fill in all required fields before submitting.';
        errEl.style.display = 'block';
        return;
    }

    errEl.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        const res = await fetch('/contactPage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, email, subject, message })
        });

        const json = await res.json();

        if (!res.ok) {
            throw new Error(json.error || 'Submission failed.');
        }

        const params = new URLSearchParams({ firstName, lastName });
        window.location.href = `confirmationPage.html?${params.toString()}`;
    } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Request';
    }
});
