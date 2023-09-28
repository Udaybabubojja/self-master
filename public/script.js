// Initialize Firebase Authentication
const firebaseConfig = {
    apiKey: "AIzaSyD3KfuoYiOm_e75xRjMc23_oWUp8tGYJmI",
    authDomain: "anime-d5da7.firebaseapp.com",
    projectId: "anime-d5da7",
    storageBucket: "anime-d5da7.appspot.com",
    messagingSenderId: "1043887892058",
    appId: "1:1043887892058:web:7724a2cf68a61b7ecf1a63"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const firestore = firebase.firestore();

document.addEventListener('DOMContentLoaded', function () {
    const generateButton = document.getElementById('generateQuestions');
    const quizContainer = document.getElementById('quiz-container');
    const submitButton = document.getElementById('submitAnswers');
    const resultsContainer = document.getElementById('results');
    const scoreElement = document.getElementById('score');
    const correctAnswersElement = document.getElementById('correct-answers');
    const userNameElement = document.getElementById('user-name');

    // Function to check if a user is logged in
    function checkUserLogin() {
        auth.onAuthStateChanged((user) => {
            if (user) {
                document.getElementById("user-name").textContent = `Hi, Learner`;
                console.log(user);
                generateButton.disabled = false; // Enable generate button
            } else {
                // User is not logged in
                userNameElement.textContent = 'Hi, User. Please login to generate questions';

                generateButton.disabled = true; // Disable generate button
            }
        });
    }

    // Call the function to check user login status
    checkUserLogin();

    function handleLogout() {
        auth.signOut()
            .then(() => {
                // Sign-out successful.
                window.location.href = '/login'; // Redirect to the login page
            })
            .catch((error) => {
                console.error('Error during logout:', error);
            });
    }

    // Add a click event listener to the logout button
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            handleLogout();
        });
    }
    //defining the variable
    let amount;
    let category, difficulty,type;
    generateButton.addEventListener('click', function () {
        // Check if the user is logged in before generating questions
        const user = auth.currentUser;
        if (user) {
            // User is logged in, proceed with generating questions
            amount = document.getElementById('amount').value;
            category = document.getElementById('category').value;
            difficulty = document.getElementById('difficulty').value;
            type = document.getElementById('type').value;

            // Construct the API URL based on user selections
            const apiUrl = `https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=${type}`;
            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    questionsData = data.results;
                    createQuiz(questionsData);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        } else {
            // User is not logged in, display a message or redirect to the login page
            alert('You must be logged in to generate questions.');
        }
    });

    function createQuiz(questions) {
        quizContainer.innerHTML = '';
        submitButton.style.display = 'block';

        questions.forEach((questionData, index) => {
            const questionElement = document.createElement('div');
            questionElement.classList.add('question-container');

            questionElement.innerHTML = `
                <p>${index + 1}. ${questionData.question}</p>
                <form id="question-${index}">
                    ${
                        questionData.type === 'multiple'
                            ? shuffle([...questionData.incorrect_answers, questionData.correct_answer]).map((option, optionIndex) => `
                                <label>
                                    <input type="radio" name="answer-${index}" value="${option}">
                                    ${String.fromCharCode(65 + optionIndex)}. ${option}
                                </label><br>
                            `).join('')
                            : `
                                <label>
                                    <input type="radio" name="answer-${index}" value="True">
                                    True
                                </label>
                                <label>
                                    <input type="radio" name="answer-${index}" value="False">
                                    False
                                </label>
                            `
                    }
                </form>
                <div id="answer-${index}" style="display: none;"></div> <!-- Answer container -->
            `;

            quizContainer.appendChild(questionElement);
        });

        // Check if resultsContainer is not null before modifying style property
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
        }

        submitButton.addEventListener('click', () => {
            let score = 0;
            const selectedAnswers = [];
            const correctAnswers = [];

            questionsData.forEach((questionData, index) => {
                const selectedOption = document.querySelector(`input[name="answer-${index}"]:checked`);
                if (selectedOption) {
                    selectedAnswers.push(selectedOption.value);
                    if (selectedOption.value === questionData.correct_answer || (questionData.type === 'true_false' && selectedOption.value.toLowerCase() === questionData.correct_answer.toLowerCase())) {
                        score++;
                        correctAnswers.push(`${index + 1}. ${questionData.correct_answer}`);
                    } else {
                        correctAnswers.push(`${index + 1}. ${questionData.correct_answer}`);
                    }
                } else {
                    correctAnswers.push(`${index + 1}. ${questionData.correct_answer}`);
                }
            });

            scoreElement.textContent = `Score: ${score} / ${questionsData.length}`;
            correctAnswersElement.textContent = `Correct Answers: ${correctAnswers.join('\n')}`;
            resultsContainer.style.display = 'block';
            submitcode(score);
        });
    }
    function submitcode(score){
        const user = auth.currentUser;

        if (user) {
            // Populate the hidden form fields with the data
            document.getElementById('email1').value = user.email;
            document.getElementById('score1').value = score;
            document.getElementById('difficulty1').value = difficulty;
            document.getElementById('type1').value = type;
            document.getElementById('category1').value=category;
            document.getElementById('submitQuiz').style.display = 'block'; 
            document.getElementById('total1').value = amount;
        }
        else{
            alert("Unable to Add the Data");
        }
        
    }
    function shuffle(array) {
        let currentIndex = array.length, randomIndex, temporaryValue;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }
});
