(function () {
'use strict'

// Fetch all the forms we want to apply custom Bootstrap validation styles to
var forms = document.querySelectorAll('.validation')

// Loop over them and prevent submission
// turning into an array
Array.from(forms)
// Loop over the array
.forEach(function (form) {
  form.addEventListener('submit', function (event) {
    if (!form.checkValidity()) {
      event.preventDefault()
      event.stopPropagation()
    }

    form.classList.add ('was-validated')
  }, false)
})
})()
