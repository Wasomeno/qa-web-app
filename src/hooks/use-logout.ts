import { logout } from '@/api/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/contexts/session-context';
import { clearSessionId } from '@/utils/session';

export function useLogout() {
  const queryClient = useQueryClient();
  const session = useSession();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: async () => {
      // Clear web app session ID
      clearSessionId();
      
      // Clear local session state
      if (session) {
        await session.clearUser();
      }

      // Clear all queries in cache
      queryClient.clear();
      
      // Notify other tabs of logout
      window.dispatchEvent(new Event('auth_logout'));
    },
    onError: (error) => {
      console.error('Logout failed', error);
    },
  });
}
