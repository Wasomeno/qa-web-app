import React, { useState } from 'react';
import {
  List,
  Pin,
  PlusCircle,
  SquareKanban,
  Home,
  Video,
  ClipboardList,
  Wrench,
  LogOut,
  Loader2,
  FolderTree,
} from 'lucide-react';
import { Link, useLocation } from '@tanstack/react-router';
import { useSession } from '@/contexts/session-context';
import { useLogout } from '@/hooks/use-logout';
import { cn } from '@/lib/utils';

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
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';

function FlowGLogo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 46"
      fill="none"
      className={className}
    >
      <path
        fill="currentColor"
        d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
      />
    </svg>
  );
}

interface NavItem {
  id: string;
  path: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { id: 'agent', path: '/', label: 'Homepage', icon: Home, exact: true },
      { id: 'issues', path: '/issues', label: 'Issues', icon: List },
      { id: 'boards', path: '/boards', label: 'Issue Boards', icon: SquareKanban },
    ],
  },
  {
    label: 'Tools',
    items: [
      { id: 'recordings', path: '/recordings', label: 'Recordings', icon: Video },
      { id: 'test-scenarios', path: '/test-scenarios', label: 'Test Scenarios', icon: ClipboardList },
      { id: 'fix-sessions', path: '/fix-sessions', label: 'Fix Sessions', icon: Wrench },
      { id: 'specs', path: '/specs', label: 'Specs', icon: FolderTree },
    ],
  },
  {
    label: 'Personal',
    items: [
      { id: 'pinned', path: '/pinned', label: 'Pinned Issues', icon: Pin },
    ],
  },
];

function isRouteActive(locationPath: string, item: NavItem): boolean {
  if (item.exact) return locationPath === item.path;
  return (
    locationPath === item.path || locationPath.startsWith(item.path + '/')
  );
}

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();
  const session = useSession();
  const user = session?.user;
  const logoutMutation = useLogout();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div ref={setContainer} className="fixed inset-0 flex flex-col bg-white">
      <div className="flex flex-1 overflow-hidden">
        <SidebarProvider
          style={{ minHeight: '100%' }}
          className="h-full w-full"
          portalContainer={container}
        >
          <Sidebar collapsible="icon">
            {/* Header */}
            <SidebarHeader className="px-3 py-3">
              <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
                <Link
                  to="/"
                  className="flex items-center gap-2.5 overflow-hidden group-data-[collapsible=icon]:hidden"
                >
                  <FlowGLogo className="h-6 w-6 shrink-0 text-zinc-500" />
                  <span className="text-lg font-bold tracking-tight text-gray-900">
                    FlowG
                  </span>
                </Link>
                <SidebarTrigger className="ml-auto group-data-[collapsible=icon]:ml-0" />
              </div>
            </SidebarHeader>

            {/* Navigation */}
            <SidebarContent className="gap-0">
              {NAV_GROUPS.map(group => (
                <SidebarGroup key={group.label} className="py-1.5">
                  <div className="px-3 pb-1.5 pt-1 group-data-[collapsible=icon]:hidden">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      {group.label}
                    </span>
                  </div>
                  <SidebarGroupContent>
                    <SidebarMenu className="gap-0.5 px-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
                      {group.items.map(item => {
                        const Icon = item.icon;
                        const isActive = isRouteActive(
                          location.pathname,
                          item
                        );

                        return (
                          <SidebarMenuItem key={item.id}>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive}
                              tooltip={item.label}
                              className={cn(
                                'relative h-9 transition-colors',
                                isActive &&
                                  'bg-zinc-50/80 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-700'
                              )}
                            >
                              <Link to={item.path}>
                                {isActive && (
                                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-zinc-500" />
                                )}
                                <Icon
                                  className={cn(
                                    'shrink-0',
                                    isActive
                                      ? 'text-zinc-500'
                                      : 'text-gray-500'
                                  )}
                                />
                                <span
                                  className={cn(
                                    isActive
                                      ? 'font-semibold text-zinc-700'
                                      : 'font-medium text-gray-700'
                                  )}
                                >
                                  {item.label}
                                </span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}

              {/* Create Issue CTA */}
              <SidebarGroup className="py-2">
                <SidebarGroupContent className="px-2">
                  <SidebarMenu className="gap-0.5 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === '/create-issue'}
                        tooltip="Create Issue"
                        className={cn(
                          'relative h-9 transition-colors',
                          location.pathname === '/create-issue' &&
                            'bg-zinc-50/80 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-700'
                        )}
                      >
                        <Link to="/create-issue">
                          {location.pathname === '/create-issue' && (
                            <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-zinc-500" />
                          )}
                          <PlusCircle
                            className={cn(
                              'shrink-0',
                              location.pathname === '/create-issue'
                                ? 'text-zinc-500'
                                : 'text-gray-500'
                            )}
                          />
                          <span
                            className={cn(
                              location.pathname === '/create-issue'
                                ? 'font-semibold text-zinc-700'
                                : 'font-medium text-gray-700'
                            )}
                          >
                            Create Issue
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            {/* Footer — Download Extension CTA */}
            <div className="px-4 py-2 mt-auto border-t border-gray-100 group-data-[collapsible=icon]:hidden">
              <div className="rounded-xl bg-zinc-50 p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <FlowGLogo className="w-16 h-16" />
                </div>
                <div className="relative z-10">
                  <h4 className="text-sm font-semibold text-zinc-900 mb-1">Get the Extension</h4>
                  <p className="text-xs text-zinc-700 mb-3 leading-relaxed">
                    Download FlowG extension to capture your QA sessions effortlessly.
                  </p>
                  <a 
                    href={import.meta.env.VITE_EXTENSION_DOWNLOAD_URL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    download
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-1"
                  >
                    Download FlowG
                  </a>
                </div>
              </div>
            </div>

            {/* Collapsed state Download Extension CTA */}
            <div className="hidden border-t border-gray-100 py-3 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
              <a 
                href={import.meta.env.VITE_EXTENSION_DOWNLOAD_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                download
                title="Download FlowG Extension"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 text-zinc-600 transition-colors hover:bg-zinc-100"
              >
                <FlowGLogo className="h-4 w-4" />
              </a>
            </div>

            {/* Footer — User & Logout */}
            <SidebarFooter className="border-t border-gray-100 p-3">
              <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:hidden">
                <Link to="/profile" className="relative shrink-0">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name || user.username}
                      className="h-8 w-8 rounded-lg object-cover ring-1 ring-black/5"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white ring-1 ring-black/5">
                      <span className="text-xs font-semibold">
                        {(user?.name || user?.username || 'U')
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                  )}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link to="/profile" className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-gray-900">
                      {user?.name || user?.username || 'Guest'}
                    </span>
                    <span className="block truncate text-xs text-gray-500">
                      {user ? `@${user.username}` : 'Not logged in'}
                    </span>
                  </Link>
                </div>
                <button
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                  title="Logout"
                >
                  {logoutMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Collapsed state: just avatar + logout */}
              <div className="hidden flex-col items-center gap-2 group-data-[collapsible=icon]:flex">
                <Link to="/profile">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name || user.username}
                      className="h-8 w-8 rounded-lg object-cover ring-1 ring-black/5"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white">
                      <span className="text-xs font-semibold">
                        {(user?.name || user?.username || 'U')
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                  )}
                </Link>
                <button
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                  title="Logout"
                >
                  {logoutMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                </button>
              </div>
            </SidebarFooter>

            <SidebarRail />
          </Sidebar>

          {/* Content Area */}
          <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
            {children}
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
};
