export const mockChrome = {
  runtime: {
    sendMessage: async (msg: any) => {
      console.log('[Mock Chrome] sendMessage:', msg);
      return { success: true };
    },
    connect: (info: any) => ({
      onMessage: { addListener: () => {} },
      onDisconnect: { addListener: () => {} },
      postMessage: () => {},
      disconnect: () => {}
    }),
    getURL: (path: string) => `/${path}`,
    lastError: null,
    onMessage: {
      addListener: () => {},
      removeListener: () => {},
    }
  },
  storage: {
    local: {
      get: async (key: any) => ({}),
      set: async (items: any) => {},
      remove: async (key: any) => {},
    },
    session: {
      get: async (key: any) => ({}),
      set: async (items: any) => {},
      remove: async (key: any) => {},
    },
    onChanged: {
      addListener: () => {},
      removeListener: () => {},
    }
  },
  tabs: {
    query: async () => [],
    sendMessage: async () => {},
    captureVisibleTab: async () => "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
  }
};

if (typeof window !== 'undefined' && !window.chrome) {
  (window as any).chrome = mockChrome;
}
