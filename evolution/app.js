// Evolution Framework Application JavaScript

// Framework data
const frameworkData = {
  "framework": {
    "name": "Evolution Framework: Seven Pillars of Holistic Personal Development",
    "centerPillar": {
      "name": "Swadharma",
      "description": "Personal dharma and natural purpose - the core foundation",
      "stages": ["Discovery", "Alignment", "Integration", "Mastery"],
      "assessmentQuestions": [
        "Do I have a clear understanding of my core values and life purpose?",
        "Am I living in alignment with my natural strengths and passions?",
        "Do my daily actions reflect my authentic self and dharma?",
        "Am I making decisions that honor my true nature?",
        "Do I feel fulfilled and purposeful in my current path?",
        "Am I contributing to the world in a way that feels natural to me?",
        "Do I experience flow and ease when working within my dharma?"
      ]
    },
    "surroundingPillars": [
      {
        "name": "Operating & Organization Skills",
        "description": "Systematic execution and management abilities",
        "stages": ["Foundation", "Development", "Optimization", "Leadership"],
        "assessmentQuestions": [
          "Do I have effective systems for managing my time and priorities?",
          "Can I plan and execute complex projects successfully?",
          "Am I skilled at organizing resources and coordinating activities?",
          "Do I demonstrate leadership in organizing teams and initiatives?",
          "Can I create and optimize efficient processes and workflows?",
          "Am I able to manage multiple responsibilities effectively?",
          "Do others look to me for organizational guidance and structure?"
        ]
      },
      {
        "name": "Technical Physical & Mind Ability",
        "description": "Cognitive and physical capabilities development",
        "stages": ["Assessment", "Enhancement", "Integration", "Excellence"],
        "assessmentQuestions": [
          "Am I physically fit and maintaining good health habits?",
          "Do I continuously develop my technical and cognitive skills?",
          "Am I mentally sharp and able to learn new concepts quickly?",
          "Do I integrate mind-body practices for optimal performance?",
          "Am I recognized for my technical expertise in my field?",
          "Do I maintain high energy levels and mental clarity?",
          "Can I perform at peak levels when needed?"
        ]
      },
      {
        "name": "Social Leverage Network",
        "description": "Relationship building and networking mastery",
        "stages": ["Building", "Expanding", "Leveraging", "Influencing"],
        "assessmentQuestions": [
          "Do I have a strong, diverse network of meaningful relationships?",
          "Can I create mutual value in my professional relationships?",
          "Am I skilled at building rapport and trust with others?",
          "Do I actively maintain and nurture my network connections?",
          "Can I leverage my network to create opportunities for myself and others?",
          "Am I seen as a valuable connector within my industry/community?",
          "Do I have influence within my professional and social circles?"
        ]
      },
      {
        "name": "Financial Model",
        "description": "Wealth building and financial strategy",
        "stages": ["Planning", "Implementing", "Scaling", "Sustaining"],
        "assessmentQuestions": [
          "Do I have a clear financial strategy and budget?",
          "Am I building multiple income streams effectively?",
          "Do I understand and actively use investment principles?",
          "Am I making progress toward my financial goals?",
          "Do I have adequate emergency funds and financial security?",
          "Am I building long-term wealth through smart financial decisions?",
          "Can I maintain and grow my wealth sustainably?"
        ]
      },
      {
        "name": "Social Hospitality",
        "description": "Service orientation and interpersonal excellence",
        "stages": ["Awareness", "Cultivation", "Practice", "Service"],
        "assessmentQuestions": [
          "Am I emotionally intelligent and empathetic toward others?",
          "Do I serve others with genuine care and excellence?",
          "Am I culturally aware and respectful in diverse situations?",
          "Do I create positive experiences for people I interact with?",
          "Am I known for my kindness and service orientation?",
          "Do I contribute meaningfully to my community?",
          "Am I developing others through my service and mentorship?"
        ]
      },
      {
        "name": "Personal Brand Marketing",
        "description": "Identity creation and market positioning",
        "stages": ["Identity", "Visibility", "Authority", "Legacy"],
        "assessmentQuestions": [
          "Do I have a clear, authentic personal brand identity?",
          "Am I visible and recognized in my field or industry?",
          "Do I create valuable content that showcases my expertise?",
          "Am I building thought leadership in my area of expertise?",
          "Do others seek my insights and recommendations?",
          "Am I creating a lasting positive impact and reputation?",
          "Will my work and influence continue to benefit others long-term?"
        ]
      }
    ]
  },
  "integrationSynergies": [
    {
      "pillar1": "Swadharma",
      "pillar2": "Operating & Organization Skills", 
      "synergy": "Purpose-driven systems create effortless execution aligned with dharma"
    },
    {
      "pillar1": "Swadharma",
      "pillar2": "Technical Physical & Mind Ability",
      "synergy": "Natural abilities enhanced through dharmic practice and purposeful development"
    },
    {
      "pillar1": "Swadharma", 
      "pillar2": "Social Leverage Network",
      "synergy": "Authentic relationships built on shared values and genuine purpose alignment"
    },
    {
      "pillar1": "Technical Physical & Mind Ability",
      "pillar2": "Personal Brand Marketing",
      "synergy": "Demonstrated expertise strengthens personal brand and market positioning"
    },
    {
      "pillar1": "Social Leverage Network",
      "pillar2": "Financial Model",
      "synergy": "Networks provide financial opportunities and investment partnerships"
    },
    {
      "pillar1": "Social Hospitality",
      "pillar2": "Personal Brand Marketing", 
      "synergy": "Excellent service builds brand reputation and authentic market positioning"
    }
  ]
};

