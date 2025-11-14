const { createApp } = Vue;

createApp({
  data() {
    return {
      // Framework data
      frameworkData: {
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
      },

      // Application state
      activeView: 'dashboard',
      assessmentScores: {
        swadharma: 0,
        operating: 0,
        technical: 0,
        social: 0,
        financial: 0,
        hospitality: 0,
        branding: 0
      },

      currentAssessment: {
        pillar: 'swadharma',
        questionIndex: 0,
        answers: [],
        isActive: false
      },

      currentAnswer: null,

      assessmentResults: {
        show: false,
        percentage: 0,
        stage: '',
        recommendations: []
      },

      modal: {
        show: false,
        pillar: null,
        currentPillarKey: null,
        currentStageIndex: 0
      },

      selectedSynergy: {
        title: 'Select a connection to learn more',
        description: 'Integration opportunities will appear here.'
      },

      // Chart.js radar chart instance
      radarChart: null,

      // Navigation views
      navigationViews: [
        { key: 'dashboard', name: 'Dashboard' },
        { key: 'assessment', name: 'Assessment' },
        { key: 'progress', name: 'Progress' },
        { key: 'integration', name: 'Integration' },
        { key: 'planning', name: 'Planning' }
      ],

      // Development phases
      developmentPhases: [
        {
          name: 'Foundation',
          duration: 'Months 1-6',
          description: 'Self-discovery and baseline establishment'
        },
        {
          name: 'Development',
          duration: 'Months 7-18',
          description: 'Skill building and system creation'
        },
        {
          name: 'Integration',
          duration: 'Months 19-36',
          description: 'Cross-dimensional optimization'
        },
        {
          name: 'Mastery',
          duration: 'Years 4-7',
          description: 'Leadership development'
        },
        {
          name: 'Legacy',
          duration: 'Years 8+',
          description: 'Wisdom sharing and impact'
        }
      ],

      // Rating options for assessments
      ratingOptions: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ],

      // Timeline items for progress view
      timelineItems: [
        {
          title: 'Foundation Phase',
          description: 'Self-discovery completed',
          status: 'completed'
        },
        {
          title: 'Development Phase',
          description: 'Building core competencies',
          status: 'current'
        },
        {
          title: 'Integration Phase',
          description: 'Upcoming milestone',
          status: ''
        }
      ],

      // Matrix pillars for integration view
      matrixPillars: ['Swadharma', 'Operating', 'Technical', 'Social', 'Financial', 'Hospitality', 'Branding'],

      // Goal periods for planning
      goalPeriods: [
        {
          days: '30',
          goals: [
            'Complete baseline assessments for all pillars',
            'Establish daily reflection practice'
          ]
        },
        {
          days: '60',
          goals: [
            'Develop personal operating systems',
            'Begin skill development programs'
          ]
        },
        {
          days: '90',
          goals: [
            'Establish integrated daily practices',
            'Create accountability partnerships'
          ]
        }
      ],

      // Resource categories
      resourceCategories: [
        {
          title: 'Books & Reading',
          resources: [
            { title: 'The 7 Habits of Highly Effective People', link: '#', type: 'Book', description: 'Personal effectiveness principles' },
            { title: 'Atomic Habits by James Clear', link: '#', type: 'Book', description: 'Building better habits' },
            { title: 'The Purpose Driven Life', link: '#', type: 'Book', description: 'Finding life purpose' }
          ]
        },
        {
          title: 'Tools & Templates',
          resources: [
            { title: 'Personal Mission Statement Template', link: '#', type: 'Template', description: 'Define your purpose' },
            { title: 'Goal Setting Worksheet', link: '#', type: 'Worksheet', description: 'SMART goal planning' },
            { title: 'Weekly Review Template', link: '#', type: 'Template', description: 'Progress tracking' }
          ]
        },
        {
          title: 'Communities & Networks',
          resources: [
            { title: 'Personal Development Groups', link: '#', type: 'Community', description: 'Local meetups' },
            { title: 'Professional Networking Events', link: '#', type: 'Events', description: 'Industry connections' },
            { title: 'Mentorship Programs', link: '#', type: 'Program', description: 'Guided development' }
          ]
        }
      ],

      // Planning specific data
      activeResourceFilter: 'Books & Reading',
      immediateActions: [
        {
          id: 1,
          title: 'Complete Self-Assessment',
          description: 'Take the Swadharma assessment to understand your core purpose',
          pillar: 'Swadharma',
          estimatedTime: '15 min',
          completed: false
        },
        {
          id: 2,
          title: 'Set Up Daily Reflection',
          description: 'Establish a 5-minute daily reflection practice',
          pillar: 'Operating Skills',
          estimatedTime: '10 min',
          completed: false
        },
        {
          id: 3,
          title: 'Network Audit',
          description: 'List your current professional connections and identify gaps',
          pillar: 'Social Network',
          estimatedTime: '30 min',
          completed: false
        }
      ]
    }
  },

  computed: {
    // Pillar mappings
    pillarMappings() {
      return {
        swadharma: this.frameworkData.framework.centerPillar,
        operating: this.frameworkData.framework.surroundingPillars[0],
        technical: this.frameworkData.framework.surroundingPillars[1],
        social: this.frameworkData.framework.surroundingPillars[2],
        financial: this.frameworkData.framework.surroundingPillars[3],
        hospitality: this.frameworkData.framework.surroundingPillars[4],
        branding: this.frameworkData.framework.surroundingPillars[5]
      }
    },

    // Current pillar data
    currentPillarData() {
      return this.pillarMappings[this.currentAssessment.pillar];
    },

    // Current question
    currentQuestion() {
      return this.currentPillarData.assessmentQuestions[this.currentAssessment.questionIndex];
    },

    // Assessment progress percentage
    assessmentProgress() {
      return ((this.currentAssessment.questionIndex + 1) / this.currentPillarData.assessmentQuestions.length) * 100;
    },

    // Check if it's the last question
    isLastQuestion() {
      return this.currentAssessment.questionIndex === this.currentPillarData.assessmentQuestions.length - 1;
    },

    // Overall progress
    overallProgress() {
      const scores = Object.values(this.assessmentScores);
      const completedAssessments = scores.filter(score => score > 0).length;
      return completedAssessments > 0 ? 
        Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
    },

    // Progress circle style
    progressCircleStyle() {
      const progressDegrees = (this.overallProgress / 100) * 360;
      return {
        background: `conic-gradient(var(--color-primary) ${progressDegrees}deg, var(--color-secondary) ${progressDegrees}deg)`
      };
    },

    // Development priorities
    developmentPriorities() {
      // Find lowest scoring pillars for priority recommendations
      const sortedPillars = Object.entries(this.assessmentScores)
        .sort(([,a], [,b]) => a - b)
        .slice(0, 3);
      
      if (sortedPillars.every(([,score]) => score === 0)) {
        // No assessments completed yet
        return [{
          pillar: 'Assessment',
          action: 'Complete baseline assessments for all pillars',
          timeline: 'This week'
        }];
      } else {
        return sortedPillars.map(([pillarKey, score]) => {
          const pillarData = this.pillarMappings[pillarKey];
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
          
          return {
            pillar: pillarData.name,
            action: action,
            timeline: timeline,
            score: score
          };
        });
      }
    },

    // Additional computed properties
    completedAssessments() {
      return Object.values(this.assessmentScores).filter(score => score > 0).length;
    },

    totalPillars() {
      return Object.keys(this.assessmentScores).length;
    },

    highPerformingPillars() {
      return Object.values(this.assessmentScores).filter(score => score >= 61).length;
    },

    mediumPerformingPillars() {
      return Object.values(this.assessmentScores).filter(score => score >= 31 && score < 61).length;
    },

    lowPerformingPillars() {
      return Object.values(this.assessmentScores).filter(score => score > 0 && score < 31).length;
    },

    topIntegrationOpportunities() {
      const opportunities = [];
      this.frameworkData.integrationSynergies.forEach(synergy => {
        const pillar1Score = this.getPillarScoreByName(synergy.pillar1);
        const pillar2Score = this.getPillarScoreByName(synergy.pillar2);
        
        if (pillar1Score > 0 && pillar2Score > 0) {
          const avgScore = (pillar1Score + pillar2Score) / 2;
          const potential = 100 - avgScore;
          
          opportunities.push({
            title: `${this.getShortPillarName(synergy.pillar1)} × ${this.getShortPillarName(synergy.pillar2)}`,
            description: synergy.synergy,
            strength: potential > 50 ? 'High' : potential > 25 ? 'Medium' : 'Low',
            strengthClass: potential > 50 ? 'high' : potential > 25 ? 'medium' : 'low',
            potential: potential,
            synergy: synergy
          });
        }
      });
      
      return opportunities.sort((a, b) => b.potential - a.potential).slice(0, 3);
    },

    personalizedGoals() {
      const goals = [];
      const completedCount = this.completedAssessments;
      
      if (completedCount === 0) {
        goals.push({
          days: '30',
          goals: [
            { text: 'Complete baseline assessments for all pillars', completed: false },
            { text: 'Establish daily reflection practice', completed: false, pillar: 'Swadharma' }
          ]
        });
      } else {
        // Personalized based on scores
        const weakPillars = Object.entries(this.assessmentScores)
          .filter(([key, score]) => score > 0 && score < 50)
          .slice(0, 2);
        
        goals.push({
          days: '30',
          goals: weakPillars.map(([key, score]) => ({
            text: `Improve ${this.pillarMappings[key].name} foundation`,
            completed: false,
            pillar: this.pillarMappings[key].name
          }))
        });
      }
      
      return goals;
    },

    filteredResourceCategories() {
      if (this.activeResourceFilter === 'All') {
        return this.resourceCategories;
      }
      return this.resourceCategories.filter(cat => cat.title === this.activeResourceFilter);
    }
  },

  methods: {
    // Navigation
    setActiveView(view) {
      console.log('Setting active view to:', view);
      this.activeView = view;
      
      // Special handling for progress view to update charts
      if (view === 'progress') {
        this.$nextTick(() => {
          this.updateRadarChart();
        });
      }
    },

    // Get pillar key by index
    getPillarKey(index) {
      const keys = ['operating', 'technical', 'social', 'financial', 'hospitality', 'branding'];
      return keys[index];
    },

    // Get score color class
    getScoreColorClass(score) {
      if (score >= 61) return 'high';
      if (score >= 31) return 'medium';
      if (score > 0) return 'low';
      return '';
    },

    // Assessment methods
    selectPillarForAssessment(pillarKey) {
      this.currentAssessment.pillar = pillarKey;
      this.resetAssessment();
    },

    resetAssessment() {
      this.currentAssessment.questionIndex = 0;
      this.currentAssessment.answers = [];
      this.currentAssessment.isActive = true;
      this.currentAnswer = null;
      this.assessmentResults.show = false;
    },

    handleNextQuestion() {
      if (!this.currentAnswer) {
        alert('Please select an answer before continuing.');
        return;
      }
      
      this.currentAssessment.answers[this.currentAssessment.questionIndex] = parseInt(this.currentAnswer);
      
      if (this.isLastQuestion) {
        this.completeAssessment();
      } else {
        this.currentAssessment.questionIndex++;
        this.currentAnswer = this.currentAssessment.answers[this.currentAssessment.questionIndex] || null;
      }
    },

    handlePreviousQuestion() {
      if (this.currentAssessment.questionIndex > 0) {
        this.currentAssessment.questionIndex--;
        this.currentAnswer = this.currentAssessment.answers[this.currentAssessment.questionIndex] || null;
      }
    },

    completeAssessment() {
      const totalScore = this.currentAssessment.answers.reduce((sum, answer) => sum + answer, 0);
      const maxScore = this.currentAssessment.answers.length * 5;
      const percentage = Math.round((totalScore / maxScore) * 100);
      
      // Save score
      this.assessmentScores[this.currentAssessment.pillar] = percentage;
      
      // Determine stage
      const pillarData = this.pillarMappings[this.currentAssessment.pillar];
      let stageIndex = 0;
      if (percentage >= 75) stageIndex = 3;
      else if (percentage >= 50) stageIndex = 2;
      else if (percentage >= 25) stageIndex = 1;
      
      const currentStage = pillarData.stages[stageIndex];
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(this.currentAssessment.pillar, percentage);
      
      // Show results
      this.assessmentResults = {
        show: true,
        percentage: percentage,
        stage: currentStage,
        recommendations: recommendations
      };
      
      // Save data
      this.saveAssessmentData();
    },

    generateRecommendations(pillarKey, score) {
      const recommendations = [];
      const pillarData = this.pillarMappings[pillarKey];
      
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
      
      return recommendations;
    },

    startNewAssessment() {
      // Switch to assessment view first
      this.setActiveView('assessment');
      
      // Find an incomplete pillar (one with score 0 or lowest score)
      const incompletePillars = Object.entries(this.assessmentScores)
        .filter(([pillarKey, score]) => score === 0);
      
      let targetPillar = 'swadharma'; // default
      
      if (incompletePillars.length > 0) {
        // Select first incomplete pillar
        targetPillar = incompletePillars[0][0];
      } else {
        // If all pillars are complete, select the one with lowest score
        const sortedPillars = Object.entries(this.assessmentScores)
          .sort(([,a], [,b]) => a - b);
        targetPillar = sortedPillars[0][0];
      }
      
      // Select the target pillar
      this.selectPillarForAssessment(targetPillar);
    },

    // Modal methods
    showPillarModal(pillarKey) {
      const pillarData = this.pillarMappings[pillarKey];
      
      const currentScore = this.assessmentScores[pillarKey] || 0;
      let currentStageIndex = 0;
      if (currentScore >= 75) currentStageIndex = 3;
      else if (currentScore >= 50) currentStageIndex = 2;
      else if (currentScore >= 25) currentStageIndex = 1;
      
      this.modal = {
        show: true,
        pillar: pillarData,
        currentPillarKey: pillarKey,
        currentStageIndex: currentStageIndex
      };
    },

    closePillarModal() {
      this.modal.show = false;
    },

    startAssessmentFromModal() {
      this.closePillarModal();
      this.setActiveView('assessment');
      this.selectPillarForAssessment(this.modal.currentPillarKey);
    },

    viewProgressFromModal() {
      this.closePillarModal();
      this.setActiveView('progress');
    },

    // Integration matrix methods
    findSynergy(pillar1, pillar2) {
      return this.frameworkData.integrationSynergies.find(synergy => 
        (synergy.pillar1.includes(pillar1.split(' ')[0]) && synergy.pillar2.includes(pillar2.split(' ')[0])) ||
        (synergy.pillar2.includes(pillar1.split(' ')[0]) && synergy.pillar1.includes(pillar2.split(' ')[0]))
      );
    },

    showSynergy(pillar1, pillar2) {
      if (pillar1 === pillar2) return;
      
      const synergy = this.findSynergy(pillar1, pillar2);
      if (synergy) {
        this.selectedSynergy = {
          title: `${pillar1} × ${pillar2}`,
          description: synergy.synergy
        };
      }
    },

    // Chart methods
    updateRadarChart() {
      const canvas = this.$refs.radarChart;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      
      const scores = [
        this.assessmentScores.swadharma || 0,
        this.assessmentScores.operating || 0,
        this.assessmentScores.technical || 0,
        this.assessmentScores.social || 0,
        this.assessmentScores.financial || 0,
        this.assessmentScores.hospitality || 0,
        this.assessmentScores.branding || 0
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
      
      if (this.radarChart) {
        this.radarChart.destroy();
      }
      
      this.radarChart = new Chart(ctx, {
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
    },

    // Assessment helper methods
    getPillarDisplayName(name) {
      if (name.includes('Personal Brand')) return 'Personal Brand';
      if (name.includes('&')) return name.split(' & ')[0];
      return name.split(' ')[0];
    },

    getCurrentStageIndex() {
      const currentScore = this.assessmentScores[this.currentAssessment.pillar] || 0;
      if (currentScore >= 75) return 3;
      if (currentScore >= 50) return 2;
      if (currentScore >= 25) return 1;
      return 0;
    },

    // Progress helper methods
    getTimelineStatus(index) {
      if (this.completedAssessments === 0) return index === 0 ? 'current' : '';
      if (this.overallProgress >= 80) return index <= 4 ? 'completed' : '';
      if (this.overallProgress >= 60) return index <= 3 ? 'completed' : index === 4 ? 'current' : '';
      if (this.overallProgress >= 40) return index <= 2 ? 'completed' : index === 3 ? 'current' : '';
      if (this.overallProgress >= 20) return index <= 1 ? 'completed' : index === 2 ? 'current' : '';
      return index === 0 ? 'completed' : index === 1 ? 'current' : '';
    },

    getPillarStage(pillarKey) {
      const score = this.assessmentScores[pillarKey];
      const stages = this.pillarMappings[pillarKey].stages;
      if (score >= 75) return stages[3];
      if (score >= 50) return stages[2];
      if (score >= 25) return stages[1];
      return stages[0];
    },

    // Integration helper methods
    getMatrixCellClass(rowIndex, colIndex, rowPillar, colPillar) {
      const classes = ['matrix-intersection'];
      if (rowIndex !== colIndex && this.findSynergy(rowPillar, colPillar)) {
        classes.push('has-synergy');
      }
      return classes.join(' ');
    },

    getMatrixCellStyle(rowIndex, colIndex) {
      if (rowIndex === colIndex) {
        return { background: 'var(--color-border)', cursor: 'default' };
      }
      return {};
    },

    getMatrixCellTooltip(rowIndex, colIndex, rowPillar, colPillar) {
      if (rowIndex === colIndex) return '';
      const synergy = this.findSynergy(rowPillar, colPillar);
      return synergy ? 'Click to view synergy' : 'No direct synergy identified';
    },

    selectSynergyFromCard(opportunity) {
      this.selectedSynergy = {
        title: opportunity.title,
        description: opportunity.description,
        active: true,
        actionItems: this.generateSynergyActions(opportunity.synergy)
      };
    },

    selectSynergyFromList(synergy) {
      this.selectedSynergy = {
        title: `${this.getShortPillarName(synergy.pillar1)} × ${this.getShortPillarName(synergy.pillar2)}`,
        description: synergy.synergy,
        active: true,
        actionItems: this.generateSynergyActions(synergy)
      };
    },

    getShortPillarName(pillarName) {
      const shortNames = {
        'Swadharma': 'Swadharma',
        'Operating & Organization Skills': 'Operating',
        'Technical Physical & Mind Ability': 'Technical',
        'Social Leverage Network': 'Social',
        'Financial Model': 'Financial',
        'Social Hospitality': 'Hospitality',
        'Personal Brand Marketing': 'Branding'
      };
      return shortNames[pillarName] || pillarName.split(' ')[0];
    },

    getPillarScoreByName(pillarName) {
      const mapping = {
        'Swadharma': 'swadharma',
        'Operating & Organization Skills': 'operating',
        'Technical Physical & Mind Ability': 'technical',
        'Social Leverage Network': 'social',
        'Financial Model': 'financial',
        'Social Hospitality': 'hospitality',
        'Personal Brand Marketing': 'branding'
      };
      const key = mapping[pillarName];
      return key ? this.assessmentScores[key] : 0;
    },

    generateSynergyActions(synergy) {
      // Generate context-specific action items
      return [
        'Identify overlapping skills and opportunities',
        'Create integrated daily practices',
        'Set combined development goals',
        'Track synergistic progress metrics'
      ];
    },

    // Planning helper methods
    getStrongestPillar() {
      const max = Math.max(...Object.values(this.assessmentScores));
      const key = Object.keys(this.assessmentScores).find(k => this.assessmentScores[k] === max);
      return {
        name: this.pillarMappings[key].name,
        score: max
      };
    },

    getWeakestPillar() {
      const nonZeroScores = Object.entries(this.assessmentScores).filter(([k, v]) => v > 0);
      if (nonZeroScores.length === 0) {
        return { name: 'Complete an assessment', score: 0 };
      }
      const min = Math.min(...nonZeroScores.map(([k, v]) => v));
      const key = nonZeroScores.find(([k, v]) => v === min)[0];
      return {
        name: this.pillarMappings[key].name,
        score: min
      };
    },

    getAverageGrowthPotential() {
      const scores = Object.values(this.assessmentScores).filter(s => s > 0);
      if (scores.length === 0) return 100;
      const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      return Math.round(100 - avg);
    },

    getPeriodProgress(period) {
      const completed = period.goals.filter(g => g.completed).length;
      return Math.round((completed / period.goals.length) * 100);
    },

    setActiveResourceFilter(filter) {
      this.activeResourceFilter = filter;
    },

    // Data persistence
    saveAssessmentData() {
      // In a real application, this would save to a backend or localStorage
      console.log('Assessment data saved:', this.assessmentScores);
    },

    loadAssessmentData() {
      // Load from stored data (in real app would be from localStorage or backend)
      console.log('Assessment data loaded:', this.assessmentScores);
    }
  },

  mounted() {
    // Load saved data
    this.loadAssessmentData();
    
    // Initialize chart if progress view is active
    if (this.activeView === 'progress') {
      this.$nextTick(() => {
        this.updateRadarChart();
      });
    }
  }
}).mount('#app');