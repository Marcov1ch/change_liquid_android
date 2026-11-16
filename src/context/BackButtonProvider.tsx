/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from 'react';
import { App as CapacitorApp } from '@capacitor/app';

type BackHandler = () => boolean;

const BackHandlerContext = createContext<(handler: BackHandler) => () => void>(() => () => undefined);

export function BackButtonProvider({ children }: { children: ReactNode }) {
  const handlersRef = useRef<BackHandler[]>([]);

  const push = useCallback((handler: BackHandler) => {
    handlersRef.current.push(handler);
    return () => {
      const index = handlersRef.current.lastIndexOf(handler);
      if (index >= 0) handlersRef.current.splice(index, 1);
    };
  }, []);

  useEffect(() => {
    let remove: (() => void) | undefined;
    CapacitorApp.addListener('backButton', () => {
      const handler = handlersRef.current[handlersRef.current.length - 1];
      if (handler && handler()) return;
      if (window.history.length > 1) {
        window.history.back();
      } else {
        void CapacitorApp.exitApp().catch(() => undefined);
      }
    })
      .then(listener => {
        remove = () => {
          void listener.remove();
        };
      })
      .catch(() => undefined);

    return () => remove?.();
  }, []);

  return <BackHandlerContext.Provider value={push}>{children}</BackHandlerContext.Provider>;
}

export function useBackHandler(handler: BackHandler, enabled = true) {
  const push = useContext(BackHandlerContext);
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;
    return push(() => handlerRef.current());
  }, [enabled, push]);
}
