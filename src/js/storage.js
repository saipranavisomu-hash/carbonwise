const Storage = {
    KEYS: {
        USER_DATA: 'cw_user_data',
        LOGS: 'cw_logs',
        CHALLENGES: 'cw_challenges',
        GOALS: 'cw_goals',
        THEME: 'cw_theme'
    },

    save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    get(key, defaultValue = null) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    },

    getUserData() {
        return this.get(this.KEYS.USER_DATA, {
            points: 0,
            level: 1,
            streak: 0,
            lastLogDate: null,
            totalLogs: 0,
            badges: []
        });
    },

    saveUserData(data) {
        this.save(this.KEYS.USER_DATA, data);
    },

    addLog(log) {
        const logs = this.getLogs();
        logs.push({
            ...log,
            id: Date.now(),
            date: new Date().toISOString()
        });
        this.save(this.KEYS.LOGS, logs);
    },

    getLogs() {
        return this.get(this.KEYS.LOGS, []);
    },

    getGoals() {
        return this.get(this.KEYS.GOALS, {
            monthlyTarget: 500, // kg CO2
            completedPercent: 0
        });
    },

    saveGoals(goals) {
        this.save(this.KEYS.GOALS, goals);
    },

    updateChallenges(challenges) {
        this.save(this.KEYS.CHALLENGES, challenges);
    },

    getChallenges() {
        return this.get(this.KEYS.CHALLENGES, []);
    }
};
