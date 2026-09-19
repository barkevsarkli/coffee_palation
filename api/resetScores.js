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

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { secret } = req.body;

        // The reset password lives in the environment, never in the repo or the
        // client bundle. With no password configured the route stays shut.
        const expected = process.env.LEADERBOARD_RESET_SECRET;
        if (expected && secret === expected) {
            // Delete the global leaderboard key from Redis
            await redis.del('GLOBAL_LEADERBOARD');
            return res.status(200).json({ success: true, message: 'Global leaderboard has been reset' });
        }

        return res.status(403).json({ error: 'Unauthorized: Invalid secret password' });
    } catch (error) {
        console.error('resetScores error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
