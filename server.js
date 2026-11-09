// server.js
const express = require('express');
const path = require('path');
const app = express();

const { renderDashboardPage } = require('./clientViews/dashboardView');
const { renderMatchDetailPage } = require('./clientViews/matchDetailView');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. Login Page Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. Direct Admin Switch Route (Bina password ke direct entry)
app.get('/switch-to-client', (req, res) => {
    const targetUser = req.query.user || 'Client';
    // Seedha dashboard par redirect kar do with user query
    res.redirect(`/dashboard?user=${encodeURIComponent(targetUser)}`);
});

// 3. Client Dashboard Route
app.get('/dashboard', (req, res) => {
    const username = req.query.user || 'Client';
    const user = { username: username, points: 50000, exposure: 1200 };
    
    const liveMatches = [
        {
            id: '567516426',
            tournament: 'ODI International',
            teamA: 'New Zealand',
            teamB: 'India',
            dateTime: '08/11/2026 14:30:00',
            odds: { teamA_back: '1.05', teamA_lay: '1.08', draw_back: '-', draw_lay: '-', teamB_back: '14.0', teamB_lay: '15.5' }
        }
    ];
    res.send(renderDashboardPage(user, liveMatches));
});

// 4. Match Detail Route
app.get('/match/:id', (req, res) => {
    const username = req.query.user || 'Client';
    const user = { username: username, points: 50000, exposure: 1200 };
    
    const matchData = {
        id: req.params.id,
        tournament: 'ODI International',
        teamA: 'New Zealand',
        teamB: 'India',
        teamA_score: '185/5 (40.2)'
    };
    res.send(renderMatchDetailPage(user, matchData));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
