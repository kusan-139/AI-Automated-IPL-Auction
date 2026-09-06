import { useEffect, useRef } from 'react';
import { useAuctionStore } from '../store/auctionStore';

export function useAuctionSocket(sessionId: string) {
  const ws = useRef<WebSocket | null>(null);
  const placeBid = useAuctionStore((state) => state.placeBid);

  // In a real setup, determine ws vs wss and host dynamically
  const host = window.location.hostname === 'localhost' ? 'localhost:8000' : window.location.host;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const url = `${protocol}//${host}/api/v1/ws/auction/${sessionId}`;

  useEffect(() => {
    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log(`Connected to Auction WebSocket for session ${sessionId}`);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.team && data.amount) {
            placeBid(data.team, data.amount);
          }
        } catch {
          // Plain text message
          console.log('[Live WS]', event.data);
        }
      };

      ws.current.onclose = () => {
        console.log('Disconnected from Auction WebSocket');
      };
    } catch {
      console.log('WebSocket offline in standalone mode');
    }

    return () => {
      ws.current?.close();
    };
  }, [url, placeBid]);

  const sendBid = (amount: number) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'bid', amount }));
    }
  };

  return { sendBid };
}
