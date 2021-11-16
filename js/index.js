//define database
let db;
let databaseName = 'usersDatabase';
let databaseVersion = 1;
//initialize database
init();

async function init() {
 db = await idb.openDb(databaseName, databaseVersion, db => {
    db.createObjectStore('users', {keyPath: 'name'});
  });
  list();
}
async function list() {
  let tx = db.transaction('users');
  let userStore = tx.objectStore('users');
  let users = await userStore.getAll();

  if (users.length) {
    let listElem = users.map(user => `${user.name}, ${user.email} `).join('');
      console.log(listElem);
  } else {
      console.log("No Users yet");
  }
}
//store data of sign up form
async function signUp() {
 let tx = db.transaction('users', 'readwrite'); //readonly
 
 let name = document.querySelector("#name").value; 
 let email = document.querySelector("#email").value;
 try {
  await tx.objectStore('users').add({name, email});   
 } catch(err) {
    if (err.name == 'ConstraintError' || err.email === 'ConstraintError') {
      console.log("Such user exists already!");
      return;
  } else {
      throw err;
    }
  }
}
//async function getUser() {
//
//}
window.addEventListener('unhandledrejection', event => {
  alert("Error: " + event.reason.message);
});
