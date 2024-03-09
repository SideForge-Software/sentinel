// You can also use CommonJS `require('@sentry/node')` instead of `import`
import express from "express";
import cors from "cors";
import bodyparser from "body-parser";
import * as Redis from "redis"
import * as os from "os";
import * as pg from "pg";
import axios from "axios";
// import http from "http";
// import { Stripe } from "stripe";
import { createClient } from '@supabase/supabase-js';

import { ConfigLoader } from "./utils/loaders/ConfigLoader";
import { RouteLoader } from "./utils/loaders/RouteLoader";
import * as DatabaseLoader from "./utils/loaders/DatabaseLoader"
import { getStripeAPIKey, getSupabaseCredentials } from "./utils/cache/Process";
import { ConnectionMiddleware } from "./utils/middleware/Password";
import { write_to_logs } from "./utils/cache/Logger";
import { RateLimiter } from "./utils/cache/RateLimiter";
import { RatelimitMiddleware } from "./utils/middleware/Ratelimit";

const app = express();
export const config: any = ConfigLoader("config.yaml");
export const redis: Redis.Client = new Redis.createClient(DatabaseLoader.getDatabaseCredentials('redis'));
export const postgres: pg.Pool = new pg.Pool(DatabaseLoader.getDatabaseCredentials("postgresql"));
export const supabase: any = createClient((getSupabaseCredentials()).url, (getSupabaseCredentials()).secret_service, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
});
export const ratelimit: RateLimiter = new RateLimiter();
export const blocked_servers: any = {
    sgp: false,
    sgp2: false,
    sfra: false,
    sfra2: false,
    sca: false,
    sca2: false,
    sgp1ffa: false,
    fra1ffa: false,
    ca1ffa: false
}

app.set("trust proxy");
app.use(cors(config.server.cors));
app.use(bodyparser.json())
app.use(express.json({limit: config.server.bandwidth_limit}));
app.use(express.urlencoded({limit: config.server.bandwidth_limit}));
app.use(bodyparser.urlencoded({ extended: config.server.url_encoded }));

app.use(RatelimitMiddleware);
app.use(ConnectionMiddleware)

RouteLoader(app);

app.listen(config.server.port, config.server.host, async () => {

    // For PROD, do not edit
    // Stops it from running the postgresql pool
    // Don't have the pool running on the server, aka postgresql
    // await DatabaseLoader.postgres(postgres);

    // Load the redis dastabase, this is in a docker container
    await DatabaseLoader.redis(redis);

    // For the times for caching

    const serverNames: Array<string> = Object.keys(blocked_servers);

    for (let i: number = 0; i < serverNames.length; i++) {

        const banLink: string = `https://${serverNames[i]}.sploop.io/ws/banLog_BYIUSNNKR51P`;
        const { data } = await axios.get(banLink);

        await redis.set(
            `ban-logs:${serverNames[i]}`,
            JSON.stringify(data),
            "EX",
            120
        );

    }

    // Prettify the logging for the console
    // write_to_logs("service", `Setting API Password to: ${config.security.api_password}`);
    write_to_logs(
        "connections",
        `Running on ${config.server.host}:${config.server.port} server.`
    );

});