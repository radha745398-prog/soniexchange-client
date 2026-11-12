// server.js
const express = require('express');
const path = require('path');
const fetch = require('node-fetch'); // Added to ensure fetch works seamlessly on all Node versions
const app = express();

const { renderDashboardPage } = require('./clientViews/dashboardView');
const { renderMatchDetailPage } = require('./clientViews/matchDetailView');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// RapidAPI Credentials (Exact Active Key)
const RAPIDAPI_KEY = '269384970fmsh3bc319f6f386606p1959e6jsn36927c504ec7';
const RAPIDAPI_HOST = 'cricbuzz-cricket.p.rapidapi.com';

// Helper function to universally extract matches from any Cricbuzz JSON structure
function extractAllMatches(data) {
    let extracted = [];
    if (!data) return extracted;

    const typeMatches = data.typeMatches || data.data || [];
    typeMatches.forEach(typeMatch => {
        const seriesMatches = typeMatch.seriesMatches || typeMatch.matchList || [];
        seriesMatches.forEach(series => {
            // Check multiple potential nesting paths for matches
            let matches = series.matches 
                       || series.seriesAdWrapper?.matches 
                       || series.seriesAdWrapper?.seriesMatches 
                       || (series.matchInfo ? [series] : []) 
                       || [];

            if (!matches.length && series.seriesAdWrapper) {
                if (series.seriesAdWrapper.matchInfo) {
                    matches = [series.seriesAdWrapper];
                }
            }

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

// 3. Client Dashboard Route (Live Matches with Smart Extractor)
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
        
        const rawMatches = extractAllMatches(data);
        rawMatches.forEach(item => {
            const matchInfo = item.matchInfo;
            liveMatches.push({
                id: matchInfo.matchId.toString(),
                tournament: matchInfo.seriesName || 'Live Series',
                teamA: matchInfo.team1?.teamName || matchInfo.team1?.name || 'Team A',
                teamB: matchInfo.team2?.teamName || matchInfo.team2?.name || 'Team B',
                dateTime: matchInfo.startDate ? new Date(parseInt(matchInfo.startDate)).toLocaleString() : 'Live',
                odds: { 
                    teamA_back: '1.98', teamA_lay: '2.00', 
                    draw_back: '-', draw_lay: '-', 
                    teamB_back: '1.98', teamB_lay: '2.00' 
                }
            });
        });
    } catch (error) {
        console.error("Error fetching live matches:", error.message);
    }

    res.send(renderDashboardPage(user, liveMatches));
});

// 4. Match Detail Route (Smart Extractor for Score & Details)
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
        const response = await fetch(`https://${RAPIDAPI_HOST}/matches/live`, {
            headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': RAPIDAPI_HOST
            }
        });
        const data = await response.json();
        
        const rawMatches = extractAllMatches(data);
        rawMatches.forEach(item => {
            const matchInfo = item.matchInfo;
            const matchScore = item.matchScore;
            
            if (matchInfo && matchInfo.matchId.toString() === matchId.toString()) {
                matchData.tournament = matchInfo.seriesName || 'Live Series';
                matchData.teamA = matchInfo.team1?.teamName || matchInfo.team1?.name || 'Team A';
                matchData.teamB = matchInfo.team2?.teamName || matchInfo.team2?.name || 'Team B';
                matchData.venue = matchInfo.venueInfo?.ground || 'Live Stadium';
                matchData.status = matchInfo.state || 'LIVE';
                matchData.matchStateText = matchInfo.status || matchInfo.state || 'Live';

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
        console.error("Error fetching match detail:", error.message);
    }

    res.send(renderMatchDetailPage(user, matchData));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