// Application state
let assessmentScores = {
  swadharma: 0,
  operating: 0,
  technical: 0,
  social: 0,
  financial: 0,
  hospitality: 0,
  branding: 0
};

let currentAssessment = {
  pillar: 'swadharma',
  questionIndex: 0,
  answers: [],
  isActive: false
};

// Pillar mappings
const pillarMappings = {
  swadharma: frameworkData.framework.centerPillar,
  operating: frameworkData.framework.surroundingPillars[0],
  technical: frameworkData.framework.surroundingPillars[1],
  social: frameworkData.framework.surroundingPillars[2],
  financial: frameworkData.framework.surroundingPillars[3],
  hospitality: frameworkData.framework.surroundingPillars[4],
  branding: frameworkData.framework.surroundingPillars[5]
};

// Chart.js radar chart instance
let radarChart = null;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  initializeNavigation();
  initializeDashboard();
  initializeAssessment();
  initializeProgress();
  initializeIntegration();
  initializePlanning();
  initializeModals();
  
  // Load saved data
  loadAssessmentData();
  updateAllViews();
});

// Navigation functionality
function initializeNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const views = document.querySelectorAll('.view');
  
  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetView = button.dataset.view;
      
      // Update active navigation
      navButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Show target view
      views.forEach(view => view.classList.remove('active'));
      document.getElementById(`${targetView}-view`).classList.add('active');
      
      // Special handling for progress view to update charts
      if (targetView === 'progress') {
        setTimeout(updateRadarChart, 100);
      }
    });
  });
}

// Dashboard initialization
function initializeDashboard() {
  const pillars = document.querySelectorAll('[data-pillar]');
  
  pillars.forEach(pillar => {
    pillar.addEventListener('click', () => {
      const pillarKey = pillar.dataset.pillar;
      showPillarModal(pillarKey);
    });
  });
}

// Assessment functionality
function initializeAssessment() {
  const pillarSelectButtons = document.querySelectorAll('.pillar-select-btn');
  const nextButton = document.getElementById('next-question');
  const prevButton = document.getElementById('prev-question');
  const startNewButton = document.getElementById('start-new-assessment');
  
  pillarSelectButtons.forEach(button => {
    button.addEventListener('click', () => {
      const pillar = button.dataset.assess;
      selectPillarForAssessment(pillar);
      resetAssessment();
    });
  });
  
  nextButton.addEventListener('click', handleNextQuestion);
  prevButton.addEventListener('click', handlePreviousQuestion);
  startNewButton.addEventListener('click', () => {
    document.querySelector('.assessment-results').classList.add('hidden');
    document.querySelector('.assessment-form').style.display = 'block';
    resetAssessment();
  });
}

