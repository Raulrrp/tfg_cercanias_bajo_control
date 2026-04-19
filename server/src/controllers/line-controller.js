import * as LineService from '../services/line-service.js';

/**
 * GET /api/lines
 * Sends line data to the client
 */
export const getLines = async (req, res) => {
  try {
    const lines = await LineService.getLines();

    // Return the domain objects as JSON array
    res.status(200).json(lines);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
