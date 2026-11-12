// server.js
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const app = express();

const { renderDashboardPage } = require('./clientViews/dashboardView');
const { renderMatchDetailPage } = require('./clientViews/matchDetailView');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// RapidAPI Credentials (Exact Active Key)
const RAPIDAPI_KEY = '269384970fmsh3bc319f6f386606p1959e6jsn36927c504ec7';
const RAPIDAPI_HOST = 'cricbuzz-cricket.p.rapidapi.com';

// Robust Real Extractor for Cricbuzz /matches/live API structure
function extractRealMatches(data) {
    let extracted = [];
    if (!data || !data.typeMatches) return extracted;

    data.typeMatches.forEach(typeMatch => {
        if (typeMatch.seriesMatches) {
            typeMatch.seriesMatches.forEach(seriesWrapper => {
                const series = seriesWrapper.seriesAdWrapper;
                if (series && series.matches) {
                    series.matches.forEach(match => {
                        if (match.matchInfo) {
                            extracted.push({
                                matchInfo: match.matchInfo,
                                matchScore: match.matchScore || null
                            });
                        }
                    });
                }
            });
        }
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

// 3. Client Dashboard Route (Real Live Matches from API)
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
        
        const realMatches = extractRealMatches(data);
        realMatches.forEach(item => {
            const matchInfo = item.matchInfo;
            liveMatches.push({
                id: matchInfo.matchId.toString(),
                tournament: matchInfo.seriesName || 'Live Series',
                teamA: matchInfo.team1?.teamName || 'Team A',
                teamB: matchInfo.team2?.teamName || 'Team B',
                dateTime: matchInfo.status || 'LIVE',
                odds: { 
                    teamA_back: '1.98', teamA_lay: '2.00', 
                    draw_back: '-', draw_lay: '-', 
                    teamB_back: '1.98', teamB_lay: '2.00' 
                }
            });
        });
    } catch (error) {
        console.error("Error fetching real live matches:", error.message);
    }

    res.send(renderDashboardPage(user, liveMatches));
});

// 4. Match Detail Route (Real Score & Live Data)
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
        matchStateText: 'Match Live',
        venue: 'Live Stadium',
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
        
        const realMatches = extractRealMatches(data);
        realMatches.forEach(item => {
            const matchInfo = item.matchInfo;
            const matchScore = item.matchScore;
            
            if (matchInfo && matchInfo.matchId.toString() === matchId.toString()) {
                matchData.tournament = matchInfo.seriesName || 'Live Series';
                matchData.teamA = matchInfo.team1?.teamName || 'Team A';
                matchData.teamB = matchInfo.team2?.teamName || 'Team B';
                matchData.venue = matchInfo.venueInfo?.ground || 'Live Stadium';
                matchData.status = matchInfo.state || 'LIVE';
                matchData.matchStateText = matchInfo.status || matchInfo.state || 'Live';

                // Extract real live scores from API
                if (matchScore) {
                    if (matchScore.team1Score && matchScore.team1Score.inngs1) {
                        matchData.scoreA = `${matchScore.team1Score.inngs1.runs}/${matchScore.team1Score.inngs1.wickets}`;
                        matchData.oversA = `(${matchScore.team1Score.inngs1.overs})`;
                    }
                    if (matchScore.team2Score && matchScore.team2Score.inngs1) {
                        matchData.scoreB = `${matchScore.team2Score.inngs1.runs}/${matchScore.team2Score.inngs1.wickets}`;
                        matchData.oversB = `(${matchScore.team2Score.inngs1.overs})`;
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error fetching real match detail:", error.message);
    }

    res.send(renderMatchDetailPage(user, matchData));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
