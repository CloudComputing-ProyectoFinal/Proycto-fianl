/**
 * Hook personalizado para manejar notificaciones WebSocket
 * Se conecta automáticamente cuando el usuario inicia sesión
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import webSocketService, { WebSocketNotification } from '../services/websocket';

interface UseWebSocketOptions {
  onMessage?: (notification: WebSocketNotification) => void;
  autoConnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { user, profile } = useAuth();
  const [lastNotification, setLastNotification] = useState<WebSocketNotification | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { autoConnect = true } = options;

  // Usar ref para el callback para evitar re-registros innecesarios
  const onMessageRef = useRef(options.onMessage);
  onMessageRef.current = options.onMessage;

  // Verificar estado de conexión
  useEffect(() => {
    const checkConnection = () => {
      const connected = webSocketService.isConnected();
      setIsConnected(connected);
    };

    // Verificar inmediatamente y cada segundo
    checkConnection();
    const interval = setInterval(checkConnection, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Registrar handler para notificaciones (solo una vez)
  useEffect(() => {
    console.log('🔌 useWebSocket: Registrando handler de notificaciones');

    const unsubscribe = webSocketService.onNotification((notification) => {
      console.log('🔌 useWebSocket: Notificación recibida', notification);
      setLastNotification(notification);
      // Usar ref para obtener el callback más reciente
      if (onMessageRef.current) {
        onMessageRef.current(notification);
      }
    });

    return () => {
      console.log('🔌 useWebSocket: Desregistrando handler');
      unsubscribe();
    };
  }, []); // Sin dependencias - solo se ejecuta una vez

  // Conectar automáticamente cuando hay usuario
  useEffect(() => {
    if (autoConnect && user && profile) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        console.log('🔌 useWebSocket: Conectando automáticamente...');
        webSocketService.connect(token);
      }
    }
  }, [autoConnect, user, profile]);

  const connect = useCallback(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      webSocketService.connect(token);
    }
  }, []);

  const disconnect = useCallback(() => {
    webSocketService.disconnect();
  }, []);

  const sendMessage = useCallback((data: any) => {
    webSocketService.send(data);
  }, []);

  return {
    isConnected,
    lastMessage: lastNotification, // Alias para compatibilidad
    lastNotification,
    connect,
    disconnect,
    sendMessage,
  };
}

export default useWebSocket;
