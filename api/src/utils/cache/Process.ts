
import { config } from "../.."
import { write_to_logs } from "./Logger";

/**
 * A better way to construct a stripe event
 * @param body 
 * @param sig 
 * @param webhook_sec 
 */
//  export function stripeConstructEvent(
//     body: string,
//     sig: string,
//     webhook_sec: string
// ) {

//     let event: any;

//     try {

//         event = stripe.webhooks.constructEvent(
//             body,
//             sig,
//             webhook_sec
//         );

//     } catch(err) {

//         write_to_logs(
//             "errors",
//             `Stripe Webhook Error: ${err.message}`,
//             true
//         );

//     }

//     return event;

// }

export function getWebsiteUrl() {

    const arg: string = process.argv[2];
    let website_url: string = "";

    switch(arg) {

        case "dev":
            website_url = "http://localhost:3000";
            break;
        case "prod":
            website_url = "https://sideforge.io";
            break;
    }

    return website_url;

}

/**
 * Get the supabase credentials based on dev or prod env
 * @returns supabase credentials
 */
export function getSupabaseCredentials() {

    const arg: string = process.argv[2];
    let creds: any = {};

    switch(arg) {

        case "dev":
            creds = config.supabase[arg];
            break;
        case "prod":
            creds = config.supabase[arg];
            break;
    }

    return creds;

}

/**
 * Get the enviornment api key for stripe
 * @return stripe api key
 */

export function getStripeAPIKey() {

    const arg: string = process.argv[2];
    let apiKey: string = "";
    let webhookSecret: string = "";

    switch (arg) {

        case "prod":
            apiKey = config.stripe.prod.secret_key;
            webhookSecret = config.stripe.webhook_secrets.prod
            break;
        case "dev":
            apiKey = config.stripe.dev.secret_key;
            webhookSecret = config.stripe.webhook_secrets.dev
            break;

    }

    return { apiKey, webhookSecret };

}
