
import express from "express";
import { config, supabase } from "../..";
import { write_to_logs } from "../cache/Logger";


/**
 * See if a supabase user id is valid within the supabase authentication dashboard
 * @param id string
 * @returns boolean
 */
export async function isUserValid(id: string): Promise<boolean> {

    const { data, error } = await supabase.auth.admin.getUserById(id)

    if (error && config.security.end_end_auth.restrict.error_found) return false;
    if (!data && config.security.end_end_auth.restrict.no_user_found) return false;

    return true;

}

/**
 * Used to look through the traffic of website, and lock those connections
 * @param req express request
 * @param res express response
 * @param next next function
 */
export async function ConnectionMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {

    const request_connection: string = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const headers: any = req.headers;

    // See if the configuration for the end auth endopint is there 
    // We alos need to see if the api password is not there, because the api password is the admin password
    // Overrides each config
    if (config.security.end_end_auth.endpoints && !headers['api_password']) {

        // Get the path of it
        const originalUrl: string = req.originalUrl;

        // Go through each endpoint to see if it is in the url
        const foundEndpoints: Array<string> = config.security.end_end_auth.endpoints.some(str => originalUrl.includes(str));

        // Sees if the endpoint to watch is there
        if (foundEndpoints) {
            const authorization: string = headers['authorization'];

            // If no authorization header is present, we don't allow the connection
            if (!authorization && config.security.end_end_auth.restrict.no_user_id_found) { 
                write_to_logs(
                    "connections",
                    `Request from ${request_connection} on ${req.originalUrl} blocked: invalid authorization.`,
                    true
                );
                
                return res.json({
                    error: true,
                    message: "Unauthorized access."
                }); 
            }

            const validUser: boolean = await isUserValid(authorization);

            // If it is not a valid user such as there is an error or no user, we don't allow the connection
            if (!validUser && config.security.end_end_auth.restrict.invalid_user_id) { 
                write_to_logs(
                    "connections",
                    `Request from ${request_connection} on ${req.originalUrl} blocked: invalid authorization.`,
                    true
                );

                return res.json({
                    error: true,
                    message: "Unauthorized access."
                }); 
            }

            // If all things are clear, then we just go to the next request
            return next();

        }

    }

    // No api password we just return to the next connection
    if (!config.security.api_password) return next();

    // If there are no headers, we return
    if (!headers) {
        write_to_logs(
            "connections",
            `Request from ${request_connection} on ${req.originalUrl} blocked: no password provided.`,
            true
        );
        
        return res.json({
            error: true,
            message: "Unauthorized access."
        });
    }

    // Get the api_password header 
    const api_password = headers['api_password'];

    // If no api password, then we don't allow the connection
    if (!api_password) {
        write_to_logs(
            "connections",
            `Request from ${request_connection} on ${req.originalUrl} blocked: no password provided.`,
            true
        );
        
        return res.json({
            error: true,
            message: "Unauthorized access."
        });
    }

    // If the password does not match the config password, then we return
    if (api_password !== config.security.api_password) {

        write_to_logs(
            "connections",
            `Request from ${request_connection} on ${req.originalUrl} blocked: password invalid (${api_password})`,
            true
        );

        return res.json({
            error: true,
            message: "Unauthorized access."
        });
    }

    next();

}