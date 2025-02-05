// scripts.js
console.log("Scripts.js cargado");

// Podrías centralizar funciones y luego llamarlas en cada HTML.
// Por ejemplo, un checkAuth para verificar si hay token en localStorage.
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
  }
}
