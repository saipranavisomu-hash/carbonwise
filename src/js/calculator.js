const Calculator = {
    EMISSION_FACTORS: {
        transport: {
            car: 0.192, // kg/km (avg petrol car)
            ev: 0.053,  // kg/km (avg electric)
            bus: 0.105, // kg/km
            train: 0.041,// kg/km
            flight: 0.255, // kg/km
            bike: 0,
            none: 0
        },
        electricity: 0.475, // kg/kWh (global avg)
        diet: {
            mixed: 7.2,      // kg per day
            vegetarian: 3.8, // kg per day
            vegan: 2.9       // kg per day
        }
    },

    calculateDaily(data) {
        const transportEmissions = (this.EMISSION_FACTORS.transport[data.transportType] || 0) * (data.distance || 0);
        const electricityEmissions = (this.EMISSION_FACTORS.electricity) * (data.electricity || 0);
        const dietEmissions = this.EMISSION_FACTORS.diet[data.dietType] || 7.2;

        const total = transportEmissions + electricityEmissions + dietEmissions;

        return {
            total: parseFloat(total.toFixed(2)),
            breakdown: {
                transport: parseFloat(transportEmissions.toFixed(2)),
                electricity: parseFloat(electricityEmissions.toFixed(2)),
                diet: parseFloat(dietEmissions.toFixed(2))
            }
        };
    },

    getPersonalizedInsights(result) {
        const insights = [];

        if (result.breakdown.transport > 5) {
            insights.push({
                text: "Consider using public transport or walking for short trips to save up to 2kg CO2.",
                icon: "bus",
                saving: "2.0kg"
            });
        }

        if (result.breakdown.diet > 4) {
            insights.push({
                text: "Trying a meat-free day can reduce your food emissions by 40%.",
                icon: "utensils",
                saving: "3.4kg"
            });
        }

        if (result.breakdown.electricity > 2) {
            insights.push({
                text: "Switching to LED bulbs and efficient appliances can cut electricity usage by 15%.",
                icon: "zap",
                saving: "0.5kg"
            });
        }

        if (insights.length === 0) {
            insights.push({
                text: "You're doing great! Keep up the low-carbon lifestyle.",
                icon: "award",
                saving: "0.1kg"
            });
        }

        return insights;
    }
};
