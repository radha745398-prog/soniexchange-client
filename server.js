// server.js
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const app = express();

const { renderDashboardPage } = require('./clientViews/dashboardView');
const { renderMatchDetailPage } = require('./clientViews/matchDetailView');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const RAPIDAPI_KEY = '269384970fmsh3bc319f6f386606p1959e6jsn36927c504ec7';
const RAPIDAPI_HOST = 'cricbuzz-cricket.p.rapidapi.com';

// Universal parser to extract all live matches and their real names/scores
function extractAllLiveMatches(data) {
    let extracted = [];
    if (!data) return data;

    // Handle different Cricbuzz API JSON roots
    const typeMatches = data.typeMatches || data.data || [];
    
    typeMatches.forEach(typeMatch => {
        const seriesMatches = typeMatch.seriesMatches || typeMatch.matchList || [];
        seriesMatches.forEach(series => {
            const matches = series.matches 
                         || series.seriesAdWrapper?.matches 
                         || series.seriesAdWrapper?.seriesMatches 
                         || (series.matchInfo ? [series] : []) 
                         || [];

            matches.forEach(m => {
                const matchInfo = m.matchInfo || m;
                const matchScore = m.matchScore || matchInfo.matchScore;
                
                if (matchInfo && matchInfo.matchId) {
                    extracted.push({ matchInfo, matchScore });
                }
            });
        });
    });
    return extracted;
}

// 1. Login Page Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. Direct Admin Switch Route
app.get('/switch-to-client', (req, res) => {
    const targetUser = req.query.user || 'Client';
    res.redirect(`/dashboard?user=${encodeURIComponent(targetUser)}`);
});

// 3. Client Dashboard Route - Shows ALL active live matches with real names
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
        
        const rawMatches = extractAllLiveMatches(data);
        
        rawMatches.forEach(item => {
            const mi = item.matchInfo;
            // Extract real names from API fields safely
            const teamAName = mi.team1?.teamName || mi.team1?.name || mi.team1?.sName || 'Team A';
            const teamBName = mi.team2?.teamName || mi.team2?.name || mi.team2?.sName || 'Team B';
            
            liveMatches.push({
                id: mi.matchId.toString(),
                tournament: mi.seriesName || mi.seriesDesc || 'Live Match',
                teamA: teamAName,
                teamB: teamBName,
                dateTime: mi.status || mi.state || 'LIVE',
                odds: { 
                    teamA_back: '1.98', teamA_lay: '2.00', 
                    draw_back: '-', draw_lay: '-', 
                    teamB_back: '1.98', teamB_lay: '2.00' 
                }
            });
        });
    } catch (error) {
        console.error("Dashboard Fetch Error:", error.message);
    }

    res.send(renderDashboardPage(user, liveMatches));
});

// 4. Match Detail Route - Shows real scores and team names for the selected match
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
        const response = await fetch(`https://${RAPIDAPI_HOST}/matches/live`, {
            headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': RAPIDAPI_HOST
            }
        });
        const data = await response.json();
        
        const rawMatches = extractAllLiveMatches(data);
        
        const found = rawMatches.find(item => item.matchInfo.matchId.toString() === matchId.toString());
        
        if (found) {
            const mi = found.matchInfo;
            const ms = found.matchScore;
            
            matchData.tournament = mi.seriesName || mi.seriesDesc || 'Live Match';
            matchData.teamA = mi.team1?.teamName || mi.team1?.name || mi.team1?.sName || 'Team A';
            matchData.teamB = mi.team2?.teamName || mi.team2?.name || mi.team2?.sName || 'Team B';
            matchData.venue = mi.venueInfo?.ground || mi.venueInfo?.city || 'Live Ground';
            matchData.status = mi.state || 'LIVE';
            matchData.matchStateText = mi.status || mi.state || 'Live';

            if (ms) {
                if (ms.team1Score && ms.team1Score.inngs1) {
                    matchData.scoreA = `${ms.team1Score.inngs1.runs}/${ms.team1Score.inngs1.wickets}`;
                    matchData.oversA = `(${ms.team1Score.inngs1.overs})`;
                }
                if (ms.team2Score && ms.team2Score.inngs1) {
                    matchData.scoreB = `${ms.team2Score.inngs1.runs}/${ms.team2Score.inngs1.wickets}`;
                    matchData.oversB = `(${ms.team2Score.inngs1.overs})`;
                }
            }
        }
    } catch (error) {
        console.error("Match Detail Fetch Error:", error.message);
    }

    res.send(renderMatchDetailPage(user, matchData));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
