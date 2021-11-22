let today = new Date();
let currentDate = today.getDate();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let currentEnd = 32 - new Date(currentYear, currentMonth, 32).getDate();

let selectYear = document.getElementById("year");
let selectMonth = document.getElementById("month");
let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

let monthAndYear = document.getElementById("monthAndYear");

let userColor = "darkgreen";

let habitTitle;
let habitDescription;
let habitRate;
let habitDate;

let userEmail;
let userName;

let progressTotal;


const DB_NAME = 'habiliti-indexeddb-eHabits-Two';
const DB_VERSION = 1; // Use a long long for this value (don't use a float)
const DB_STORE_NAME = 'habits';


var db;
var dbCalendar;
// Used to keep track of which view is displayed to avoid uselessly reloading it
var current_view_hab_key;

function openDb() {
  console.log("openDb ...");
  let dbName = DB_NAME + userName + userEmail;
  var req = indexedDB.open(dbName, DB_VERSION);
  req.onsuccess = function (evt) {
    // Equal to: db = req.result;
    db = this.result;
    console.log("openDb DONE");
    displayHabitList();
  };
  req.onerror = function (evt) {
    console.error("openDb:", evt.target.errorCode);
  };

  req.onupgradeneeded = function (evt) {
    console.log("openDb.onupgradeneeded");
    var store = evt.currentTarget.result.createObjectStore(
      DB_STORE_NAME, { keyPath: 'id', autoIncrement: true });

    //store.createIndex('biblioid', 'biblioid', { unique: true });
    //store.createIndex('title', 'title', { unique: false });
    //store.createIndex('year', 'year', { unique: false });
    store.createIndex('title', 'title', { unique: false });
    store.createIndex('description', 'description', { unique: false });
    store.createIndex('rate', 'rate', { unique: false });
    store.createIndex('initial', 'initial', { unique: false });
    store.createIndex('name', 'name', { unique: false });
    store.createIndex('email', 'email', { unique: false });

  };
}


/**
 * @param {string} store_name
 * @param {string} mode either "readonly" or "readwrite"
 */
function getObjectStore(store_name, mode) {
  var tx = db.transaction(store_name, mode);
  return tx.objectStore(store_name);
}
//go back to index.html
function signOut() {
  //hide calendar
  if (document.getElementById("calendar").classList.contains('d-none')) {

  }
  else {
    document.getElementById("calendar").classList.add("d-none");
  }
  //hide habitCards
  if (document.getElementById("habit-body").classList.contains('d-none')) {
    // do some stuff
  } else {
    document.getElementById("habit-body").classList.add('d-none');
  }
  //hide navbar
  if (document.getElementById("navbarApp").classList.contains('d-none')) {
    // do some stuff
  } else {
    document.getElementById("navbarApp").classList.add('d-none');
  }
  document.getElementById("navbarIndex").classList.remove('d-none');
  document.getElementById("footerIndex").classList.remove('d-none');
  document.getElementById("index").classList.remove('d-none');
}
function logIn() {
  userName = document.querySelector("#logname").value;
  userEmail = document.querySelector("#logemail").value;
  let divIndex = document.getElementById("index");
  divIndex.classList.add("d-none");
  let divNavIndex = document.getElementById("navbarIndex");
  divNavIndex.classList.add("d-none");
  let appNavbar = document.getElementById("navbarApp");
  appNavbar.classList.remove("d-none");
  let footerIndex = document.getElementById("footerIndex");
  footerIndex.classList.add("d-none");
  askNotificationPermission();

  openDb();
  addEventListeners();
}
function signUp() {
  userName = document.querySelector("#name").value;
  userEmail = document.querySelector("#email").value;
  let divIndex = document.getElementById("index");
  divIndex.classList.add("d-none");
  let divNavIndex = document.getElementById("navbarIndex");
  divNavIndex.classList.add("d-none");
  let appNavbar = document.getElementById("navbarApp");
  appNavbar.classList.remove("d-none");
  let footerIndex = document.getElementById("footerIndex");
  footerIndex.classList.add("d-none");
  askNotificationPermission();

  openDb();
  addEventListeners();
}
/**
 * @param {string} title
 * @param {string} description
 * @param {string} rate
 * @param {string} initial
 * @param {string} date
 * @param {Blob=} blob
 */