function selectPillarForAssessment(pillarKey) {
  // Update active button
  document.querySelectorAll('.pillar-select-btn').forEach(btn => 
    btn.classList.remove('active'));
  document.querySelector(`[data-assess="${pillarKey}"]`).classList.add('active');
  
  // Update pillar info
  const pillarData = pillarMappings[pillarKey];
  document.getElementById('assess-pillar-name').textContent = pillarData.name;
  document.getElementById('assess-pillar-description').textContent = pillarData.description;
  
  // Update stages
  const stagesContainer = document.querySelector('.stages');
  stagesContainer.innerHTML = '';
  pillarData.stages.forEach((stage, index) => {
    const stageElement = document.createElement('span');
    stageElement.className = `stage ${index === 0 ? 'active' : ''}`;
    stageElement.textContent = stage;
    stagesContainer.appendChild(stageElement);
  });
  
  currentAssessment.pillar = pillarKey;
}

function resetAssessment() {
  currentAssessment.questionIndex = 0;
  currentAssessment.answers = [];
  currentAssessment.isActive = true;
  
  updateAssessmentDisplay();
}

function updateAssessmentDisplay() {
  const pillarData = pillarMappings[currentAssessment.pillar];
  const questions = pillarData.assessmentQuestions;
  const currentQuestion = questions[currentAssessment.questionIndex];
  
  // Update progress
  const progressFill = document.querySelector('.assessment-form .progress-fill');
  const progressText = document.querySelector('.progress-text');
  const progress = ((currentAssessment.questionIndex + 1) / questions.length) * 100;
  
  progressFill.style.width = `${progress}%`;
  progressText.textContent = `Question ${currentAssessment.questionIndex + 1} of ${questions.length}`;
  
  // Update question
  document.querySelector('.question-text').textContent = currentQuestion;
  
  // Clear previous answers
  document.querySelectorAll('input[name="current-question"]').forEach(input => {
    input.checked = false;
  });
  
  // Update button states
  document.getElementById('prev-question').disabled = currentAssessment.questionIndex === 0;
  
  const isLastQuestion = currentAssessment.questionIndex === questions.length - 1;
  const nextButton = document.getElementById('next-question');
  nextButton.textContent = isLastQuestion ? 'Complete Assessment' : 'Next';
}

function handleNextQuestion() {
  const selectedAnswer = document.querySelector('input[name="current-question"]:checked');
  
  if (!selectedAnswer) {
    alert('Please select an answer before continuing.');
    return;
  }
  
  currentAssessment.answers[currentAssessment.questionIndex] = parseInt(selectedAnswer.value);
  
  const pillarData = pillarMappings[currentAssessment.pillar];
  const isLastQuestion = currentAssessment.questionIndex === pillarData.assessmentQuestions.length - 1;
  
  if (isLastQuestion) {
    completeAssessment();
  } else {
    currentAssessment.questionIndex++;
    updateAssessmentDisplay();
  }
}

function handlePreviousQuestion() {
  if (currentAssessment.questionIndex > 0) {
    currentAssessment.questionIndex--;
    updateAssessmentDisplay();
    
    // Restore previous answer
    const previousAnswer = currentAssessment.answers[currentAssessment.questionIndex];
    if (previousAnswer) {
      document.querySelector(`input[name="current-question"][value="${previousAnswer}"]`).checked = true;
    }
  }
}

function completeAssessment() {
  const totalScore = currentAssessment.answers.reduce((sum, answer) => sum + answer, 0);
  const maxScore = currentAssessment.answers.length * 5;
  const percentage = Math.round((totalScore / maxScore) * 100);
  
  // Save score
  assessmentScores[currentAssessment.pillar] = percentage;
  saveAssessmentData();
  
  // Determine stage
  const pillarData = pillarMappings[currentAssessment.pillar];
  let stageIndex = 0;
  if (percentage >= 75) stageIndex = 3;
  else if (percentage >= 50) stageIndex = 2;
  else if (percentage >= 25) stageIndex = 1;
  
  const currentStage = pillarData.stages[stageIndex];
  
  // Show results
  document.querySelector('.assessment-form').style.display = 'none';
  const resultsSection = document.querySelector('.assessment-results');
  resultsSection.classList.remove('hidden');
  
  document.querySelector('.score-value').textContent = `${percentage}/100`;
  document.querySelector('.stage-value').textContent = currentStage;
  
  // Update score color
  const scoreElement = document.querySelector('.score-value');
  scoreElement.className = percentage >= 61 ? 'score-value high' : 
                          percentage >= 31 ? 'score-value medium' : 'score-value low';
  
  // Generate recommendations
  generateRecommendations(currentAssessment.pillar, percentage, stageIndex);
  
  // Update all views
  updateAllViews();
}

