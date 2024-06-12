overrideFormSubmit();
function overrideFormSubmit(){
  const form = document.querySelector("form");

  if (form){
    form.addEventListener('submit', (event) => {
      event.preventDefault(); // Prevent the default form submission behavior
      if (form.getAttribute('action')){
        const formData = new FormData(form); // Create a new FormData object from the form
        const data = {}
        const pending = []
        for (let [key, value] of formData.entries()) {
          if (value instanceof File) {
            const reader = new FileReader();
            reader.readAsDataURL(value)
            pending.push(1)
            reader.onload = function() {
              const base64Data = reader.result.replace(/^data:.+;base64,/, '');
              const file = { name: value.name}
              if (value.uploaded)
                file.uploaded = true
              else
                file.base64 = base64Data
              if (data[key])
                data[key].push(file)
              else
                data[key] = [file];
              pending.pop()
              if (!pending.length)
                submitForm()
            }
          } else {
            data[key] = value
          }
        }

        const url = form.getAttribute('action'); // Get the API endpoint URL from the form action attribute
        const method = form.getAttribute('method') || 'get'; // Get the HTTP method from the form method attribute
        
        if (!pending.length)
          submitForm()

        function submitForm(){      
          fetch(url, {
            method: method,
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          })
            .then(response => {
              console.log('Success:', response);
              if (response.redirected){
                window.location.href = response.url;
              } else {
                if (response.ok)
                  location.reload()
              }
              // Do something with the response data
            })
            .catch((error) => {
              console.error('Error:', error);
              // Handle any errors that occur during the fetch request
            })
        }
      }
    });
  }
}

