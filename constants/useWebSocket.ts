import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const SOCKET_URL = "http://10.0.2.2:8080/ws"; // Địa chỉ backend Spring Boot

export const useWebSocket = (userId: number, onMessage: (msg: any) => void) => {
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const socketFactory = () => new SockJS(SOCKET_URL);

    const client = new Client({
      webSocketFactory: socketFactory,
      reconnectDelay: 5000,
      debug: (msg) => console.log("📡 STOMP:", msg),
      onConnect: () => {
        console.log("✅ Connected to STOMP server");
        client.subscribe(`/topic/user.${userId}`, (message) => {
          const body = JSON.parse(message.body);
          onMessage(body);
        });
      },
      onStompError: (frame) => {
        console.error("❌ STOMP error:", frame.headers["message"]);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [userId]);

  const sendMessage = (destination: string, payload: any) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination,
        body: JSON.stringify(payload),
      });
    } else {
      console.warn("⚠️ STOMP not connected");
    }
  };

  return { sendMessage };
};
