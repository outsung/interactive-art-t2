// ES6 import or TypeScript
import io from "socket.io-client";

export default class Socket {
  static instance = null;
  static init = () => {
    Socket.instance = io("https://interactive-art-t2-server.herokuapp.com", {
      forceNew: true,
      timeout: 5000,
      transports: ["websocket"],
    });
  };
  static disconnect = () => Socket.instance?.close();
}
