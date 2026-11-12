// server.js
const express = require('express');
const path = require('path');
const app = express();

const { renderDashboardPage } = require('./clientViews/dashboardView');
const { renderMatchDetailPage } = require('./clientViews/matchDetailView');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// RapidAPI Credentials
const RAPIDAPI_KEY = '26938f4970hnsf3bc3101bf38660p19fde5n38927c04ec7';
const RAPIDAPI_HOST = 'cricbuzz-cricket.p.rapidapi.com';

// 1. Login Page Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. Direct Admin Switch Route
app.get('/switch-to-client', (req, res) => {
    const targetUser = req.query.user || 'Client';
    res.redirect(`/dashboard?user=${encodeURIComponent(targetUser)}`);
});

// 3. Client Dashboard Route
app.get('/dashboard', async (req, res) => {
    const username = req.query.user || 'Client';
    const user = { username: username, points: 50000, exposure: 1200 };
    
    let liveMatches = [];
    
    try {
        const response = await fetch(`https://${RAPIDAPI_HOST}/matches/live`, {
            headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': RAPIDAPI_HOST
            }
        });
        const data = await response.json();
        // Agar data mil gaya toh yahan use kar sakte hain
    } catch (error) {
        console.error("Error fetching live matches:", error.message);
    }

    if (liveMatches.length === 0) {
        liveMatches = [
            {
                id: '567516426',
                tournament: 'ODI International',
                teamA: 'New Zealand',
                teamB: 'India',
                dateTime: '08/11/2026 14:30:00',
                odds: { teamA_back: '1.05', teamA_lay: '1.08', draw_back: '-', draw_lay: '-', teamB_back: '14.0', teamB_lay: '15.5' }
            }
        ];
    }

    res.send(renderDashboardPage(user, liveMatches));
});

// 4. Match Detail Route
app.get('/match/:id', async (req, res) => {
    const username = req.query.user || 'Client';
    const user = { username: username, points: 50000, exposure: 1200 };
    const matchId = req.params.id;
    
    let matchData = {
        id: matchId,
        tournament: 'ODI International',
        teamA: 'New Zealand',
        teamB: 'India',
        teamA_score: '185/5 (40.2)'
    };

    try {
        const response = await fetch(`https://${RAPIDAPI_HOST}/match-details/get-info?matchId=${matchId}`, {
            headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': RAPIDAPI_HOST
            }
        });
        const data = await response.json();
        // Match detail data handle kar sakte hain
    } catch (error) {
        console.error("Error fetching match detail:", error.message);
    }

    res.send(renderMatchDetailPage(user, matchData));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
