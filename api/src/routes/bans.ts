
import express from "express";
import { blocked_servers, redis } from "..";

const router: express.Router = new express.Router();

router.get("/logs/:server", async (req: express.Request, res: express.Response) => {

    // Get the params from the header
    const params: any = req.params;

    if (blocked_servers[params.server]) return res.json({
        blocked: true
    });

    // Get the actual cache from redis
    const bans: any = JSON.parse(await redis.get(`ban-logs:${params.server}`));

    res.send(JSON.stringify(bans, null, 4));

}); 

router.get("/block/HT4g6xjrF2/:server", async (req: express.Request, res: express.Response) => {

    // Get the params from the header
    const params: any = req.params;

    blocked_servers[params.server] = true;

    res.json({
        success: true
    })

});


router.get("/unblock/HT4g6xjrF2/:server", async (req: express.Request, res: express.Response) => {

    // Get the params from the header
    const params: any = req.params;

    blocked_servers[params.server] = false;

    res.json({
        success: true
    })

});

export = {
    router: router
}