function generateRecommendations(pillarKey, score, stageIndex) {
  const recommendations = [];
  const pillarData = pillarMappings[pillarKey];
  
  if (score < 30) {
    recommendations.push(`Focus on foundational understanding of ${pillarData.name}`);
    recommendations.push('Start with basic daily practices and habits');
    recommendations.push('Seek learning resources and mentorship');
  } else if (score < 60) {
    recommendations.push(`Continue building competency in ${pillarData.name}`);
    recommendations.push('Practice consistently and track progress');
    recommendations.push('Connect with others for accountability');
  } else if (score < 80) {
    recommendations.push(`Optimize your approach to ${pillarData.name}`);
    recommendations.push('Focus on integration with other pillars');
    recommendations.push('Begin teaching or mentoring others');
  } else {
    recommendations.push(`Maintain mastery in ${pillarData.name}`);
    recommendations.push('Share your wisdom with the community');
    recommendations.push('Explore advanced applications and innovations');
  }
  
  const recommendationList = document.querySelector('.recommendation-list');
  recommendationList.innerHTML = '';
  recommendations.forEach(rec => {
    const li = document.createElement('li');
    li.textContent = rec;
    recommendationList.appendChild(li);
  });
}

// Progress tracking
function initializeProgress() {
  createPillarProgressCards();
  setTimeout(() => {
    if (document.getElementById('progress-view').classList.contains('active')) {
      updateRadarChart();
    }
  }, 100);
}

function createPillarProgressCards() {
  const pillarGrid = document.querySelector('.pillar-grid');
  pillarGrid.innerHTML = '';
  
  // Add center pillar
  const centerPillarCard = createProgressCard('swadharma', frameworkData.framework.centerPillar);
  pillarGrid.appendChild(centerPillarCard);
  
  // Add surrounding pillars
  frameworkData.framework.surroundingPillars.forEach((pillar, index) => {
    const pillarKey = Object.keys(pillarMappings).find(key => 
      pillarMappings[key] === pillar
    );
    const card = createProgressCard(pillarKey, pillar);
    pillarGrid.appendChild(card);
  });
}

function createProgressCard(pillarKey, pillarData) {
  const card = document.createElement('div');
  card.className = 'pillar-progress-card';
  
  const score = assessmentScores[pillarKey] || 0;
  const colorClass = score >= 61 ? 'high' : score >= 31 ? 'medium' : 'low';
  
  card.innerHTML = `
    <h4>${pillarData.name}</h4>
    <div class="progress-bar-horizontal">
      <div class="progress-fill ${colorClass}" style="width: ${score}%"></div>
    </div>
    <span class="progress-score">${score}% Complete</span>
  `;
  
  return card;
}

