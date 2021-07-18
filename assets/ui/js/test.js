const quizName = document.getElementById("quiz_name");
const question = document.getElementById("question");
const counter = document.getElementById("counter");
const optionsBlock = document.getElementById("options_block");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const finishBtn = document.getElementById("finished");
const checkBtn = document.getElementById("check");
const repeatBtn = document.getElementById("repeat");
const exitBtn = document.getElementById("exit");
const finishText = document.getElementById("score");

let quizData,
  questionsCount,
  count,
  score,
  questionsArray,
  questionsHistory,
  selected,
  timerSecond;

function startQuiz(e) {
  questionsArray = [];
  let key = e.dataset.id;
  let query = firebase.database().ref("quizzes").orderByKey();
  query
    .once("value")
    .then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        if (childSnapshot.key == key) {
          quizData = childSnapshot.val();
          quizName.innerHTML = childSnapshot.val().name;
          questionsCount = childSnapshot.val().questions;
          timerSecond = childSnapshot.val().duration * 60;
        }
      });
    })
    .then(() => {
      toArray();
      repeatQuiz();
    });
}

function viewUpdate() {
  counter.innerHTML = `Оценка: ${score} из ${questionsCount}`;
  document.querySelector(".full").classList.remove("uk-hidden");
  if (score == 0) {
    finishText.innerHTML = "Вам многому нужно научиться";
  } else if (score < (questionsCount / 100) * 35) {
    finishText.innerHTML = "Вы уже неплохо разбираетесь";
  } else if (score < (questionsCount / 100) * 70) {
    finishText.innerHTML = "Ваш уровень выше среднего";
  } else {
    finishText.innerHTML = "Вы в совершенстве знаете тему";
  }
  question.classList.add("uk-hidden");
  checkBtn.classList.add("uk-hidden");
  prevBtn.classList.add("uk-hidden");
  nextBtn.classList.add("uk-hidden");
  finishBtn.classList.add("uk-hidden");
  repeatBtn.classList.remove("uk-hidden");
  exitBtn.classList.remove("uk-hidden");
}

function finishQuiz() {
  if (count == questionsCount) {
    viewUpdate();
  }
}

function repeatQuiz() {
  count = 1;
  score = 0;
  questionsHistory = {};
  selected = "";
  shuffleArray(questionsArray);
  shuffleOption();
  document.querySelector(".full").classList.add("uk-hidden");
  question.classList.remove("uk-hidden");
  countUpdate();
  updateOption();
  updateBtns();
  viewQuestion();
  timerQuiz();
  nextBtn.classList.remove("uk-hidden");
  repeatBtn.classList.add("uk-hidden");
  exitBtn.classList.add("uk-hidden");
}

function exitQuiz() {
  quizData = "";
  questionsArray = [];
  document.getElementById("close_quiz").click();
}

function toArray() {
  for (let index = 1; index < Object.keys(quizData).length - 3; index++) {
    let questions = quizData[`question_${index}`];
    let optionsArray = [];
    for (let i = 1; i < Object.keys(questions).length - 1; i++) {
      let options = quizData[`question_${index}`][`option_${i}`];
      optionsArray.push(options);
    }

    for (let i = 1; i < Object.keys(questions).length; i++) {
      delete quizData[`question_${index}`][`option_${i}`];
    }

    shuffleArray(optionsArray);
    questions.options = optionsArray;
    questionsArray.push(questions);
  }
}

