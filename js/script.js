import { calculateScore } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const questionContainer = document.getElementById('quiz');
    const questionElement = document.getElementById('question');
    const answerElements = document.querySelectorAll('.answer');
    const submitButton = document.getElementById('submit');
    const feedbackCorrect = document.getElementById('correct');
    const feedbackIncorrect = document.getElementById('incorrect');
    const resultadosContainer = document.getElementById('resultados');
    const puntuacionElement = document.getElementById('puntuacion');
    const listaCorrectas = document.getElementById('listaCorrectas');
    const listaIncorrectas = document.getElementById('listaIncorrectas');
    const reiniciarButton = document.getElementById('reiniciar');
    const otroTestButton = document.getElementById('otroTest'); // Nuevo botón

    reiniciarButton.addEventListener('click', reiniciarTest);

    // Evento para redirigir al usuario a la pantalla de selección de test
    otroTestButton.addEventListener('click', () => {
        window.location.href = './index.html';
    });

    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let selectedQuestions = [];

    // Obtener el parámetro 'type' de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const testType = urlParams.get('type'); // 'html' o 'css'

    // Determinar el archivo JSON a cargar
    let jsonFile = './resources/preguntas.json'; // Por defecto, CSS
    if (testType === 'html') {
        jsonFile = './resources/preguntas-HTML.json';
    }

    // Cargar el archivo JSON correspondiente
    fetch(jsonFile)
        .then(response => response.json())
        .then(data => {
            questions = data;
            selectRandomQuestions();
            loadQuestion();
        });

    function selectRandomQuestions() {
        const shuffled = questions.sort(() => 0.5 - Math.random());
        selectedQuestions = shuffled.slice(0, 10); // Selecciona 10 preguntas aleatorias
        console.log('Preguntas seleccionadas:', selectedQuestions); // Depuración
    }

    function loadQuestion() {
        resetState();
        const currentQuestion = selectedQuestions[currentQuestionIndex];
        questionElement.innerText = currentQuestion.question;
        answerElements.forEach((answerElement, index) => {
            answerElement.nextElementSibling.innerText = currentQuestion.answers[index];
        });
    }

    function resetState() {
        feedbackCorrect.style.display = 'none';
        feedbackIncorrect.style.display = 'none';
        answerElements.forEach(answer => {
            answer.checked = false;
        });
    }

    function ControllAnswer() {
        const selectedAnswer = Array.from(answerElements).find(answer => answer.checked);
        if (!selectedAnswer) {
            alert('Por favor, selecciona una respuesta antes de continuar.');
            return false; // Detener la ejecución si no hay respuesta seleccionada
        }

        const answerIndex = Array.from(answerElements).indexOf(selectedAnswer);
        const currentQuestion = selectedQuestions[currentQuestionIndex];

        if (!currentQuestion) {
            console.error('La pregunta actual no está definida.');
            return false; // Detener la ejecución si no hay pregunta actual
        }

        currentQuestion.userAnswer = answerIndex; // Guardar la respuesta del usuario

        if (currentQuestion.correctAnswer === answerIndex) {
            feedbackCorrect.style.display = 'block';
        } else {
            feedbackIncorrect.style.display = 'block';
        }

        return true; // Indicar que la respuesta fue procesada correctamente
    }

    submitButton.addEventListener('click', () => {
        const isAnswerProcessed = ControllAnswer();
        if (isAnswerProcessed) {
            currentQuestionIndex++;
            if (currentQuestionIndex < selectedQuestions.length) {
                loadQuestion();
            } else {
                showResults();
            }
        }
    });

    function showResults() {
        questionContainer.style.display = 'none';
        resultadosContainer.style.display = 'block';

        // Recopilar respuestas del usuario y correctas
        const userAnswers = selectedQuestions.map(q => q.userAnswer);
        const correctAnswers = selectedQuestions.map(q => q.correctAnswer);

        // Calcular puntaje usando calculateScore
        score = calculateScore(userAnswers, correctAnswers);

        puntuacionElement.innerText = `Puntuación: ${score} de ${selectedQuestions.length}`;

        // Guardar el resultado del test en localStorage
        const testResults = JSON.parse(localStorage.getItem('testResults')) || [];
        testResults.push({ score, total: selectedQuestions.length });
        localStorage.setItem('testResults', JSON.stringify(testResults));

        // Calcular el promedio de respuestas correctas
        const totalTests = testResults.length;
        const totalCorrectAnswers = testResults.reduce((sum, test) => sum + test.score, 0);
        const averageScore = (totalCorrectAnswers / (totalTests * selectedQuestions.length)) * 100;

        // Mostrar el promedio en la pantalla de resultados
        const promedioElement = document.createElement('p');
        promedioElement.innerText = `Promedio de respuestas correctas: ${averageScore.toFixed(2)}% (${totalTests} tests realizados)`;
        resultadosContainer.prepend(promedioElement);

        // Obtener la fecha y hora actuales
        const now = new Date();
        const formattedDate = now.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        const formattedTime = now.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });

        // Mostrar la fecha y hora en el contenedor de resultados
        const fechaHoraElement = document.createElement('p');
        fechaHoraElement.innerText = `Fecha y hora del test: ${formattedDate} ${formattedTime}`;
        resultadosContainer.prepend(fechaHoraElement);

        // Limpiar listas de respuestas correctas e incorrectas
        listaCorrectas.innerHTML = '';
        listaIncorrectas.innerHTML = '';

        // Mapeo de letras a índices
        const letterToIndex = { a: 0, b: 1, c: 2, d: 3 };

        // Mostrar questions con sus respuestas correctas e incorrectas
        selectedQuestions.forEach((question, index) => {
            const listItem = document.createElement('li');
            const correctIndex = letterToIndex[question.correctAnswer]; // Convertir letra a índice
            const userAnswerText = question.answers[question.userAnswer] || 'Sin respuesta';
            const correctAnswerText = question.answers[correctIndex];

            // Agregar íconos y clases para estilos
            if (question.userAnswer === correctIndex) {
                listItem.classList.add('correct'); // Clase para respuestas correctas
                listItem.innerHTML = `<span class="icon">✔️</span> question ${index + 1}: ${question.question}<br>
                - Respuesta correcta: <strong>${correctAnswerText}</strong>`;
                listaCorrectas.appendChild(listItem);
            } else {
                listItem.classList.add('incorrect'); // Clase para respuestas incorrectas
                listItem.innerHTML = `<span class="icon">❌</span> question ${index + 1}: ${question.question}<br>
                - Tu respuesta: <strong>${userAnswerText}</strong><br>
                - Respuesta correcta: <strong>${correctAnswerText}</strong>`;
                listaIncorrectas.appendChild(listItem);
            }
        });
    }

    function reiniciarTest() {
        currentQuestionIndex = 0;
        score = 0;
        selectedQuestions = [];
        questionContainer.style.display = 'block';
        resultadosContainer.style.display = 'none';
        // Volver a cargar las preguntas desde el mismo archivo JSON
        fetch(jsonFile)
            .then(response => response.json())
            .then(data => {
                questions = data;
                selectRandomQuestions();
                loadQuestion();
            })
            .catch(error => {
                console.error('Error al cargar el archivo JSON:', error);
                alert('Hubo un problema al reiniciar el test. Por favor, inténtalo de nuevo.');
            });
    }
});