document.addEventListener('DOMContentLoaded', () => {
    // State
    let currentView = 'dashboard';

    // UI Elements
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    const themeToggle = document.getElementById('theme-toggle');
    const activityForm = document.getElementById('activity-form');
    const downloadBtn = document.getElementById('download-report');

    // Initial Load
    initApp();

    function initApp() {
        setupNavigation();
        setupTheme();
        updateDashboard();
        renderChallenges();
        renderEducation();
        UICharts.init('mainChart');
        UICharts.update(Storage.getLogs());

        // Setup Form
        if (activityForm) {
            activityForm.addEventListener('submit', handleLogSubmit);
        }

        // Setup PDF Download
        if (downloadBtn) {
            downloadBtn.addEventListener('click', generatePDF);
        }
    }

    function setupNavigation() {
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const viewId = item.getAttribute('data-view');
                switchView(viewId);

                navItems.forEach(ni => ni.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    function switchView(viewId) {
        currentView = viewId;
        views.forEach(view => {
            view.classList.add('hidden');
            if (view.id === `${viewId}-view`) {
                view.classList.remove('hidden');
                view.classList.add('animate-fade-in');
            }
        });

        // Update titles
        const titleMap = {
            'dashboard': 'Dashboard Overview',
            'calculator': 'Carbon Calculator',
            'challenges': 'Daily Challenges',
            'goals': 'Impact Goals',
            'education': 'Eco Learning'
        };
        const subtitleMap = {
            'dashboard': "Welcome back! Here's your impact today.",
            'calculator': "Log your activities to see your carbon footprint.",
            'challenges': "Small actions lead to big changes.",
            'goals': "Track your progress towards a greener future.",
            'education': "Knowledge is the first step to sustainability."
        };

        document.getElementById('page-title').textContent = titleMap[viewId];
        document.getElementById('page-subtitle').textContent = subtitleMap[viewId];
    }

    function setupTheme() {
        const savedTheme = Storage.get(Storage.KEYS.THEME, 'light');
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);

        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            Storage.save(Storage.KEYS.THEME, newTheme);
            updateThemeIcon(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        const text = themeToggle.querySelector('span');
        if (theme === 'dark') {
            icon.setAttribute('data-lucide', 'sun');
            text.textContent = 'Light Mode';
        } else {
            icon.setAttribute('data-lucide', 'moon');
            text.textContent = 'Dark Mode';
        }
        lucide.createIcons();
    }

    function handleLogSubmit(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        console.log("Form submitted");

        const data = {
            transportType: document.getElementById('transport-type').value,
            distance: parseFloat(document.getElementById('distance').value) || 0,
            electricity: parseFloat(document.getElementById('electricity').value) || 0,
            dietType: document.getElementById('diet-type').value
        };

        const result = Calculator.calculateDaily(data);
        Storage.addLog(result);

        // Update user streak and points
        updateUserStatsAfterLog();

        // Show result
        displayCalcResult(result);
        updateDashboard();
        UICharts.update(Storage.getLogs());

        // Reset form partially
        document.getElementById('distance').value = '';
        document.getElementById('electricity').value = '';
    }

    function displayCalcResult(result) {
        const resultContainer = document.getElementById('calc-result');
        const insightsContainer = document.getElementById('insights-container');
        const suggestionsList = document.getElementById('suggestions-list');

        resultContainer.innerHTML = `
            <div style="font-size: 3rem; font-weight: 800; color: var(--primary);">${result.total}</div>
            <p>kg CO₂e for this entry</p>
            <div style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-muted);">
                Transport: ${result.breakdown.transport}kg | 
                Energy: ${result.breakdown.electricity}kg | 
                Diet: ${result.breakdown.diet}kg
            </div>
        `;

        // Insights
        insightsContainer.classList.remove('hidden');
        const insights = Calculator.getPersonalizedInsights(result);
        suggestionsList.innerHTML = insights.map(insight => `
            <li class="glass" style="padding: 0.75rem; border-radius: 8px; display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem;">
                <i data-lucide="${insight.icon}" style="color: var(--primary); width: 18px;"></i>
                <span>${insight.text} (Save ${insight.saving})</span>
            </li>
        `).join('');

        lucide.createIcons();
    }

    function updateDashboard() {
        const logs = Storage.getLogs();
        const userData = Storage.getUserData();

        // Calculate stats
        const today = new Date().toDateString();
        const todayLogs = logs.filter(l => new Date(l.date).toDateString() === today);
        const dailyTotal = todayLogs.reduce((acc, curr) => acc + curr.total, 0).toFixed(1);

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weeklyLogs = logs.filter(l => new Date(l.date) >= oneWeekAgo);
        const weeklyTotal = weeklyLogs.reduce((acc, curr) => acc + curr.total, 0).toFixed(1);

        // Update UI
        document.getElementById('daily-co2').textContent = dailyTotal;
        document.getElementById('weekly-co2').textContent = weeklyTotal;
        document.getElementById('trees-eq').textContent = Utils.getTreesEquivalent(weeklyTotal * 4); // Estimated monthly impact

        document.getElementById('user-points').textContent = `${userData.points} Points`;
        document.getElementById('user-level').textContent = Challenges.getLevelName(userData.level);
        document.getElementById('streak-count').textContent = userData.streak;

        // Goals
        const goals = Storage.getGoals();
        const monthlyTotal = logs.filter(l => {
            const d = new Date(l.date);
            return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
        }).reduce((acc, curr) => acc + curr.total, 0);

        const progressPercent = Math.min(Math.round((monthlyTotal / goals.monthlyTarget) * 100), 100);
        const targetValueEl = document.getElementById('target-value');
        const progressPercentEl = document.getElementById('progress-percent');
        const progressBarEl = document.getElementById('goal-progress-bar');

        if (targetValueEl) targetValueEl.textContent = `${goals.monthlyTarget}kg`;
        if (progressPercentEl) progressPercentEl.textContent = `${progressPercent}%`;
        if (progressBarEl) {
            progressBarEl.style.width = `${progressPercent}%`;
            // Change color based on safe limits
            progressBarEl.style.background = progressPercent > 90 ? 'var(--danger)' : 'var(--primary)';
        }
    }

    function renderChallenges() {
        const challengesList = document.getElementById('challenges-list');
        const miniChallengeText = document.getElementById('mini-challenge-text');
        if (!challengesList) return;

        const dailyChallenges = Challenges.generateDaily();
        console.log("Daily challenges:", dailyChallenges);

        if (!dailyChallenges || dailyChallenges.length === 0) {
            challengesList.innerHTML = '<p class="text-muted">No challenges available today. Check back later!</p>';
            return;
        }

        if (miniChallengeText && dailyChallenges.length > 0) {
            const incomplete = dailyChallenges.find(c => !c.completed) || dailyChallenges[0];
            miniChallengeText.textContent = incomplete.title;
        }

        challengesList.innerHTML = dailyChallenges.map(c => `
            <div class="card ${c.completed ? 'opacity-50' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <i data-lucide="${c.icon}" style="color: var(--primary); margin-bottom: 1rem;"></i>
                    <span class="badge-count" style="background: rgba(46, 204, 113, 0.1); color: var(--primary); font-size: 0.7rem;">+${c.points} PTS</span>
                </div>
                <h4>${c.title}</h4>
                <p class="text-muted" style="font-size: 0.85rem; margin: 0.5rem 0;">${c.description}</p>
                <button class="btn ${c.completed ? 'btn-outline' : 'btn-primary'}" 
                        style="width: 100%; margin-top: 1rem;" 
                        onclick="handleCompleteChallenge(${c.id})" 
                        ${c.completed ? 'disabled' : ''}>
                    ${c.completed ? 'Completed' : 'Finish Challenge'}
                </button>
            </div>
        `).join('');

        lucide.createIcons();
    }

    function renderEducation() {
        const factText = document.getElementById('fact-text');
        if (factText) {
            factText.textContent = Utils.getDailyFact();
        }
    }

    function updateUserStatsAfterLog() {
        const userData = Storage.getUserData();
        const today = new Date().toDateString();

        if (userData.lastLogDate !== today) {
            if (userData.lastLogDate) {
                const lastDate = new Date(userData.lastLogDate);
                const diff = (new Date(today) - lastDate) / (1000 * 60 * 60 * 24);
                if (diff === 1) {
                    userData.streak++;
                } else if (diff > 1) {
                    userData.streak = 1;
                }
            } else {
                userData.streak = 1;
            }
            userData.lastLogDate = today;
        }

        userData.points += 10; // 10 points for logging
        userData.totalLogs++;
        Storage.saveUserData(userData);
    }

    // Global handles for dynamic elements
    window.handleCompleteChallenge = (id) => {
        const res = Challenges.complete(id);
        if (res.success) {
            renderChallenges();
            updateDashboard();
            if (res.leveledUp) {
                alert("🎉 Level Up! You're now a " + Challenges.getLevelName(Storage.getUserData().level));
            }
        }
    };

    // Goal update button
    const setGoalBtn = document.getElementById('set-goal-btn');
    if (setGoalBtn) {
        setGoalBtn.addEventListener('click', () => {
            const newTarget = prompt("Enter your monthly CO2 reduction target (kg):", "250");
            if (newTarget && !isNaN(newTarget)) {
                Storage.saveGoals({ monthlyTarget: parseInt(newTarget), completedPercent: 0 });
                updateDashboard();
            }
        });
    }

    function generatePDF() {
        const element = document.getElementById('view-container');
        const opt = {
            margin: 1,
            filename: 'CarbonWise_Report.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Switch to dashboard view before printing to ensure we capture the main stats
        switchView('dashboard');

        // Show loading state
        downloadBtn.innerHTML = '<i data-lucide="loader-2"></i> <span>Generating...</span>';
        lucide.createIcons();

        html2pdf().set(opt).from(element).save().then(() => {
            downloadBtn.innerHTML = '<i data-lucide="download"></i> <span>PDF Report</span>';
            lucide.createIcons();
        });
    }
});
