import Redis from 'ioredis';

const redis = new Redis(process.env.KV_REST_API_REDIS_URL || process.env.UPSTASH_REDIS_REST_URL);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { secret } = req.body;

        // Check if the secret matches the password set by the user
        if (secret === '0zekininkusu') {
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
