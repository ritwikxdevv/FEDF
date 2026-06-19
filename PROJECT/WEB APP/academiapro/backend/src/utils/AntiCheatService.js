const Submission = require("../models/Submission");

/**
 * Service to process, analyze, and score anti-cheat telemetry data sent from the frontend exam client.
 */
class AntiCheatService {
  /**
   * Evaluates the telemetry logs and calculates a suspicious activity score.
   * 
   * @param {string} submissionId - The MongoDB ID of the exam submission
   * @param {Array} telemetryLogs - Array of event objects (e.g., { type: 'tab_switch', timestamp: Date })
   * @returns {Promise<Object>} An object containing the processed anti-cheat report
   */
  static async evaluateTelemetry(submissionId, telemetryLogs) {
    try {
      if (!telemetryLogs || !Array.isArray(telemetryLogs)) {
        throw new Error("Invalid telemetry log format provided.");
      }

      let tabSwitchCount = 0;
      let fullscreenExitCount = 0;
      let suspiciousActivityCount = 0;

      // Iterate through the raw telemetry logs and classify the events
      telemetryLogs.forEach(event => {
        switch (event.type) {
          case 'tab_switch':
          case 'visibility_hidden':
            tabSwitchCount++;
            suspiciousActivityCount += 2; // Tab switching is heavily weighted as suspicious
            break;
          
          case 'fullscreen_exit':
            fullscreenExitCount++;
            suspiciousActivityCount += 1; // Exiting fullscreen adds to the suspicion score
            break;

          case 'copy_paste_attempt':
            suspiciousActivityCount += 3; // Direct clipboard interference is highly suspicious
            break;

          default:
            suspiciousActivityCount += 1; // Any other unrecognized flagged event
        }
      });

      // Threshold logic: If the score hits 5 or more, the exam is officially flagged for review
      const isFlagged = suspiciousActivityCount >= 5;

      const report = {
        submissionId,
        metrics: {
          tabSwitches: tabSwitchCount,
          fullscreenExits: fullscreenExitCount,
          totalSuspiciousScore: suspiciousActivityCount
        },
        isFlagged,
        recommendedAction: isFlagged ? "Requires Manual Admin Review" : "Clear"
      };

      // Note: If you choose to expand the Submission model schema in the future, 
      // you can securely save this report directly to MongoDB right here.
      /*
      const submission = await Submission.findById(submissionId);
      if (submission) {
        submission.antiCheatReport = report;
        if (isFlagged) submission.status = "flagged-for-review";
        await submission.save();
      }
      */

      return report;
      
    } catch (error) {
      throw new Error(`Anti-cheat evaluation failed: ${error.message}`);
    }
  }
}

module.exports = AntiCheatService;
