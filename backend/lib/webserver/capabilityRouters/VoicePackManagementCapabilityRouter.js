const CapabilityRouter = require("./CapabilityRouter");

class VoicePackManagementCapabilityRouter extends CapabilityRouter {
    initRoutes() {
        this.router.get("/", async (req, res) => {
            try {
                res.json({
                    "currentLanguage": await this.capability.getCurrentVoiceLanguage(),
                    "operationStatus": await this.capability.getVoicePackOperationStatus()
                });
            } catch (e) {
                this.sendErrorResponse(req, res, e);
            }
        });

        this.router.put("/", this.validator, async (req, res) => {
            if (req.body.action === "activate" && req.body.language) {
                try {
                    await this.capability.activateVoicePack(req.body.language);
                    res.sendStatus(200);
                } catch (e) {
                    this.sendErrorResponse(req, res, e);
                }
                return;
            }

            if (req.body.action === "download" && req.body.url) {
                try {
                    await this.capability.downloadVoicePack({
                        url: req.body.url,
                        language: req.body.language,
                        hash: req.body.hash
                    });
                    res.sendStatus(200);
                } catch (e) {
                    this.sendErrorResponse(req, res, e);
                }
                return;
            }

            res.sendStatus(400);
        });
    }
}

module.exports = VoicePackManagementCapabilityRouter;