function addHabitDate(title, date) {
  console.log("Add habit...");
  actualMonth();

  let cellId = title + "-" + currentYear + "-" + actualCurrentMonth + "-" + date;
  console.log(cellId);
  var obj = { date: cellId };

  var tx = dbCalendar.transaction(["habits"], "readwrite");
  console.log("obj:" + obj);


  tx.oncomplete = function (evt) {
    console.log("Transaction completed.");
  };
  tx.onerror = function (evt) {
    console.log("Transaction not opened due to error. Duplicate items not allowed.");
  };
  var objectStore = tx.objectStore("habits");
  var objectStoreRequest = objectStore.add(obj);
  objectStoreRequest.onsuccess = function (evt) {
    // report the success of our request
    console.log(objectStoreRequest + "Request successful.");

  };
}
function deleteHabitDate(title, date) {
  //check code later!!!!!!!!!!!!!!!
  const tx = dbCalendar.transaction(['habits'], 'readwrite');
  const objectStore = tx.objectStore('habits');

  actualMonth();
  let cellId = title + "-" + currentYear + "-" + actualCurrentMonth + "-" + date;

  objectStore.openCursor().onsuccess = function (evt) {
    const cursor = evt.target.result;
    if (cursor) {
      if (cursor.value.date === cellId) {
        const request = cursor.delete();
        request.onsuccess = function () {
          console.log('Deleted.');
        };
      }
      cursor.continue();

    }
  };
}


function openDateDb(title) {
  let name = userName;
  let email = userEmail;
  console.log("open Calendar ...");
  //if title contains space add -
  let databaseName = title + userName + userEmail;
  console.log(databaseName);
  var req = indexedDB.open(databaseName, 1);
  req.onsuccess = function (evt) {
    // Equal to: db = req.result;
    dbCalendar = this.result;
    console.log("open calendar DONE");
    displayCalendarList();
    getProgress();
  };
  req.onerror = function (evt) {
    console.error("open calendar:", evt.target.errorCode);
  };

  req.onupgradeneeded = function (evt) {
    console.log("openDateDb.onupgradeneeded");
    var store = evt.currentTarget.result.createObjectStore(
      'habits', { keyPath: 'id', autoIncrement: true });

    //store.createIndex('biblioid', 'biblioid', { unique: true });
    //store.createIndex('title', 'title', { unique: false });
    //store.createIndex('year', 'year', { unique: false });
    store.createIndex('date', 'date', { unique: false });
    store.createIndex('name', 'name', { unique: false });
    store.createIndex('email', 'email', { unique: false });
  };




}
//show calendar
function showCalendar(color, month, year) {
  console.log(userName);
  console.log(userEmail);
  let habitTitleContent = document.getElementById("habitTitle");
  habitTitleContent.innerHTML = "";
  let boldText = document.createElement("b");
  boldText.textContent = habitTitle;
  habitTitleContent.appendChild(boldText);
  let firstDay = new Date(year, month).getDay();
  let daysInMonth = 32 - new Date(year, month, 32).getDate();
  let container = document.getElementById("calendar");
  container.classList.remove("d-none");
  let tbl = document.getElementById("calendar-body"); // body of the calendar
  // clearing all previous cells
  tbl.innerHTML = "";

  // filing data about month and in the page via DOM.
  monthAndYear.innerHTML = months[month] + " " + year;
  //selectYear.value = year;
  //selectMonth.value = month;
  // creating all cells
  let date = 1;
  for (let i = 0; i < 6; i++) {
    // creates a table row
    let row = document.createElement("tr");

    //creating individual cells, filing them up with data.
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDay) {
        let cell = document.createElement("td");
        let cellText = document.createTextNode("");
        cell.appendChild(cellText);
        row.appendChild(cell);
      } else if (date > daysInMonth) {
        break;
      } else {
        let name = habitTitle;
        let cell = document.createElement("td");
        let actualMonth = currentMonth + 1;

        if (actualMonth === 13) {
          actualMonth = 1;
        }
        if (actualMonth < 10) {
          actualMonth = "0" + actualMonth;
        }

        cell.id = name + "-" + currentYear + "-" + actualMonth + "-" + date;
        cell.addEventListener("click", function () {
          if (this.style.backgroundColor === userColor) {
            this.style.backgroundColor = "";
            this.style.color = "black";
            let cellId = this.id;
            let cellTextContent = document.getElementById(cellId).textContent;
            deleteHabitDate(habitTitle, cellTextContent);
            console.log(habitTitle, cellTextContent);
            updateProgress();
          } else {
            this.style.backgroundColor = userColor;
            this.style.color = "white";

            //get textContent of id
            let cellId = this.id;
            let cellTextContent = document.getElementById(cellId).textContent;

            addHabitDate(habitTitle, cellTextContent);
            console.log(habitTitle, cellTextContent);
            updateProgress();
          }
        });
        cell.classList.add("cell");
        let cellText = document.createTextNode(date);
        if (
          date === today.getDate() &&
          year === today.getFullYear() &&
          month === today.getMonth()
        ) {
          cell.classList.add("font-weight-bolder");
        }
        cell.appendChild(cellText);
        row.appendChild(cell);
        date++;
      }
    }

    tbl.appendChild(row); // appending each row into calendar body.
  }
}
function clearObjectStore() {
  var store = getObjectStore(DB_STORE_NAME, 'readwrite');
  var req = store.clear();
  req.onsuccess = function (evt) {
    displayActionSuccess("Store cleared");
    displayHabList(store);
  };
  req.onerror = function (evt) {
    console.error("clearObjectStore:", evt.target.errorCode);
    displayActionFailure(this.error);
  };
}

