import { useEffect, useRef } from 'react';
import { useAuctionStore } from '../store/auctionStore';

export function useAuctionSocket(sessionId: string) {
  const ws = useRef<WebSocket | null>(null);
  const placeBid = useAuctionStore((state) => state.placeBid);

  // Derive WebSocket host from the same API URL used for REST calls
  const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api/v1' : 'https://ai-automated-ipl-auction-production.up.railway.app/api/v1');
  const isLocalhost = apiUrl.includes('localhost');
  const wsProtocol = apiUrl.startsWith('https') ? 'wss:' : 'ws:';
  const apiHost = new URL(apiUrl).host;
  const url = `${wsProtocol}//${apiHost}/api/v1/ws/auction/${sessionId}`;

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
