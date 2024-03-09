
import axios from "axios";
import * as Redis from "redis";
import { blocked_servers, config, ratelimit_adapter, redis } from "../..";
import { write_to_logs } from "../cache/Logger";

/**
 * Look for any events that have a key space notation for redis
 * @param e - string 
 * @param r - string
 */
export function KeyspaceNotif(e: any, r: any): void {

    const sub_client: Redis.createClient = new Redis.createClient();
    const expired_key: string = `__keyevent@0__:expired`;

    sub_client.subscribe(expired_key, () => {
        sub_client.on('message', async (channel: string, msg: string | any) => {
            
            const identifier: string = msg.split(":")[0];
            const second_identifier: string = msg.split(":")[1];

            switch(identifier) {
                case "ban-logs":

                    const serverNames: Array<string> = Object.keys(blocked_servers);

                    for (let i: number = 0; i < serverNames.length; i++) {

                        try {
                            // Fetch bans through the API
                            // Hopefully we don't get rate limited lmao
                            const banLink: string = `https://${serverNames[i]}.sploop.io/${config.third_party_endpoints.sploop.ban_logs}`;
                            const { data } = await axios.get(banLink);

                            await redis.set(
                                `ban-logs:${serverNames[i]}`,
                                JSON.stringify(data),
                                "EX",
                                ratelimit_adapter.base.bans
                            );
                        } catch(e) {
                            write_to_logs("errors", `Error when fetching ban logs: ${serverNames[i]}`);

                            // Try our best to prevent the rate limiting
                            ratelimit_adapter.base.bans += ratelimit_adapter.increment;
                            write_to_logs("actions", `Set ban fetch interval to ${ratelimit_adapter.base.bans} seconds!`);
                        }

                    }

                    break;
                default:
                    break;
            }

        })
    });

}
