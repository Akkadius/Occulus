/**
 * api-client.js
 */
class ServerApiClient {

  /**
   * @param url
   * @returns {Promise<*>}
   */
  static async get(url) {
    try {
      return await $.get(url);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * @param message
   */
  static success(message) {
    iziToast.show({ message: message });
  }

  /**
   * @returns {Promise<void>}
   */
  static async stopServer() {
    const call = await this.get("/api/server/stop");
    if (call.data) {
      this.success('<i class="fe fe-power"></i> ' + call.data)
      this.refreshPage();
    }
  }

  /**
   * @returns {Promise<void>}
   */
  static async startServer() {
    const call = await this.get("/api/server/start");
    if (call.data) {
      this.success('<i class="fe fe-power"></i> ' + call.data)
      this.refreshPage();
    }
  }

  /**
   * @returns {Promise<void>}
   */
  static async restartServer() {
    const call = await this.get("/api/server/restart");
    if (call.data) {
      this.success('<i class="fe fe-power"></i> ' + call.data)
      this.refreshPage(500);
    }
  }

  static refreshPage(time = 100) {
    setTimeout(function(){ window.location.reload(); }, time);
  }
}