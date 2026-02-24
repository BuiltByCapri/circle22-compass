// State
let currentQuestionIndex = 0;
let userEmail = '';
let responses = {};

// DOM Elements
const landingPage = document.getElementById('landing-page');
const questionPage = document.getElementById('question-page');
const resultsPage = document.getElementById('results-page');
const emailForm = document.getElementById('email-form');
const emailInput = document.getElementById('email-input');
const progressFill = document.getElementById('progress-fill');
const questionNumber = document.getElementById('question-number');
const questionText = document.getElementById('question-text');
const elementLabel = document.getElementById('element-label');
const answersContainer = document.getElementById('answers-container');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

// Email Form Submit
emailForm.addEventListener('submit', (e) => {
    e.preventDefault();
    userEmail = emailInput.value;
    landingPage.classList.remove('active');
    questionPage.classList.add('active');
    showQuestion(0);
});

// Show Question
function showQuestion(index) {
    currentQuestionIndex = index;
    const question = questions[index];
    
    // Update progress
    const progress = ((index + 1) / questions.length) * 100;
    progressFill.style.width = progress + '%';
    
    // Update question info
    questionNumber.textContent = `Question ${index + 1} of ${questions.length}`;
    questionText.textContent = question.text;
    elementLabel.textContent = question.elementLabel;
    
    // Clear previous answers
    answersContainer.innerHTML = '';
    
    // Render answer options
    if (question.type === 'single') {
        renderSingleChoice(question);
    } else if (question.type === 'multiple') {
        renderMultipleChoice(question);
    } else if (question.type === 'text') {
        renderTextInput(question);
    }
    
    // Update button states
    prevBtn.disabled = index === 0;
    updateNextButton();
}

// Render Single Choice
function renderSingleChoice(question) {
    question.options.forEach(option => {
        const div = document.createElement('div');
        div.className = 'answer-option';
        div.textContent = option.text;
        div.dataset.value = option.value;
        
        // Check if already selected
        if (responses[question.id] === option.value) {
            div.classList.add('selected');
        }
        
        div.addEventListener('click', () => {
            // Remove previous selection
            document.querySelectorAll('.answer-option').forEach(el => {
                el.classList.remove('selected');
            });
            div.classList.add('selected');
            responses[question.id] = option.value;
            updateNextButton();
        });
        
        answersContainer.appendChild(div);
    });
}

// Render Multiple Choice
function renderMultipleChoice(question) {
    const maxSelections = question.maxSelections || 2;
    const selectedCount = responses[question.id] ? responses[question.id].length : 0;
    
    question.options.forEach(option => {
        const div = document.createElement('div');
        div.className = 'answer-option checkbox';
        div.textContent = option.text;
        div.dataset.value = option.value;
        
        // Check if already selected
        if (responses[question.id] && responses[question.id].includes(option.value)) {
            div.classList.add('selected');
        }
        
        div.addEventListener('click', () => {
            if (!responses[question.id]) {
                responses[question.id] = [];
            }
            
            if (div.classList.contains('selected')) {
                // Deselect
                div.classList.remove('selected');
                responses[question.id] = responses[question.id].filter(v => v !== option.value);
            } else {
                // Select (if under max)
                if (responses[question.id].length < maxSelections) {
                    div.classList.add('selected');
                    responses[question.id].push(option.value);
                }
            }
            updateNextButton();
        });
        
        answersContainer.appendChild(div);
    });
}

// Render Text Input
function renderTextInput(question) {
    const textarea = document.createElement('textarea');
    textarea.className = 'open-text-input';
    textarea.placeholder = question.placeholder || '';
    textarea.value = responses[question.id] || '';
    
    textarea.addEventListener('input', (e) => {
        responses[question.id] = e.target.value;
        updateNextButton();
    });
    
    answersContainer.appendChild(textarea);
    
    if (question.helperText) {
        const helper = document.createElement('p');
        helper.className = 'helper-text';
        helper.textContent = question.helperText;
        answersContainer.appendChild(helper);
    }
}

// Update Next Button
function updateNextButton() {
    const question = questions[currentQuestionIndex];
    const hasAnswer = responses[question.id] && 
        (question.type === 'text' ? responses[question.id].trim().length > 0 : 
         question.type === 'multiple' ? responses[question.id].length > 0 : 
         true);
    
    if (currentQuestionIndex === questions.length - 1) {
        nextBtn.textContent = hasAnswer ? 'See My Results' : 'Skip & See Results';
    } else {
        nextBtn.textContent = 'Next';
    }
}

// Navigation
prevBtn.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        showQuestion(currentQuestionIndex - 1);
    }
});

nextBtn.addEventListener('click', () => {
    if (currentQuestionIndex < questions.length - 1) {
        showQuestion(currentQuestionIndex + 1);
    } else {
        // Show results
        calculateResults();
    }
});

