document.addEventListener('DOMContentLoaded', ()=>{
    const allButtons = document.querySelectorAll('.searchBtn');
    const searchBar = document.querySelector('.searchBar');
    const searchInput = document.getElementById('searchInput');
    const searchClose = document.getElementById('searchClose');


       for(let i=0; i< allButtons.length; i++){
        allButtons[i].addEventListener('click', ()=>{
            searchBar.style.visibility = 'visible';
            searchBar.classList.add('open');
           // this.setAttribute('aria-expanded', 'true');
         searchInput.focus();
        })
       }
   

       searchClose.addEventListener('click', ()=>{
            searchBar.style.visibility = 'hidden';
            searchBar.classList.remove('open');
           // this.setAttribute('aria-expanded', 'true');
         
        })
})


document.getElementById('logoutButton').addEventListener('click', function () {
  // Send a GET request to the /logout route
  fetch('/logout', {
      method: 'GET',
      credentials: 'same-origin'  // This is important for sending cookies with the request
  })
  .then(response => {
      if (response.ok) {
          // Redirect to login or home page after successful logout
          window.location.href = '/admin';  // Adjust to the login page or another page
      } else {
          console.error('Logout failed');
      }
  })
  .catch(error => {
      console.error('Error during logout:', error);
  });
});