function getBlob(key, store, success_callback) {
  var req = store.get(key);
  req.onsuccess = function (evt) {
    var value = evt.target.result;
    if (value)
      success_callback(value.blob);
  };
}
/**
 * @param {IDBObjectStore=} store
 */
function displayCalendarList() {

  let tx = dbCalendar.transaction('habits');
  let habitStore = tx.objectStore('habits');
  let habits = habitStore.getAll();
  var index = habitStore.index("date");

  // Using a normal cursor to grab whole customer record objects
  index.openCursor().onsuccess = function (event) {
    var cursor = event.target.result;
    if (cursor) {
      // cursor.key is a name, like "Bill", and cursor.value is the whole object.
      actualMonth();
      //"Brush-2021-11-1"
      let cellId = [];
      cellId.push(cursor.value.date);

      cursor.continue();
      console.log(cellId);
      for (let i = 0; i <= cellId.length; i++) {
        if (document.getElementById(cellId[i]) !== null) {
          document.getElementById(cellId[i]).style.backgroundColor = userColor;
          document.getElementById(cellId[i]).style.color = "white";

        }
      }
    }
  };

}
/**
 * @param {IDBObjectStore=} store
 */
function displayHabitList(store) {
  if (typeof store == 'undefined') {
    store = getObjectStore(DB_STORE_NAME, 'readonly');
  }
  var req;
  req = store.count();

  req.onsuccess = function (evt) {
    let container = document.getElementById("habit-body");

    container.innerHTML = "";
  };
  req.onerror = function (evt) {
    console.error("add error", this.error);
    displayActionFailure(this.error);
  };
  var i = 0;
  req = store.openCursor();
  req.onsuccess = function (evt) {
    var cursor = evt.target.result;
    // If the cursor is pointing at something, ask for the data
    if (cursor) {
      req = store.get(cursor.key);
      req.onsuccess = function (evt) {
        var value = evt.target.result;
        let btnBack = document.getElementById("btn-back");
        btnBack.classList.remove("d-lg-block");
        createHabitCard(value.title, value.description, value.rate, value.initial, cursor.key);
      };
      cursor.continue();

      i++;
    } else {
      console.log("No more entries");
    }
  };

}

/**
 * @param {IDBObjectStore=} store
 */
function displayHabList(store) {
  console.log("displayHabList");

  if (typeof store == 'undefined')
    store = getObjectStore(DB_STORE_NAME, 'readonly');

  var hab_msg = $('#hab-msg');
  hab_msg.empty();
  var hab_list = $('#hab-list');
  hab_list.empty();
  // Resetting the iframe so that it doesn't display previous content
  newViewerFrame();

  var req;
  req = store.count();
  // Requests are executed in the order in which they were made against the
  // transaction, and their results are returned in the same order.
  // Thus the count text below will be displayed before the actual pub list
  // (not that it is algorithmically important in this case).
  req.onsuccess = function (evt) {
    hab_msg.append('<p>There are <strong>' + evt.target.result +
      '</strong> record(s) in the object store.</p>');
  };
  req.onerror = function (evt) {
    console.error("add error", this.error);
    displayActionFailure(this.error);
  };

  var i = 0;
  req = store.openCursor();
  req.onsuccess = function (evt) {
    var cursor = evt.target.result;

    // If the cursor is pointing at something, ask for the data
    if (cursor) {
      console.log("displayHabList cursor:", cursor);
      req = store.get(cursor.key);
      req.onsuccess = function (evt) {
        var value = evt.target.result;
        var list_item = $('<li>' +
          '[' + cursor.key + '] ' +
          '(title: ' + value.title + ') ' +
          '(description: ' + value.description + ') ' +
          '(rate: ' + value.rate + ') ' +
          '(date created: ' + value.initial + ') ' +
          '</li>');

        hab_list.append(list_item);
      };

      // Move on to the next object in store
      cursor.continue();

      // This counter serves only to create distinct ids
      i++;
    } else {
      console.log("No more entries");
    }
  };
}

