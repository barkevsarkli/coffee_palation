import Redis from 'ioredis';

const redis = new Redis(process.env.KV_REST_API_REDIS_URL || process.env.UPSTASH_REDIS_REST_URL);


// The game is also served from GitHub Pages, which has no functions of its own,
// so these routes answer cross-origin requests.
function applyCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
    applyCors(res);
    if (req.method === 'OPTIONS') return res.status(204).end();

    // Only handle POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { name, score } = req.body;

        if (!name || typeof score !== 'number') {
            return res.status(400).json({ error: 'Invalid name or score' });
        }

        const trimmedName = name.trim();

        // Fetch existing leaderboard
        const data = await redis.get('GLOBAL_LEADERBOARD');
        let scores = data ? JSON.parse(data) : [];

        // Check if player exists
        const existingIndex = scores.findIndex(
            s => s.name.toLowerCase() === trimmedName.toLowerCase()
        );

        if (existingIndex >= 0) {
            if (score > scores[existingIndex].score) {
                scores[existingIndex] = {
                    name: trimmedName,
                    score,
                    date: new Date().toISOString()
                };
            }
        } else {
            scores.push({
                name: trimmedName,
                score,
                date: new Date().toISOString()
            });
        }

        // Sort descending by score, limit to top 10
        scores.sort((a, b) => b.score - a.score);
        scores = scores.slice(0, 10);

        // Save back out to Redis
        await redis.set('GLOBAL_LEADERBOARD', JSON.stringify(scores));

        res.status(200).json({ success: true, scores });
    } catch (error) {
        console.error('addScore error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
