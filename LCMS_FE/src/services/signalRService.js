import * as signalR from "@microsoft/signalr";

let connection = null;
let retryTimeout = null;

// Khởi tạo kết nối SignalR
const initializeConnection = (hubUrl) => {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.ServerSentEvents |
          signalR.HttpTransportType.LongPolling,
        withCredentials: false,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000]) // Thử kết nối lại sau 2s, 5s, 10s
      .configureLogging(signalR.LogLevel.Information)
      .build();
  }
};

// Kết nối SignalR
const startConnection = async (hubUrl, eventHandlers = {}) => {
  initializeConnection(hubUrl);
  try {
    await connection.start();
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      connection.on(event, handler);
    });
  } catch (err) {

    retryTimeout = setTimeout(() => {
      startConnection(hubUrl, eventHandlers);
    }, 5000);
  }

  // Xử lý khi bị mất kết nối
  connection.onclose(async (error) => {
    retryTimeout = setTimeout(() => {
      startConnection(hubUrl, eventHandlers);
    }, 5000);
  });
};

// Ngắt kết nối SignalR
const stopConnection = async () => {
  if (connection) {
    await connection.stop();
  }
  if (retryTimeout) {
    clearTimeout(retryTimeout);
  }
};

// Gửi tin nhắn tới Server
const sendMessage = async (methodName, ...args) => {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    await connection.invoke(methodName, ...args);
  } else {
  }
};

export { startConnection, stopConnection, sendMessage };
