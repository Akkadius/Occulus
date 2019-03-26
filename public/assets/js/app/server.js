/**
 * server.js
 */
class ServerManager {

  /**
   * Stop
   */
  static stop() {
    modal(
      'Stop Server',
      'Are you sure you want to stop your server?',
      '<button type="button" class="btn btn-primary" onclick="ServerManager.stopConfirm()"><i class="fe fe-power"></i> Stop</button>',
    );
  }

  static stopConfirm() {
    modalClose();
    ServerApiClient.stopServer();
  }

  /**
   * Start
   */
  static start() {
    modal(
      'Start Server',
      'Are you sure you want to start your server?',
      '<button type="button" class="btn btn-primary" onclick="ServerManager.startConfirm()"><i class="fe fe-power"></i> Start</button>',
    );
  }

  static startConfirm() {
    modalClose();
    ServerApiClient.startServer();
  }

  /**
   * Restart
   */
  static restart() {
    modal(
      'Restart Server',
      'Are you sure you want to restart your server?',
      '<button type="button" class="btn btn-primary" onclick="ServerManager.restartConfirm()"><i class="fe fe-power"></i> Restart</button>',
    );
  }

  static restartConfirm() {
    modalClose();
    ServerApiClient.restartServer();
  }
}