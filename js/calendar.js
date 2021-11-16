let databaseName = "habitsDB";
let databaseVersion = 1;

let db;
let habitName = "Brush Teeth";
let habitFrequency = "daily";
let userColor = "lightgreen";

let today = new Date();
let currentDate = today.getDate();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let currentEnd = 32 - new Date(currentYear, currentMonth, 32).getDate();


let selectYear = document.getElementById("year");
let selectMonth = document.getElementById("month");

let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

let monthAndYear = document.getElementById("monthAndYear");
init();

function next() {
    currentYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    currentMonth = (currentMonth + 1) % 12;
    showCalendar(userColor, currentMonth, currentYear);
    list();
}

function previous() {
    currentYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    currentMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    showCalendar(userColor, currentMonth, currentYear);
    list();
}

function showCalendar(color, month, year) {
    let firstDay = new Date(year, month).getDay();
    let daysInMonth = 32 - new Date(year, month, 32).getDate();

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
                let name = habitName.split(' ').join('-');
                let cell = document.createElement("td");
                let actualMonth = currentMonth + 1;
                let actualDate = date;

                if (actualMonth === 13) {
                    actualMonth = 1;
                }
                if (actualMonth < 10) {
                    actualMonth = "0" + actualMonth;
                }
                if (date < 10) {
                    actualDate = "0" + date;
                }
                cell.id = name + "-" + currentYear + "-" + actualMonth + "-" + actualDate;
                cell.addEventListener("click", function () {
                    if (this.style.backgroundColor === userColor) {
                        this.style.backgroundColor = "";

                    } else {
                        this.style.backgroundColor = userColor;
                        //get textContent of id
                        let cellId = this.id;
                        let cellTextContent = document.getElementById(cellId).textContent;
                        addHabit(cellTextContent);
                        console.log(cellTextContent);
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

async function init() {
    db = await idb.openDb(databaseName, databaseVersion, db => {
        db.createObjectStore('habits', { keyPath: 'id' }); //
    });
    list();
    showCalendar(userColor, currentMonth, currentYear);
}
async function list() {
    let tx = db.transaction('habits');
    let habitStore = tx.objectStore('habits');
    let habits = await habitStore.getAll();

    if (habits.length) {
        let listElem = habits.map(habit => `name: ${habit.name}, id: ${habit.id}`).join('').split(',');
        //get id of all database values in actualMonth
        if (currentMonth) {
            let actualMonth = currentMonth + 1;
            if (actualMonth === 13) {
                actualMonth = 1;
            }
            //change code for actualMonth
            if (actualMonth < 10) {
                actualMonth = "0" + actualMonth;
            }
            let cellId = habits.map(habit => `${habit.id}`).join(' ').split(' ');
            console.log(cellId);
            for (let i = 0; i <= cellId.length; i++) {
                if (document.getElementById(cellId[i]) !== null) {
                    document.getElementById(cellId[i]).style.backgroundColor = userColor;
                }

            }


        }
        //
        //
        // 
        //
        //
        // 
        //
        //
        console.log(listElem);
    } else {
        console.log("You have no habits.");
        console.log(currentEnd);
    }
}
async function deleteHabit() {
    let tx = db.transaction("habits", "readwrite");
}
async function addHabit(date) {
    let name = habitName.split(' ').join('-');;
    let actualMonth = currentMonth + 1;
    let actualDate = date;

    if (actualMonth === 13) {
        actualMonth = 1;
    }
    if (actualMonth < 10) {
        actualMonth = "0" + currentMonth + 1;
    }
    if (date < 10) {
        actualDate = "0" + date;
    }
    let id = name + "-" + currentYear + "-" + actualMonth + "-" + actualDate;

    let tx = db.transaction('habits', 'readwrite');
    try {
        await tx.objectStore('habits').add({ name, id });
        await list();
    } catch (err) {
        if (err.name == 'ConstraintError') {
            alert("Such habit exists already");

            await addHabit(date);
        } else {
            throw err;
        }
    }
}
function notifyMe() {
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
    }

    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        var notification = new Notification("Hi there!");
    }

    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
            // If the user accepts, let's create a notification
            if (permission === "granted") {
                var notification = new Notification("Hi there!");
            }
        });
    }

    // At last, if the user has denied notifications, and you
    // want to be respectful there is no need to bother them any more.
}



window.addEventListener('unhandledrejection', event => {
    alert("Error: " + event.reason.message);
});