function newViewerFrame() {
  var viewer = $('#hab-viewer');
  viewer.empty();
  var iframe = $('<iframe />');
  viewer.append(iframe);
  return iframe;
}

function setInViewer(key) {
  console.log("setInViewer:", arguments);
  key = Number(key);
  if (key == current_view_hab_key)
    return;

  current_view_hab_key = key;

  var store = getObjectStore(DB_STORE_NAME, 'readonly');
  getBlob(key, store, function (blob) {
    console.log("setInViewer blob:", blob);
    var iframe = newViewerFrame();

    // It is not possible to set a direct link to the
    // blob to provide a mean to directly download it.
  });
}


/**
 * @param {string} title
 * @param {string} description
 * @param {string} rate
 * @param {string} initial
 * @param {string} date
 * @param {Blob=} blob
 */
function addHabit(title, description, rate, initial, name, email, blob) {
  console.log("addHabit arguments:", arguments);
  var obj = { title: title, description: description, rate: rate, initial: initial, name: name, email: email };
  if (typeof blob != 'undefined')
    obj.blob = blob;

  var store = getObjectStore(DB_STORE_NAME, 'readwrite');
  var req;
  try {
    req = store.add(obj);
  } catch (e) {
    if (e.name == 'DataCloneError')
      displayActionFailure("This engine doesn't know how to clone a Blob, " +
        "use Firefox");
    throw e;
  }
  req.onsuccess = function (evt) {
    console.log("Insertion in DB successful");
    displayActionSuccess();
    displayHabList(store);
    displayHabitList(store);
  };
  req.onerror = function () {
    console.error("addHabit error", this.error);
    displayActionFailure(this.error);
  };
}
function showContent() {
  let footerIndex = document.getElementById("footerIndex");
  footerIndex.classList.add("d-none");
  let collapsedNav = document.getElementById("navbarScroll");
  collapsedNav.classList.remove("show");
  let content = document.getElementById("habit-body");
  content.classList.remove("d-none");
  let leafIcon = document.createElement("i");
  leafIcon.classList.add("fa");
  leafIcon.classList.add("fa-leaf");
  leafIcon.classList.add("mr-1");
  leafIcon.classList.add("ml-5");

  leafIcon.classList.add("d-none");
  leafIcon.classList.add("d-lg-inline-block");
  boldText = document.createElement("b");
  boldText.textContent = userName + "'s Habiliti"


  let habitTitleText = document.getElementById("habitTitle");
  habitTitleText.href = "index.html";
  habitTitleText.textContent = "";
  habitTitleText.classList.add("pr-4");
  habitTitleText.classList.remove("pr-5");
  habitTitleText.appendChild(leafIcon);
  habitTitleText.appendChild(boldText);
  let calendar = document.getElementById("calendar");
  calendar.classList.add("d-none");

  let btnBack = document.getElementById("btn-back");
  btnBack.classList.remove("d-lg-block");

  let linkBack = document.getElementById("link-back");
  linkBack.classList.add("d-none");

  let addButtons = document.getElementById("buttons");
  addButtons.classList.remove("d-none");

  habitTitleText.removeEventListener("click", function () {
    showContent();
  });
}
function hideContent(linkId) {
  let footerIndex = document.getElementById("footerIndex");
  footerIndex.classList.remove("d-none");

  let collapsedNav = document.getElementById("navbarScroll");
  collapsedNav.classList.remove("show");

  let content = document.getElementById("habit-body");
  //add d-none to container
  let btn = document.getElementById("buttons");
  let btnBack = document.getElementById("btn-back");
  btnBack.classList.add("d-lg-block");

  let linkBack = document.getElementById("link-back");
  linkBack.classList.remove("d-none");

  let cardTitle = document.getElementById(linkId).parentNode;
  let cardBody = cardTitle.parentNode;
  let cardDescription = cardBody.children[1];

  habitDescription = cardDescription.textContent;
  habitTitle = cardTitle.textContent;

  console.log(habitDescription);
  console.log(habitTitle);

  //let parentCard = parentHeader.parentNode;
  //cardBody = parentCard.children[1];
  //cardTitle = cardBody.children[0].textContent;
  //cardDescription = cardBody.children[1].textContent;

  habitTitle = document.getElementById(linkId).textContent;
  let habitTitleText = document.getElementById("habitTitle");
  habitTitleText.href = "#";
  habitTitleText.addEventListener("click", function () {
    showContent();
  });
  habitTitleText.classList.remove("pr-4");
  habitTitleText.classList.add("pr-5");

  habitDescription = document.getElementById(linkId).parent;
  btn.classList.add("d-none");
  content.classList.add("d-none");
}
function createHabitCard(title, description, rate, initial, key) {
  let footerIndex = document.getElementById("footerIndex");
  footerIndex.classList.add("d-none");
  let leafIcon = document.createElement("i");
  leafIcon.classList.add("fa");
  leafIcon.classList.add("fa-leaf");
  leafIcon.classList.add("mr-1");
  leafIcon.classList.add("ml-5");

  leafIcon.classList.add("d-none");
  leafIcon.classList.add("d-lg-inline-block");
  boldText = document.createElement("b");
  boldText.textContent = userName + "'s Habiliti"
  let habitTitleText = document.getElementById("habitTitle");
  habitTitleText.innerHTML = "";
  habitTitleText.href = "index.html";
  habitTitleText.classList.add("pr-4");
  let btn = document.createElement("button");
  btn.classList.add("close");
  btn.innerHTML = '&times;';
  btn.type = "button";
  btn.id = "close" + "-" + key;

  btn.addEventListener("click", function () {
    deleteHabits(this.id);
  });

  let container = document.getElementById("habit-body");
  //let row = document.createElement("div");
  //row.classList.add("row");
  let col = document.createElement("div");
  col.classList.add("col");
  let card = document.createElement("div");
  card.classList.add("card");
  card.classList.add("border-none");
  card.classList.add("mb-3");

  card.id = "card" + "-" + key;
  let cardHeader = document.createElement("div");
  cardHeader.classList.add("card-header");
  let cardBody = document.createElement("div");
  cardBody.classList.add("card-body");
  cardBody.classList.add("text-dark");
  let cardTitle = document.createElement("h5");
  cardTitle.classList.add("card-title");
  let cardFooter = document.createElement("div");
  cardFooter.classList.add("card-footer");
  cardFooter.classList.add("text-muted");

  cardFooter.textContent = "Created " + initial;
  let linkToCalendar = document.createElement("a");
  linkToCalendar.textContent = title;
  linkToCalendar.id = "link-" + key;


  let cardText = document.createElement("p");

  linkToCalendar.addEventListener("click", function () {
    habitTitle = linkToCalendar.textContent;
    console.log(habitTitle);
    openDateDb(habitTitle);

    hideContent(this.id);
    showCalendar(userColor, currentMonth, currentYear);
  });
  habitTitleText.appendChild(leafIcon);
  habitTitleText.appendChild(boldText);

  cardText.classList.add("card-text");
  cardText.textContent = description;
  cardHeader.appendChild(btn);

  card.appendChild(cardHeader);

  cardTitle.appendChild(linkToCalendar);
  cardBody.appendChild(cardTitle);
  cardBody.appendChild(cardText);

  card.appendChild(cardBody);
  card.appendChild(cardFooter);

  col.appendChild(card);
  container.appendChild(col);
  let habTitle = document.getElementById("hab-title");
  habTitle.value = "";
  let habDescription = document.getElementById("hab-description");
  habDescription.value = "";



}
function updateProgress() {
  var store = dbCalendar.transaction(['habits']).objectStore('habits');
  var count = store.count();
  count.onsuccess = function () {
    progressTotal = count.result;
    let total = progressTotal.toString();


    let progressBar = document.getElementById("progressbar");
    progressBar.removeAttribute("style");
    progressBar.removeAttribute("aria-valuenow");
    progressBar.setAttribute("style", "width:" + total + "%");
    progressBar.setAttribute("aria-valuenow", total);
  };



}
function getProgress() {
  //get Title
  var store = dbCalendar.transaction(['habits']).objectStore('habits');
  var count = store.count();
  count.onsuccess = function () {
    let userProgress = document.getElementById("userProgress");
    let boldText = document.createElement("b");
    boldText.textContent = userName + "'s Progress";
    progressTotal = count.result;
    let total = progressTotal.toString();
    let progressBarDiv = document.createElement("div");
    progressBarDiv.classList.add("progress");
    let progressBar = document.createElement("div");
    progressBar.classList.add("progress-bar");
    progressBar.id = "progressbar";
    progressBar.setAttribute("style", "width:" + total + "%");

    //role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100"
    progressBar.setAttribute("role", "progressbar");
    progressBar.setAttribute("aria-valuenow", total);
    //progressTotal = ;
    progressBar.setAttribute("aria-valuemin", "0");
    progressBar.setAttribute("aria-valuemax", "100");
    //append 
    userProgress.appendChild(boldText);
    let content = document.getElementById("progress");
    content.innerHTML = "";
    progressBarDiv.appendChild(progressBar);
    content.appendChild(progressBarDiv);
  };

}

