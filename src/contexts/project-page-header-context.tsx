import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface PageHeaderState {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

interface PageHeaderContextValue {
  header: PageHeaderState;
  setHeader: (header: PageHeaderState) => void;
}

const PageHeaderContext = createContext<PageHeaderContextValue | undefined>(undefined);

export const PageHeaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [header, setHeaderState] = useState<PageHeaderState>({ title: '' });

  const setHeader = useCallback((h: PageHeaderState) => {
    setHeaderState(h);
  }, []);

  return (
    <PageHeaderContext.Provider value={{ header, setHeader }}>
      {children}
    </PageHeaderContext.Provider>
  );
};

export const usePageHeader = () => {
  const context = useContext(PageHeaderContext);
  if (!context) {
    throw new Error('usePageHeader must be used within a PageHeaderProvider');
  }
  return context;
};