function updateRadarChart() {
  const ctx = document.getElementById('radarChart');
  if (!ctx) return;
  
  const scores = [
    assessmentScores.swadharma || 0,
    assessmentScores.operating || 0,
    assessmentScores.technical || 0,
    assessmentScores.social || 0,
    assessmentScores.financial || 0,
    assessmentScores.hospitality || 0,
    assessmentScores.branding || 0
  ];
  
  const labels = [
    'Swadharma',
    'Operating Skills',
    'Technical Ability', 
    'Social Network',
    'Financial Model',
    'Social Hospitality',
    'Personal Brand'
  ];
  
  if (radarChart) {
    radarChart.destroy();
  }
  
  radarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Current Level',
        data: scores,
        fill: true,
        backgroundColor: 'rgba(31, 184, 205, 0.2)',
        borderColor: '#1FB8CD',
        pointBackgroundColor: '#1FB8CD',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#1FB8CD'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        r: {
          angleLines: {
            display: true
          },
          suggestedMin: 0,
          suggestedMax: 100
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

// Integration matrix
function initializeIntegration() {
  createIntegrationMatrix();
}

function createIntegrationMatrix() {
  const matrixContainer = document.querySelector('.integration-matrix');
  const pillars = ['Swadharma', 'Operating', 'Technical', 'Social', 'Financial', 'Hospitality', 'Branding'];
  
  // Create matrix rows
  pillars.forEach((rowPillar, rowIndex) => {
    const row = document.createElement('div');
    row.className = 'matrix-row';
    
    // Row header
    const rowHeader = document.createElement('div');
    rowHeader.className = 'matrix-cell pillar-header';
    rowHeader.textContent = rowPillar;
    row.appendChild(rowHeader);
    
    // Matrix cells
    pillars.forEach((colPillar, colIndex) => {
      const cell = document.createElement('div');
      cell.className = 'matrix-intersection';
      
      if (rowIndex === colIndex) {
        cell.style.background = 'var(--color-border)';
        cell.style.cursor = 'default';
      } else {
        const synergy = findSynergy(rowPillar, colPillar);
        if (synergy) {
          cell.classList.add('has-synergy');
          cell.addEventListener('click', () => showSynergy(rowPillar, colPillar, synergy));
        }
      }
      
      row.appendChild(cell);
    });
    
    matrixContainer.appendChild(row);
  });
}

function findSynergy(pillar1, pillar2) {
  return frameworkData.integrationSynergies.find(synergy => 
    (synergy.pillar1.includes(pillar1.split(' ')[0]) && synergy.pillar2.includes(pillar2.split(' ')[0])) ||
    (synergy.pillar2.includes(pillar1.split(' ')[0]) && synergy.pillar1.includes(pillar2.split(' ')[0]))
  );
}

function showSynergy(pillar1, pillar2, synergy) {
  document.querySelector('.synergy-title').textContent = `${pillar1} × ${pillar2}`;
  document.querySelector('.synergy-description').textContent = synergy.synergy;
}

// Planning functionality
function initializePlanning() {
  generateDevelopmentPriorities();
}

function generateDevelopmentPriorities() {
  const priorityList = document.querySelector('.priority-list');
  priorityList.innerHTML = '';
  
  // Find lowest scoring pillars for priority recommendations
  const sortedPillars = Object.entries(assessmentScores)
    .sort(([,a], [,b]) => a - b)
    .slice(0, 3);
  
  if (sortedPillars.every(([,score]) => score === 0)) {
    // No assessments completed yet
    const defaultPriority = document.createElement('div');
    defaultPriority.className = 'priority-item';
    defaultPriority.innerHTML = `
      <span class="priority-pillar">Assessment</span>
      <span class="priority-action">Complete baseline assessments for all pillars</span>
      <span class="priority-timeline">This week</span>
    `;
    priorityList.appendChild(defaultPriority);
  } else {
    sortedPillars.forEach(([pillarKey, score]) => {
      const pillarData = pillarMappings[pillarKey];
      const priority = document.createElement('div');
      priority.className = 'priority-item';
      
      let action = 'Focus on foundational development';
      let timeline = 'Next 30 days';
      
      if (score < 30) {
        action = 'Begin foundational learning and practice';
        timeline = 'This month';
      } else if (score < 60) {
        action = 'Build consistent daily practices';
        timeline = 'Next 60 days';
      } else {
        action = 'Optimize and integrate with other pillars';
        timeline = 'Next 90 days';
      }
      
      priority.innerHTML = `
        <span class="priority-pillar">${pillarData.name}</span>
        <span class="priority-action">${action}</span>
        <span class="priority-timeline">${timeline}</span>
      `;
      
      priorityList.appendChild(priority);
    });
  }
}

// Modal functionality
function initializeModals() {
  const modal = document.getElementById('pillar-modal');
  const closeButton = document.querySelector('.modal-close');
  const overlay = document.querySelector('.modal-overlay');
  
  closeButton.addEventListener('click', closePillarModal);
  overlay.addEventListener('click', closePillarModal);
  
  // Assessment button
  document.querySelector('.start-assessment-btn').addEventListener('click', () => {
    closePillarModal();
    // Switch to assessment view
    document.querySelector('[data-view="assessment"]').click();
    // Select the current pillar
    const pillarKey = modal.currentPillar;
    selectPillarForAssessment(pillarKey);
    resetAssessment();
  });
  
  // Progress button
  document.querySelector('.view-progress-btn').addEventListener('click', () => {
    closePillarModal();
    document.querySelector('[data-view="progress"]').click();
  });
}

function showPillarModal(pillarKey) {
  const modal = document.getElementById('pillar-modal');
  const pillarData = pillarMappings[pillarKey];
  
  modal.currentPillar = pillarKey;
  
  // Update modal content
  document.querySelector('.modal-title').textContent = pillarData.name;
  document.querySelector('.pillar-desc-text').textContent = pillarData.description;
  
  // Update stages
  const stagesList = document.querySelector('.stages-list');
  stagesList.innerHTML = '';
  
  const currentScore = assessmentScores[pillarKey] || 0;
  let currentStageIndex = 0;
  if (currentScore >= 75) currentStageIndex = 3;
  else if (currentScore >= 50) currentStageIndex = 2;
  else if (currentScore >= 25) currentStageIndex = 1;
  
  pillarData.stages.forEach((stage, index) => {
    const stageItem = document.createElement('div');
    stageItem.className = `stage-item ${index === currentStageIndex ? 'current' : ''}`;
    stageItem.innerHTML = `
      <div class="stage-name">${stage}</div>
      <div class="stage-description">${index <= currentStageIndex ? 'Current Stage' : 'Future Stage'}</div>
    `;
    stagesList.appendChild(stageItem);
  });
  
  modal.classList.remove('hidden');
}

function closePillarModal() {
  document.getElementById('pillar-modal').classList.add('hidden');
}

// Data persistence
function saveAssessmentData() {
  // Note: Using in-memory storage as requested, not localStorage
  // In a real application, this would save to a backend or localStorage
  console.log('Assessment data saved:', assessmentScores);
}

function loadAssessmentData() {
  // Load from stored data (in real app would be from localStorage or backend)
  // For demo purposes, we start with empty scores
  console.log('Assessment data loaded:', assessmentScores);
}

// Update all views with current data
function updateAllViews() {
  updateDashboardScores();
  updateOverallProgress();
  updateProgressCards();
  generateDevelopmentPriorities();
}

function updateDashboardScores() {
  // Update pillar scores on dashboard
  Object.entries(assessmentScores).forEach(([pillarKey, score]) => {
    const pillarElement = document.querySelector(`[data-pillar="${pillarKey}"] .pillar-score`);
    if (pillarElement) {
      pillarElement.textContent = `${score}%`;
      
      // Update color class
      pillarElement.className = 'pillar-score';
      if (score >= 61) pillarElement.classList.add('high');
      else if (score >= 31) pillarElement.classList.add('medium');
      else if (score > 0) pillarElement.classList.add('low');
    }
  });
}

function updateOverallProgress() {
  const scores = Object.values(assessmentScores);
  const completedAssessments = scores.filter(score => score > 0).length;
  const averageScore = completedAssessments > 0 ? 
    scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
  
  const progressPercentage = document.querySelector('.progress-percentage');
  const progressCircle = document.querySelector('.progress-circle');
  
  progressPercentage.textContent = `${Math.round(averageScore)}%`;
  
  // Update circle progress
  const progressDegrees = (averageScore / 100) * 360;
  progressCircle.style.background = `conic-gradient(var(--color-primary) ${progressDegrees}deg, var(--color-secondary) ${progressDegrees}deg)`;
}

function updateProgressCards() {
  createPillarProgressCards();
  
  // Update radar chart if progress view is active
  if (document.getElementById('progress-view').classList.contains('active')) {
    setTimeout(updateRadarChart, 100);
  }
}

// Utility functions
function getScoreColorClass(score) {
  if (score >= 61) return 'high';
  if (score >= 31) return 'medium';
  if (score > 0) return 'low';
  return '';
}