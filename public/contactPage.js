function validateForm() {
            const firstName = document.getElementById('firstName').value.trim();
            const lastName  = document.getElementById('lastName').value.trim();
            const email     = document.getElementById('email').value.trim();
            const subject   = document.getElementById('subject').value;
            const message   = document.getElementById('message').value.trim();
            const errEl     = document.getElementById('formError');

            if (!firstName || !lastName || !email || !subject || !message) {
                errEl.textContent = 'Please fill in all required fields before submitting.';
                errEl.style.display = 'block';
                return false;
            }

            errEl.style.display = 'none';
            return true;
        }