import Redis from 'ioredis';

// Connect to the raw Redis TCP URL provided by the Vercel Integration
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

    try {
        const data = await redis.get('GLOBAL_LEADERBOARD');
        const scores = data ? JSON.parse(data) : [];

        // Set caching headers
        res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate=59');

        res.status(200).json({ scores });
    } catch (error) {
        console.error('getScores error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
}
