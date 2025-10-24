import Redis from "ioredis"

export class PublisherService {
    client: Redis
    constructor() {
        this.client = new Redis()
    }

    async publishData(channel: string, data: string) {
        await this.client.publish(channel, data);
    }
}