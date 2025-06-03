function getRandomQuestions(questions, numQuestions) {
  const shuffled = questions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numQuestions);
}

function calculateScore(userAnswers, correctAnswers) {
  const letterToIndex = { a: 0, b: 1, c: 2, d: 3 }; // Mapeo de letras a índices
  let score = 0;

  userAnswers.forEach((answer, index) => {
    const correctIndex = letterToIndex[correctAnswers[index]]; // Convertir letra a índice
    if (answer === correctIndex) {
      score++;
    }
  });

  return score;
}

function displayFeedback(isCorrect) {
  const feedbackElement = document.getElementById(
    isCorrect ? "correct" : "incorrect"
  );
  feedbackElement.style.display = "block";
  setTimeout(() => {
    feedbackElement.style.display = "none";
  }, 2000);
}

function fetchQuestions(testType) {
  const owner = "Orpira";
  const repo = "Test-HTML";
  const path = "resources/questions.json";

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  //const url = `https://github.com/Orpira/Test-HTML/blob/main/resources/questions.json`;
  console.log("Fetching questions from:", url);

  return fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const base64 = data.content;
      const decoded = atob(base64);
      const questions = JSON.parse(decoded);
      // Filtrar por categoría si se proporciona
      console.log("testType:", testType, "questions:", questions);
      if (testType) {
        return questions.filter((q) => q.category === testType);
      }
      return questions;
    })
    .catch((err) => {
      document.getElementById("quiz-container").innerText =
        "Error cargando preguntas.";
      console.error(err);
    });
}

function renderQuiz(questions) {
  //const container = document.getElementById("quiz-container");
  //container.innerHTML = "";

  questions.forEach((q, index) => {
    //const div = document.createElement("div");
    //div.className = "question";

    //const question = document.createElement("p");
    //question.textContent = `${index + 1}. ${q.question}`;

    const ul = document.createElement("ul");
    q.options.forEach((option) => {
      const li = document.createElement("li");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `q-${index}`;
      input.value = option;
      li.appendChild(input);
      li.append(" " + option);
      ul.appendChild(li);
    });

    div.appendChild(question);
    div.appendChild(ul);
    container.appendChild(div);
  });
}

export { getRandomQuestions, calculateScore, displayFeedback, fetchQuestions };