function deleteHabits(btnId) {
  //check code later!!!!!!!!!!!!!!!
  var store = getObjectStore(DB_STORE_NAME, 'readwrite');
  var req = store.index('title');

  let parentHeader = document.getElementById(btnId).parentNode;
  let parentCard = parentHeader.parentNode;
  cardBody = parentCard.children[1];
  cardTitle = cardBody.children[0].textContent;
  cardDescription = cardBody.children[1].textContent;

  req.get(cardTitle).onsuccess = function (evt) {
    if (typeof evt.target.result == 'undefined') {
      displayActionFailure("No matching record found");
      return;
    }
    deleteHabitsFromDb(evt.target.result.id, store);
  };
  req.onerror = function (evt) {
    console.error("deleteHabitFromBib:", evt.target.errorCode);
  };
}
/**
 * @param {number} key
 * @param {IDBObjectStore=} store
 */
function deleteHabitsFromDb(key, store) {
  console.log("deleteHabit:", arguments);
  if (typeof store == 'undefined')
    store = getObjectStore(DB_STORE_NAME, 'readwrite');
  var req = store.get(key);
  req.onsuccess = function (evt) {
    var record = evt.target.result;
    console.log("record:", record);
    if (typeof record == 'undefined') {
      displayActionFailure("No matching record found");
      return;
    }
    var deleteReq = store.delete(key);
    deleteReq.onsuccess = function (evt) {
      console.log("evt:", evt);
      console.log("evt.target:", evt.target);
      console.log("evt.target.result:", evt.target.result);
      console.log("delete successful");
      displayActionSuccess("Deletion successful");
      displayHabitList(store);
    };
    deleteReq.onerror = function (evt) {
      console.error("deleteHabit:", evt.target.errorCode);
    };
  };
  req.onerror = function (evt) {
    console.error("deleteHabit:", evt.target.errorCode);
  };
}

