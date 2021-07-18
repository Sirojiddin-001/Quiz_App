class Quiz {
  constructor(data = {}) {
    this.quizData = data;
    this.questionsCount = this.quizData.questions;
    this.count = 1;
    this.score = 0;
    this.quizName = document.getElementById("quiz_name");
    this.question = document.getElementById("question");
    this.counter = document.getElementById("counter");
    this.optionsBlock = document.getElementById("options_block");
    this.prevBtn = document.getElementById("prev");
    this.nextBtn = document.getElementById("next");
    this.finishBtn = document.getElementById("finished");
    this.checkBtn = document.getElementById("check");
    this.repeatBtn = document.getElementById("repeat");
    this.exitBtn = document.getElementById("exit");
    this.finishText = document.getElementById("score");
    this.questionsArray = [];
    this.history = {};
    this.selected = "";
    this.#toArray();
    this.repeatQuiz();
    this.#startQuiz();
  }

  #startQuiz() {
    this.quizName.innerHTML = this.quizData.name;
    this.checkAnswer = this.checkAnswer.bind(this);
    this.nextQuestion = this.nextQuestion.bind(this);
    this.prevQuestion = this.prevQuestion.bind(this);
    this.finishQuiz = this.finishQuiz.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.repeatQuiz = this.repeatQuiz.bind(this);
    this.prevBtn.addEventListener("click", this.prevQuestion);
    this.nextBtn.addEventListener("click", this.nextQuestion);
    this.checkBtn.addEventListener("click", this.checkAnswer);
    this.finishBtn.addEventListener("click", this.finishQuiz);
    this.repeatBtn.addEventListener("click", this.repeatQuiz);
    this.exitBtn.addEventListener("click", this.closeModal);
  }

  #hiddenBtns() {
    if (this.count < 2) {
      this.prevBtn.classList.add("uk-hidden");
      this.nextBtn.style.width = "100%";
    } else {
      this.prevBtn.classList.remove("uk-hidden");
      this.nextBtn.style.width = "50%";
    }
    if (this.count == this.questionsCount) {
      this.nextBtn.classList.add("uk-hidden");
      this.finishBtn.classList.remove("uk-hidden");
    } else {
      this.nextBtn.classList.remove("uk-hidden");
      this.finishBtn.classList.add("uk-hidden");
    }
  }

  optionUpdate() {
    this.nextBtn.setAttribute("disabled", "");
    this.checkBtn.setAttribute("disabled", "");
    this.finishBtn.setAttribute("disabled", "");
    this.checkBtn.classList.remove("uk-hidden");

    document.querySelectorAll(".option").forEach((el) => {
      el.classList.remove("disabled");
      el.classList.remove("success");
      el.classList.remove("danger");
      el.classList.remove("active");
    });
  }

  #toArray() {
    for (
      let index = 1;
      index < Object.keys(this.quizData).length - 3;
      index++
    ) {
      let questions = this.quizData[`question_${index}`];
      let optionsArray = [];
      for (let i = 1; i < Object.keys(questions).length - 1; i++) {
        let options = this.quizData[`question_${index}`][`option_${i}`];
        optionsArray.push(options);
      }

      for (let i = 1; i < Object.keys(questions).length; i++) {
        delete this.quizData[`question_${index}`][`option_${i}`];
      }
      this.#shuffle(optionsArray);
      questions.options = optionsArray;
      this.questionsArray.push(questions);
    }
  }

  #shuffle(array) {
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

  viewQuestion(num = 0) {
    let options = document.querySelectorAll(".option");
    this.question.innerHTML = this.questionsArray[
      this.count - 1 + num
    ].question;
    options.forEach((el, i) => {
      el.innerHTML = this.questionsArray[this.count - 1 + num].options[i];
      el.addEventListener("click", () => {
        let options = document.querySelectorAll(".option");
        options.forEach((el) => {
          el.classList.remove("active");
        });
        el.classList.add("active");
        this.selected = el.innerHTML;
        console.log(this.selected);
        this.checkBtn.removeAttribute("disabled");
      });
    });
  }

  addOption() {
    let element = document.createElement("div");
    element.className = "option";
    this.optionsBlock.append(element);
  }

  counterInit() {
    this.counter.innerHTML = `${this.count}/${this.questionsCount}`;
  }

  moreAddOptions(num = 0) {
    let options = document.querySelectorAll(".option");
    let objectLength = this.questionsArray[this.count - 1 + num].options.length;
    if (options.length < objectLength) {
      for (let i = options.length; i < objectLength; i++) {
        this.addOption();
      }
    }
  }

  moreDeleteOptions(num = 0) {
    let options = document.querySelectorAll(".option");
    let objectLength = this.questionsArray[this.count - 1 + num].options.length;
    console.log(options.length);
    console.log(objectLength);
    if (options.length > objectLength) {
      for (let i = options.length; i > objectLength; i--) {
        options[i - 1].remove();
      }
    }
  }

  checkAnswer() {
    this.history[`question_${this.count}`] = {};
    this.history[`question_${this.count}`].answer = this.selected;
    let answer = this.questionsArray[this.count - 1].answer;
    let options = document.querySelectorAll(".option");
    options.forEach((el) => {
      el.classList.add("disabled");
    });
    if (this.selected == answer) {
      options.forEach((el) => {
        if (el.innerHTML == this.selected) {
          el.classList.add("success");
        }
      });
      this.score++;
    } else {
      options.forEach((el) => {
        if (el.innerHTML == this.selected) {
          el.classList.add("danger");
        }
        if (el.innerHTML == answer) {
          el.classList.add("success");
        }
      });
    }
    this.prevBtn.removeAttribute("disabled");
    this.nextBtn.removeAttribute("disabled");
    this.finishBtn.removeAttribute("disabled");
  }

  historyView(num = 0, prev = 0) {
    let answer = this.questionsArray[this.count - prev].answer;
    let historyAnswer = this.history[`question_${this.count + num}`].answer;
    let options = document.querySelectorAll(".option");
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
    this.nextBtn.removeAttribute("disabled");
    this.finishBtn.removeAttribute("disabled");
    this.checkBtn.classList.add("uk-hidden");
  }

  prevQuestion() {
    if (this.count > 1) {
      this.count--;
      this.counterInit();
    }
    this.moreAddOptions();
    this.moreDeleteOptions();
    this.viewQuestion();
    this.optionUpdate();
    this.historyView(0, 1);
    this.#hiddenBtns();
  }

  nextQuestion() {
    if (this.count <= this.questionsCount) {
      if (this.count < this.questionsArray.length) {
        this.moreAddOptions(1);
        this.moreDeleteOptions(1);
        this.viewQuestion(1);
        this.optionUpdate();
        if (this.history[`question_${this.count + 1}`]) {
          this.historyView(1);
        }
      }

      if (this.count < this.questionsCount) {
        this.count++;
        this.counterInit();
      }
    }
    this.#hiddenBtns();
  }

  finishQuiz() {
    if (this.count == this.questionsCount) {
      this.counter.innerHTML = `Оценка: ${this.score} из ${this.questionsCount}`;
      document.querySelector(".full").classList.remove("uk-hidden");
      if (this.score == 0) {
        this.finishText.innerHTML = "Вам многому нужно научиться";
      } else if (this.score < 4) {
        this.finishText.innerHTML = "Вы уже неплохо разбираетесь";
      } else if (this.score < 9) {
        this.finishText.innerHTML = "Ваш уровень выше среднего";
      } else {
        this.finishText.innerHTML = "Вы в совершенстве знаете тему";
      }
      this.question.classList.add("uk-hidden");
      this.checkBtn.classList.add("uk-hidden");
      this.prevBtn.classList.add("uk-hidden");
      this.nextBtn.classList.add("uk-hidden");
      this.finishBtn.classList.add("uk-hidden");
      this.repeatBtn.classList.remove("uk-hidden");
      this.exitBtn.classList.remove("uk-hidden");
    }
  }

  repeatQuiz() {
    this.count = 1;
    this.score = 0;
    this.history = {};
    this.selected = "";
    this.#shuffle(this.questionsArray);
    document.querySelector(".full").classList.add("uk-hidden");
    this.question.classList.remove("uk-hidden");
    this.optionUpdate();
    this.#hiddenBtns();
    this.counterInit();
    this.moreAddOptions();
    this.moreDeleteOptions();
    this.viewQuestion();
    this.nextBtn.classList.remove("uk-hidden");
    this.repeatBtn.classList.add("uk-hidden");
    this.exitBtn.classList.add("uk-hidden");
  }

  closeModal() {
    document.getElementById("close_quiz").click();
  }
}

document.getElementById("start_quiz").addEventListener("click", () => {
  new Quiz({
    duration: "20",
    name: "Quiz 1",
    question_1: {
      answer: "<p>2</p>",
      option_1: "<p>2</p>",
      option_2: "<p>3</p>",
      question: "<p>1</p>",
    },
    question_2: {
      answer: "<p>4</p>",
      option_1: "<p>3</p>",
      option_2: "<p>4</p>",
      question: "<p>2</p>",
    },
    question_3: {
      answer: "<p>6</p>",
      option_1: "<p>6</p>",
      option_2: "<p>7</p>",
      option_3: "<p>9</p>",
      question: "<p>5</p>",
    },
    questions: "3",
    reopen: "3",
  });
});

// let quiz =
