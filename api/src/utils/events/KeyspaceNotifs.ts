
import axios from "axios";
import * as Redis from "redis";
import { blocked_servers, redis } from "../..";
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
                            const banLink: string = `https://${serverNames[i]}.sploop.io/ws/banLog_BYIUSNNKR51P`;
                            const { data } = await axios.get(banLink);

                            await redis.set(
                                `ban-logs:${serverNames[i]}`,
                                JSON.stringify(data),
                                "EX",
                                60
                            );
                        } catch(e) {
                            write_to_logs("errors", `Error when fetching ban logs: ${serverNames[i]}`);
                        }

                    }

                    break;
                default:
                    break;
            }

        })
    });

}
