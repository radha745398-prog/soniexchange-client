// server.js
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const app = express();

const { renderDashboardPage } = require('./clientViews/dashboardView');
const { renderMatchDetailPage } = require('./clientViews/matchDetailView');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const HIGHLIGHTLY_KEY = '6b4d9320-5321-4b20-9168-0261386a6fcc';

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
        const response = await fetch(`https://api.highlightly.net/cricket/matches?apikey=${HIGHLIGHTLY_KEY}`);
        const text = await response.text();
        
        console.log("=== HIGHLIGHTLY RAW RESPONSE START ===");
        console.log(text);
        console.log("=== HIGHLIGHTLY RAW RESPONSE END ===");
        
        let data = {};
        if (text && text.trim().length > 0) {
            try {
                data = JSON.parse(text);
            } catch (parseErr) {
                console.error("JSON Parse Error:", parseErr.message);
            }
        }
        
        const matchesList = Array.isArray(data) ? data : (data.matches || data.data || data.response || data.results || []);
        
        matchesList.forEach(match => {
            const matchId = (match.id || match.match_id || match.matchId || '').toString();
            if (matchId) {
                liveMatches.push({
                    id: matchId,
                    tournament: match.league || match.tournament || match.series || 'Live Cricket',
                    teamA: match.home_team || match.team1 || match.teamA || 'Team A',
                    teamB: match.away_team || match.team2 || match.teamB || 'Team B',
                    dateTime: `LIVE (${match.score || match.status || 'In Progress'})`,
                    odds: { 
                        teamA_back: match.odds?.teamA_back || '1.98', 
                        teamA_lay: match.odds?.teamA_lay || '2.00', 
                        draw_back: '-', 
                        draw_lay: '-', 
                        teamB_back: match.odds?.teamB_back || '1.98', 
                        teamB_lay: match.odds?.teamB_lay || '2.00' 
                    }
                });
            }
        });
    } catch (error) {
        console.error("Dashboard Fetch Error:", error.message);
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
        tournament: 'Live Match',
        teamA: 'Team A',
        teamB: 'Team B',
        scoreA: 'Yet to bat',
        oversA: '(0.0)',
        scoreB: 'Yet to bat',
        oversB: '(0.0)',
        matchStateText: 'Live',
        venue: 'Stadium',
        status: 'LIVE'
    };

    try {
        const response = await fetch(`https://api.highlightly.net/cricket/matches?apikey=${HIGHLIGHTLY_KEY}`);
        const text = await response.text();
        let data = {};
        
        if (text && text.trim().length > 0) {
            try {
                data = JSON.parse(text);
            } catch (parseErr) {
                console.error("JSON Parse Error:", parseErr.message);
            }
        }
        
        const matchesList = Array.isArray(data) ? data : (data.matches || data.data || data.response || data.results || []);
        const found = matchesList.find(match => (match.id || match.match_id || match.matchId || '').toString() === matchId.toString());
        
        if (found) {
            matchData.tournament = found.league || found.tournament || found.series || 'Live Match';
            matchData.teamA = found.home_team || found.team1 || found.teamA || 'Team A';
            matchData.teamB = found.away_team || found.team2 || found.teamB || 'Team B';
            matchData.venue = found.venue || found.ground || 'Live Ground';
            matchData.status = found.status || found.state || 'LIVE';
            matchData.matchStateText = found.score || found.status || 'Live';
            
            if (found.scoreA) matchData.scoreA = found.scoreA;
            if (found.scoreB) matchData.scoreB = found.scoreB;
        }
    } catch (error) {
        console.error("Match Detail Fetch Error:", error.message);
    }

    res.send(renderMatchDetailPage(user, matchData));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
