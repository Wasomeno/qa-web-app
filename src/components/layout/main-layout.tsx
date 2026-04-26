import React, { useState } from 'react';
import {
  List,
  Pin,
  PlusCircle,
  SquareKanban,
  Home,
  FileText as FileIcon,
  Wrench,
  Settings,
} from 'lucide-react';
import { Link, useLocation } from '@tanstack/react-router';
import { useSessionUser } from '@/hooks/use-session-user';

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarRail,
} from '@/components/ui/sidebar';

const MENU_ITEMS = [
  { id: 'agent', path: '/', label: 'Homepage', icon: Home },
  { id: 'issues', path: '/issues', label: 'Issues', icon: List },
  { id: 'boards', path: '/boards', label: 'Issue Boards', icon: SquareKanban },
  { id: 'pinned', path: '/pinned', label: 'Pinned Issues', icon: Pin },
  { id: 'fix-sessions', path: '/fix-sessions', label: 'Fix Sessions', icon: Wrench },
  { id: 'recordings', path: '/recordings', label: 'Recordings', icon: FileIcon },
  { id: 'test-scenarios', path: '/test-scenarios', label: 'Test Scenarios', icon: FileIcon },
  { id: 'create-issue', path: '/create-issue', label: 'Create Issue', icon: PlusCircle },
];

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user } = useSessionUser();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div ref={setContainer} className="fixed inset-0 flex flex-col bg-white">
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        <SidebarProvider
          style={{ minHeight: '100%' }}
          className="h-full w-full !min-h-0"
          portalContainer={container}
        >
          <Sidebar
            collapsible="icon"
            className="!absolute !h-full border-r border-gray-200/60"
          >
            <SidebarHeader>
              <div className="flex items-center justify-between px-2 py-2">
                <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                  <span className="text-lg font-bold text-primary-600">FlowG</span>
                </div>
                <div className="flex items-center gap-1">
                  <SidebarTrigger className="ml-0" />
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {MENU_ITEMS.map(item => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;

                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={item.label}
                          >
                            <Link to={item.path}>
                              <Icon />
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Link to="/profile">
                      {user?.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.name || user.username}
                          className="h-8 w-8 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                          <span className="text-xs font-medium">
                            {(user?.name || user?.username || 'U')
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {user?.name || user?.username || 'Guest User'}
                        </span>
                        <span className="truncate text-xs">
                          {user ? `@${user.username}` : 'Not logged in'}
                        </span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
              <div className="px-4 py-2 group-data-[collapsible=icon]:hidden">
                <p className="text-xs text-gray-400">v1.0.0</p>
              </div>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>

          {/* Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background relative">
            {children}
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
};