function shuffleArray(array) {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function shuffleOption() {
  for (let index = 1; index < Object.keys(quizData).length - 3; index++) {
    shuffleArray(quizData[`question_${index}`].options);
  }
}

function countUpdate() {
  counter.innerHTML = `${count}/${questionsCount}`;
}

function viewQuestion(num = 0) {
  let options = document.querySelectorAll(".option");
  question.innerHTML = questionsArray[count - 1 + num].question;
  options.forEach((el, i) => {
    el.innerHTML = questionsArray[count - 1 + num].options[i];
    el.addEventListener("click", () => {
      options.forEach((el) => {
        el.classList.remove("active");
      });
      el.classList.add("active");
      selected = el.innerHTML;
      checkBtn.removeAttribute("disabled");
    });
  });
}

function prevQuestion() {
  if (count > 1) {
    count--;
    countUpdate();
  }
  updateOption();
  updateBtns();
  viewQuestion();
  historyQuestion(0, 1);
}

function nextQuestion() {
  if (count <= questionsCount) {
    if (count < questionsArray.length) {
      updateOption(1);
      viewQuestion(1);
      if (questionsHistory[`question_${count + 1}`]) {
        historyQuestion(1);
      }
    }
    if (count < questionsCount) {
      count++;
      countUpdate();
    }
  }
  updateBtns();
}

function historyQuestion(num = 0, prev = 0) {
  let answer = questionsArray[count - prev].answer;
  let historyAnswer = questionsHistory[`question_${count + num}`].answer;
  let options = document.querySelectorAll(".option");
  console.log(answer);
  console.log(historyAnswer);
  options.forEach((el) => {
    el.classList.add("disabled");
  });
  if (historyAnswer == answer) {
    options.forEach((el) => {
      if (el.innerHTML == historyAnswer) {
        el.classList.add("success");
      }
    });
  } else {
    options.forEach((el) => {
      if (el.innerHTML == historyAnswer) {
        el.classList.add("danger");
      }
      if (el.innerHTML == answer) {
        el.classList.add("success");
      }
    });
  }
  nextBtn.removeAttribute("disabled");
  finishBtn.removeAttribute("disabled");
  checkBtn.classList.add("uk-hidden");
}

function updateOption(num = 0) {
  let options = document.querySelectorAll(".option");
  let objectLength = questionsArray[count - 1 + num].options.length;

  if (options.length < objectLength) {
    for (let i = options.length; i < objectLength; i++) {
      let element = document.createElement("div");
      element.className = "option";
      optionsBlock.append(element);
    }
  }

  if (options.length > objectLength) {
    for (let i = options.length; i > objectLength; i--) {
      options[i - 1].remove();
    }
  }

  options.forEach((el) => {
    el.classList.remove("disabled");
    el.classList.remove("success");
    el.classList.remove("danger");
    el.classList.remove("active");
  });

  nextBtn.setAttribute("disabled", "");
  checkBtn.setAttribute("disabled", "");
  finishBtn.setAttribute("disabled", "");
  checkBtn.classList.remove("uk-hidden");
}

function checkOption() {
  questionsHistory[`question_${count}`] = {};
  questionsHistory[`question_${count}`].answer = selected;
  let answer = questionsArray[count - 1].answer;
  let options = document.querySelectorAll(".option");
  options.forEach((el) => {
    el.classList.add("disabled");
  });
  if (selected == answer) {
    options.forEach((el) => {
      if (el.innerHTML == selected) {
        el.classList.add("success");
      }
    });
    score++;
  } else {
    options.forEach((el) => {
      if (el.innerHTML == selected) {
        el.classList.add("danger");
      }
      if (el.innerHTML == answer) {
        el.classList.add("success");
      }
    });
  }
  prevBtn.removeAttribute("disabled");
  nextBtn.removeAttribute("disabled");
  finishBtn.removeAttribute("disabled");
}

function updateBtns() {
  if (count < 2) {
    prevBtn.classList.add("uk-hidden");
    nextBtn.style.width = "100%";
  } else {
    prevBtn.classList.remove("uk-hidden");
    nextBtn.style.width = "50%";
  }
  if (count == questionsCount) {
    nextBtn.classList.add("uk-hidden");
    finishBtn.classList.remove("uk-hidden");
  } else {
    nextBtn.classList.remove("uk-hidden");
    finishBtn.classList.add("uk-hidden");
  }
}

let timerCount;
function timerQuiz() {
  timerCount = timerSecond;
  let timer20 = (timerSecond / 100) * 20;
  let timer10 = (timerSecond / 100) * 10;
  let timer = setInterval(function () {
    document.getElementById("timer").innerHTML = prettifyTime(timerCount);
    document.querySelector(".fill").style.width =
      (timerCount / timerSecond) * 100 + "%";
    if (timerCount < timer20) {
      document.querySelector(".fill").style.backgroundColor = "gold";
    } else if (timerCount < timer10) {
      document.querySelector(".fill").style.backgroundColor = "#dc3545";
    } else{
      document.querySelector(".fill").style.backgroundColor = "#007bff";
    }
    if (timerCount == 0) {
      clearInterval(timer);
      viewUpdate();
      UIkit.notification({
        message: `<span class="uk-margin-small-right" uk-icon="icon: warning; ratio: 2"></span> Время закончен !!! `,
        status: "warning",
        pos: "bottom-right",
      });
    } else if (count == questionsCount) {
      finishBtn.addEventListener("click", () => {
        clearInterval(timer);
      });
    }
    --timerCount;
  }, 1000);
}

function prettifyTime(time) {
  let minutes = ~~((time % 3600) / 60);
  let seconds = ~~(time % 60);

  return (
    "" +
    parseInt(minutes / 10) +
    (minutes % 10) +
    ":" +
    parseInt(seconds / 10) +
    (seconds % 10)
  );
}

prevBtn.addEventListener("click", prevQuestion);
nextBtn.addEventListener("click", nextQuestion);
checkBtn.addEventListener("click", checkOption);
finishBtn.addEventListener("click", finishQuiz);
repeatBtn.addEventListener("click", repeatQuiz);
exitBtn.addEventListener("click", exitQuiz);

function render() {
  document.getElementById("category").innerHTML = "";
  let query = firebase.database().ref("quizzes").orderByKey();
  query.once("value").then(function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      let id = childSnapshot.key;
      let name = childSnapshot.val().name;
      let duration = childSnapshot.val().duration;
      let questionsC = childSnapshot.val().questions;
      let reopenCount = childSnapshot.val().reopen;
      document.getElementById("category").insertAdjacentHTML(
        "afterbegin",
        `<div>
            <div class="uk-card uk-card-default uk-card-hover">
              <div class="uk-card-header">
                <div class="uk-width-1-1 uk-flex uk-flex-between uk-flex-middle">
                  <h3 class=" uk-card-title uk-margin-remove-bottom">${name}</h3>
                </div>
              </div>
              <div class="uk-card-body">
                  <p>
                      Время теста: ${duration} мин.<br>
                      Количество вопросов: ${questionsC}<br>
                      Количество попыток: ${reopenCount}<br>
                  </p>
              </div>
              <div class="uk-card-footer">
              <button data-id="${id}" onclick="startQuiz(this)" class="uk-button uk-button-primary uk-width-1-1" href="#modal-full" uk-toggle>Начать</button>
              </div>
            </div>
          </div>`
      );
    });
  });
}

document.addEventListener("DOMContentLoaded", render);
