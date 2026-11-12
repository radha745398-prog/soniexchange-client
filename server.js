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

// 3. Client Dashboard Route (Live Matches from API)
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
        
        if (data && data.typeMatches) {
            data.typeMatches.forEach(typeMatch => {
                if (typeMatch.seriesMatches) {
                    typeMatch.seriesMatches.forEach(series => {
                        if (series.seriesAdWrapper && series.seriesAdWrapper.matches) {
                            series.seriesAdWrapper.matches.forEach(match => {
                                const matchInfo = match.matchInfo;
                                if (matchInfo) {
                                    liveMatches.push({
                                        id: matchInfo.matchId.toString(),
                                        tournament: matchInfo.seriesName || 'Live Series',
                                        teamA: matchInfo.team1?.teamName || 'Team A',
                                        teamB: matchInfo.team2?.teamName || 'Team B',
                                        dateTime: matchInfo.startDate ? new Date(parseInt(matchInfo.startDate)).toLocaleString() : 'Live',
                                        odds: { 
                                            teamA_back: '1.98', teamA_lay: '2.00', 
                                            draw_back: '-', draw_lay: '-', 
                                            teamB_back: '1.98', teamB_lay: '2.00' 
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    } catch (error) {
        console.error("Error fetching live matches:", error.message);
    }

    res.send(renderDashboardPage(user, liveMatches));
});

// 4. Match Detail Route (Fully Mapped Dynamic API Data)
app.get('/match/:id', async (req, res) => {
    const username = req.query.user || 'Client';
    const user = { username: username, points: 50000, exposure: 1200 };
    const matchId = req.params.id;
    
    let matchData = {
        id: matchId,
        tournament: 'Live Match',
        teamA: 'Team A',
        teamB: 'Team B',
        scoreA: '0/0',
        oversA: '(0.0)',
        scoreB: '0/0',
        oversB: '(0.0)',
        matchStateText: 'Match Live',
        venue: 'Live Stadium',
        status: 'LIVE'
    };

    try {
        const response = await fetch(`https://${RAPIDAPI_HOST}/match-details/get-info?matchId=${matchId}`, {
            headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': RAPIDAPI_HOST
            }
        });
        const data = await response.json();
        
        // Console mein print karwayenge taaki Render logs mein exact structure dikhe
        console.log("Cricbuzz Match Detail API Response:", JSON.stringify(data));
        
        if (data) {
            matchData.tournament = data.seriesName || data.matchInfo?.seriesName || data.matchHeader?.seriesName || 'Live Match';
            matchData.teamA = data.team1?.name || data.team1?.teamName || data.matchInfo?.team1?.teamName || data.matchHeader?.team1?.name || 'Team A';
            matchData.teamB = data.team2?.name || data.team2?.teamName || data.matchInfo?.team2?.teamName || data.matchHeader?.team2?.name || 'Team B';
            matchData.venue = data.venueInfo?.ground || data.matchInfo?.venueInfo?.ground || data.matchHeader?.venueInfo?.ground || 'Live Stadium';
            matchData.status = data.status || data.matchInfo?.status || 'LIVE';
            
            if (data.status) {
                matchData.matchStateText = data.status;
            } else if (data.matchInfo?.status) {
                matchData.matchStateText = data.matchInfo.status;
            }
        }
    } catch (error) {
        console.error("Error fetching match detail:", error.message);
    }

    res.send(renderMatchDetailPage(user, matchData));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