function displayActionSuccess(msg) {
  msg = typeof msg != 'undefined' ? "Success: " + msg : "Success";
  $('#msg').html('<span class="action-success">' + msg + '</span>');
}
function displayActionFailure(msg) {
  msg = typeof msg != 'undefined' ? "Failure: " + msg : "Failure";
  $('#msg').html('<span class="action-failure">' + msg + '</span>');
}
function resetActionStatus() {
  console.log("resetActionStatus ...");
  $('#msg').empty();
  console.log("resetActionStatus DONE");
}
//event listeners
function addEventListeners() {
  console.log("addEventListeners");

  $('#register-form-reset').click(function (evt) {
    resetActionStatus();
  });

  $('.create').click(function (evt) {
    console.log("add ...");
    var title = $('#hab-title').val();
    var description = $('#hab-description').val();
    var rate = $('#hab-rate').val();
    actualMonth();
    var initial = currentYear + "-" + actualCurrentMonth + "-" + currentDate; //define as full-date   
    var name = userName;
    var email = userEmail;
    if (!title || !rate) {
      displayActionFailure("Required field(s) missing");
      return;
    }

    addHabit(title, description, rate, initial, name, email);

  });

  $('#delete-button').click(function (evt) {
    console.log("delete ...");
    var title = $('#hab-title-to-delete').val();
    var key = $('#key-to-delete').val();
    //        $(this).attr('id') 

    if (title != '') {
      deleteHabitFromBib(title);
    } else if (key != '') {
      // Better use Number.isInteger if the engine has EcmaScript 6
      if (key == '' || isNaN(key)) {
        displayActionFailure("Invalid key");
        return;
      }
      key = Number(key);
      deleteHabit(key);
    }
  });

  $('#clear-store-button').click(function (evt) {
    clearObjectStore();
  });

  var search_button = $('#search-list-button');
  search_button.click(function (evt) {
    displayHabList();
  });

}
//calendar next button
function next() {
  currentYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  currentMonth = (currentMonth + 1) % 12;
  showCalendar(userColor, currentMonth, currentYear);
  displayCalendarList();
}
//calendar previous button
function previous() {
  currentYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  currentMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  showCalendar(userColor, currentMonth, currentYear);
  displayCalendarList();
}
function actualMonth() {
  actualCurrentMonth = currentMonth + 1;
  if (actualCurrentMonth === 13) {
    actualCurrentMonth = 1;
  }
  if (actualCurrentMonth < 10) {
    actualCurrentMonth = "0" + actualCurrentMonth;
  }
  return actualCurrentMonth;
}
function askNotificationPermission() {
  Notification.requestPermission().then(function (result) {
    if (Notification.permission === 'denied') {
      console.log(result);
      alert("Notifications have been blocked");
    }
    if (Notification.permission === 'granted' || Notification.permission === 'default') {
      alert("Notifications have been enabled");
    }
  });
}



