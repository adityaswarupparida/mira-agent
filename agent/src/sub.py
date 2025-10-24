import redis.asyncio as redis

class Subscriber:
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis_client = redis.from_url(redis_url)

    async def get_pubsub(self, channel: str):
        pubsub = self.redis_client.pubsub()
        await pubsub.subscribe(channel)
        return pubsub

                