import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface ProjectSidebarState {
  projectId: string;
  projectName: string;
  issueRepoName: string;
  specsRepoName: string;
}

interface ProjectSidebarContextValue {
  project: ProjectSidebarState | null;
  setProject: (project: ProjectSidebarState | null) => void;
}

const ProjectSidebarContext = createContext<ProjectSidebarContextValue | undefined>(undefined);

export const ProjectSidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [project, setProjectState] = useState<ProjectSidebarState | null>(null);

  const setProject = useCallback((p: ProjectSidebarState | null) => {
    setProjectState(p);
  }, []);

  return (
    <ProjectSidebarContext.Provider value={{ project, setProject }}>
      {children}
    </ProjectSidebarContext.Provider>
  );
};

export const useProjectSidebar = () => {
  const context = useContext(ProjectSidebarContext);
  if (!context) {
    throw new Error('useProjectSidebar must be used within a ProjectSidebarProvider');
  }
  return context;
};
