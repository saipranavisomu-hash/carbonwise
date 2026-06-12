const Challenges = {
    POOL: [
        { id: 1, title: "Walk instead of driving", description: "Take a 20-minute walk for your next short trip.", points: 50, icon: "footprints" },
        { id: 2, title: "Avoid single-use plastic", description: "Use a reusable bottle and bag throughout the day.", points: 30, icon: "shopping-bag" },
        { id: 3, title: "Meatless Monday", description: "Eat only vegetarian or vegan meals today.", points: 60, icon: "utensils" },
        { id: 4, title: "Save 10L of water", description: "Take a shorter shower (5 mins max).", points: 20, icon: "droplets" },
        { id: 5, title: "Unplug electronics", description: "Unplug all unused chargers and appliances.", points: 25, icon: "plug" },
        { id: 6, title: "Zero Waste Hero", description: "Do not produce any landfill waste for the next 4 hours.", points: 100, icon: "trash-2" }
    ],

    generateDaily() {
        const existing = Storage.getChallenges();
        if (existing.length > 0) {
            // Check if they are from today
            const lastUpdated = existing[0].updatedAt;
            if (new Date(lastUpdated).toDateString() === new Date().toDateString()) {
                return existing;
            }
        }

        // Pick 3 random challenges
        const shuffled = [...this.POOL].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3).map(c => ({
            ...c,
            completed: false,
            updatedAt: new Date().toISOString()
        }));

        Storage.updateChallenges(selected);
        return selected;
    },

    complete(id) {
        const challenges = Storage.getChallenges();
        const challenge = challenges.find(c => c.id === id);

        if (challenge && !challenge.completed) {
            challenge.completed = true;
            Storage.updateChallenges(challenges);

            // Update user points
            const userData = Storage.getUserData();
            userData.points += challenge.points;

            // Check for level up
            const oldLevel = userData.level;
            userData.level = Math.floor(userData.points / 500) + 1;

            Storage.saveUserData(userData);
            return { success: true, points: challenge.points, leveledUp: userData.level > oldLevel };
        }
        return { success: false };
    },

    getLevelName(level) {
        if (level < 2) return "Eco Beginner";
        if (level < 5) return "Green Explorer";
        if (level < 10) return "Climate Hero";
        return "Planet Guardian";
    }
};