//intilize at form one


//jquery form manipulation
$(document).ready(function () {
  $("#add-mobile").click(function () {
    $("#fsOne").removeClass("d-none");
    $(".next").removeClass("d-none");
  });
  $("#add-desktop").click(function () {
    $("#fsOne").removeClass("d-none");
    $(".next").removeClass("d-none");
  });
  $("#close-footer").click(function () {
    //reset form display if closed
    if ($("#fsOne").hasClass("d-none")) {

    } else {
      $("#fsOne").addClass("d-none");
    }
    if ($("#fsTwo").hasClass("d-none")) {

    } else {
      $("#fsTwo").addClass("d-none");
    }
    if ($(".next").hasClass("d-none")) {

    } else {
      $(".next").addClass("d-none");
    }
    if ($(".previous").hasClass("d-none")) {

    } else {
      $(".previous").addClass("d-none");
    }
    if ($(".create").hasClass("d-none")) {

    } else {
      $(".create").addClass("d-none");
    }

  });
  $("#close-header").click(function () {
    //reset form display if closed
    if ($("#fsOne").hasClass("d-none")) {

    } else {
      $("#fsOne").addClass("d-none");
    }
    if ($("#fsTwo").hasClass("d-none")) {

    } else {
      $("#fsTwo").addClass("d-none");
    }
    if ($(".next").hasClass("d-none")) {

    } else {
      $(".next").addClass("d-none");
    }
    if ($(".previous").hasClass("d-none")) {

    } else {
      $(".previous").addClass("d-none");
    }
    if ($(".create").hasClass("d-none")) {

    } else {
      $(".create").addClass("d-none");
    }
  });
  //next button
  $(".next").click(function () {
    $("#fsOne").addClass("d-none");
    $("#fsTwo").removeClass("d-none");
    $(".next").addClass("d-none");
    $(".previous").removeClass("d-none");
    $(".create").removeClass("d-none");
  });
  $(".create").click(function () {
    //hide create
    $(".create").addClass("d-none");
    //hide previous
    $(".previous").addClass("d-none");
    //hide form two
    $("#fsTwo").addClass("d-none");

  });
  //previous button
  $(".previous").click(function () {
    $("#fsTwo").addClass("d-none");
    $("#fsOne").removeClass("d-none");
    $(".next").removeClass("d-none");
    $(".previous").addClass("d-none");
    $(".create").addClass("d-none");
  });
  $(".carousel").carousel({ interval: 2000, pause: "false" });
  $("#carouselButton").click(function () {
    if ($("#carouselButton").children("i").hasClass("fa-pause")) {
      $(".carousel").carousel("pause");
      $("#carouselButton").children("i").removeClass("fa-pause");
      $("#carouselButton").children("i").addClass("fa-play");
    } else {
      $(".carousel").carousel("cycle");
      $("#carouselButton").children("i").removeClass("fa-play");
      $("#carouselButton").children("i").addClass("fa-pause");
    }
  });
});