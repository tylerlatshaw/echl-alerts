import { redis } from "../lib/redis";

const Page = async () => {
    // const raw = await redis.lrange("tx:transactions", 0, 50);
    const raw = {count: 4};

    return <p>count: {JSON.stringify(raw)}</p>;
};

export default Page;