class MainFunc {
  constructor(element) {
    this.element = element;
  }

  // Setup Time and Date

  update() {
    setInterval(() => {
      this.formateTime();
    }, 300);
  }

  formateTime() {
    let nows = this.times();
    let minutes = nows.m.toString().padStart(2, "0");
    let session = nows.sess ? "AM" : "PM";
    let nowClock = `${nows.h}:${minutes}`;
    let nowDates = `${nows.d}, ${nows.dd} ${nows.mm} ${nows.yy}`;

    this.element.querySelector(".time").textContent = nowClock;
    this.element.querySelector(".date").textContent = nowDates;
  }

  times() {
    let today = new Date();
    let weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return {
      h: today.getHours(),
      m: today.getMinutes(),
      sess: today.getHours() < 12,
      d: weekday[today.getDay()],
      dd: today.getDate(),
      mm: months[today.getMonth()],
      yy: today.getFullYear(),
    };
  }
}

let time = document.querySelector(".time-container");
let play = new MainFunc(time);
play.update();

// Setup hadist
let hadisLoader = new HadisLoader();
let loadedBooks = {};

let setupHadist = async () => {
  let imam = ["abu-daud", "ahmad", "bukhari", "ibnu-majah", "malik", "muslim", "tirmidzi"];
  let imamDisplay = ["Abu-Daud", "Ahmad", "Bukhari", "Ibnu-majah", "Malik", "Muslim", "Tirmidzi"];
  
  let rand = () => {
    return Math.floor(Math.random() * imam.length);
  };

  let randIndex = rand();
  let randImam = imam[randIndex];
  let randImamDisplay = imamDisplay[randIndex];

  try {
    // Load the book if not already loaded
    if (!loadedBooks[randImam]) {
      loadedBooks[randImam] = await hadisLoader.loadBook(randImam);
    }

    let response = loadedBooks[randImam];

    let rand2 = () => {
      return Math.floor(Math.random() * response.length);
    };

    let randHadis = response[rand2()];
    console.log(randHadis);
    console.log(randImamDisplay);
    document.querySelector(".hadist").textContent = `${randHadis.id}`;
    document.querySelector(".imam").textContent = `Hr.Imam ${randImamDisplay} no.${randHadis.number}`;
  } catch (error) {
    console.error('Error loading hadith:', error);
    document.querySelector(".hadist").textContent = "Error loading data";
    document.querySelector(".imam").textContent = "Please try again";
  }
};

setupHadist();
// Setup Search bar

let query = document.querySelector(".search");
let submitSearch = document.querySelector(".submitSearch");
let leftcontainer = document.querySelector(".left-container");

let inputValues = () => {
  let url = (V = "https://www.google.com/search?q=" + query.value);
  if (query.value != "") {
    window.open(url, "_self");
    query.value = "";
  } else {
    setupHadist();
  }
};

query.addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    inputValues();
  }
});

submitSearch.addEventListener("click", () => {
  inputValues();
});

submitSearch.addEventListener("mouseover", (event) => {
  if (query.value !== "") {
    query.style.boxShadow = "0 0 13px blue";
  } else {
    leftcontainer.style.boxShadow = "0 0 13px pink";
  }
});

submitSearch.addEventListener("mouseleave", (event) => {
  query.style.boxShadow = "none";
  leftcontainer.style.boxShadow = "none";
});
