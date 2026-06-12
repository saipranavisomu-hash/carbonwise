const Utils = {
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },

    getTreesEquivalent(kgCO2) {
        // 1 mature tree absorbs ~22kg CO2 per year, so ~1.8kg per month
        // We'll show how many trees would be needed to offset this much emissions in a year
        return Math.ceil(kgCO2 / 22);
    },

    getDailyFact() {
        const facts = [
            "A single mature tree can absorb about 22kg of CO2 per year.",
            "Recycling one aluminum can saves enough energy to run a TV for 3 hours.",
            "The fashion industry is responsible for 10% of global carbon emissions.",
            "Food waste accounts for about 8% of global greenhouse gas emissions.",
            "Switching to LED bulbs can reduce energy consumption by up to 80%.",
            "Eating a plant-based diet can reduce your food-related carbon footprint by 50%.",
            "Methane is 25 times more potent than CO2 at trapping heat in the atmosphere."
        ];
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        return facts[dayOfYear % facts.length];
    }
};