// Calculate Results
function calculateResults() {
    // Calculate scores for each element
    const scores = {
        needle: calculateElementScore('The Needle'),
        rose: calculateElementScore('The Rose'),
        bearing: calculateElementScore('The Bearing'),
        anchor: calculateElementScore('The Anchor')
    };
    
    // Send to Google Sheets
    sendToGoogleSheets(scores);
    
    // Show results
    showResults(scores);
}

// Calculate Element Score (simplified - returns random for demo)
function calculateElementScore(elementName) {
    // This is a placeholder - you'll implement actual scoring logic later
    // For now, return a random score between 60-95
    return Math.floor(Math.random() * 35) + 60;
}

// Send to Google Sheets
function sendToGoogleSheets(scores) {
    // TODO: Implement Google Sheets integration
    // For now, just log to console
    console.log('Email:', userEmail);
    console.log('Responses:', responses);
    console.log('Scores:', scores);
}

// Show Results
function showResults(scores) {
    questionPage.classList.remove('active');
    resultsPage.classList.add('active');
    
    // Animate bars
    setTimeout(() => {
        document.getElementById('needle-bar').style.width = scores.needle + '%';
        document.getElementById('rose-bar').style.width = scores.rose + '%';
        document.getElementById('bearing-bar').style.width = scores.bearing + '%';
        document.getElementById('anchor-bar').style.width = scores.anchor + '%';
    }, 300);
    
    // Update score text
    document.getElementById('needle-score').textContent = scores.needle + '%';
    document.getElementById('rose-score').textContent = scores.rose + '%';
    document.getElementById('bearing-score').textContent = scores.bearing + '%';
    document.getElementById('anchor-score').textContent = scores.anchor + '%';
    
    // Generate insights
    const insights = generateInsights(scores);
    document.getElementById('insights-text').textContent = insights;
    
    // Draw compass rose
    drawCompassRose(scores);
}

// Generate Insights
function generateInsights(scores) {
    const highest = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    
    const insights = {
        needle: "You connect best with people who appreciate your authentic presence and communication style.",
        rose: "You're energized by connections that match your natural rhythm and tempo.",
        bearing: "You're drawn to depth and authenticity in the people you meet.",
        anchor: "You build connection through consistency and showing up with intention."
    };
    
    return insights[highest] + " Your Compass shows you value genuine connection over surface-level interaction.";
}

// Draw Compass Rose
function drawCompassRose(scores) {
    const canvas = document.getElementById('compass-canvas');
    const ctx = canvas.getContext('2d');
    const centerX = 150;
    const centerY = 150;
    const maxRadius = 120;
    
    // Clear canvas
    ctx.clearRect(0, 0, 300, 300);
    
    // Draw circles
    ctx.strokeStyle = '#d4cfc4';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (maxRadius / 4) * i, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = '#8B2E2E';
    ctx.lineWidth = 2;
    
    // N-S axis
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - maxRadius);
    ctx.lineTo(centerX, centerY + maxRadius);
    ctx.stroke();
    
    // E-W axis
    ctx.beginPath();
    ctx.moveTo(centerX - maxRadius, centerY);
    ctx.lineTo(centerX + maxRadius, centerY);
    ctx.stroke();
    
    // Draw labels
    ctx.fillStyle = '#EFBF04';
    ctx.font = 'bold 16px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('N', centerX, centerY - maxRadius - 10);
    ctx.fillText('S', centerX, centerY + maxRadius + 20);
    ctx.fillText('W', centerX - maxRadius - 15, centerY + 5);
    ctx.fillText('E', centerX + maxRadius + 15, centerY + 5);
    
    // Plot scores
    const needleRadius = (scores.needle / 100) * maxRadius;
    const roseRadius = (scores.rose / 100) * maxRadius;
    const bearingRadius = (scores.bearing / 100) * maxRadius;
    const anchorRadius = (scores.anchor / 100) * maxRadius;
    
    ctx.fillStyle = '#8B2E2E';
    
    // North (Needle)
    ctx.beginPath();
    ctx.arc(centerX, centerY - needleRadius, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // East (Rose)
    ctx.beginPath();
    ctx.arc(centerX + roseRadius, centerY, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // South (Bearing)
    ctx.beginPath();
    ctx.arc(centerX, centerY + bearingRadius, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // West (Anchor)
    ctx.beginPath();
    ctx.arc(centerX - anchorRadius, centerY, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Connect the dots
    ctx.strokeStyle = 'rgba(139, 46, 46, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - needleRadius);
    ctx.lineTo(centerX + roseRadius, centerY);
    ctx.lineTo(centerX, centerY + bearingRadius);
    ctx.lineTo(centerX - anchorRadius, centerY);
    ctx.closePath();
    ctx.stroke();
    
    ctx.fillStyle = 'rgba(139, 46, 46, 0.1)';
    ctx.fill();
}

// Download Results Card
document.getElementById('download-btn').addEventListener('click', () => {
    alert('Download feature coming soon! For now, take a screenshot of your results.');
});
