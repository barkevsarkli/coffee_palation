import Redis from 'ioredis';

// Connect to the raw Redis TCP URL provided by the Vercel Integration
const redis = new Redis(process.env.KV_REST_API_REDIS_URL || process.env.UPSTASH_REDIS_REST_URL);

export default async function handler(req, res) {
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
