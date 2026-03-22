import * as UpdateService from '../services/update-service.js';

export const getUpdates = async (req, res) => {
    try {
        const updates = await UpdateService.getUpdates();
        res.json(updates.toJson());
    } catch (error) {
        console.error("Error in update controller:", error);
        res.status(500).json({ error: "Could not fetch updates" });
    }
}

export const getUpdateByTrainId = async (req, res) => {
    try {
        // req.params is a dictionary, trainId is the key read
        // this is the same as: const tripId = req.params.tripId;
        const { trainId } = req.params;
        const update = await UpdateService.getUpdateByTrainId(trainId);
        if (!update) {
            return res.status(404).json({ error: "Update not found" });
        }
        res.json(update.toJson());
    } catch (error) {
        console.error("Error in update controller:", error);
        res.status(500).json({ error: "Could not fetch update" });
    }
}

export const getUpdateByTripId = async (req, res) => {
    try {
        const { tripId } = req.params;
        const update = await UpdateService.getUpdateByTripId(tripId);
        if (!update) {
            return res.status(404).json({ error: "Update not found" });
        }
        res.json(update.toJson());
    } catch (error) {
        console.error("Error in update controller:", error);
        res.status(500).json({ error: "Could not fetch update" });
    }
}