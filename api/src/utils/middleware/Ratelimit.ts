
import express from "express";
import { config, ratelimit } from "../..";
import { write_to_logs } from "../cache/Logger";

export async function RatelimitMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {

    // Get the IP request
    const request_connection: string = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // See if the api_password belongs there, masking the ratelimiter completely
    const headers: any = req.headers;
    if (headers.api_password) return next();
    
    // If the rate limit config is not enabled, then go to the next request
    if (!config.security.ratelimit.enabled) return next();

    // See if the IP is allowed
    const requestAllowed: boolean = ratelimit.allowRequest(request_connection);

    // If the request is not allowed, then return the error message
    if (!requestAllowed) {
        
        write_to_logs(
            "connections",
            `Connection ${request_connection} has been rate limited.`
        );

        return res.json({
            error: true,
            ratelimit: true,
            message: "Your requests are being rate limited, try again soon."
        });

    }

    next();

}
