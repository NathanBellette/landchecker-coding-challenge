import React, { useMemo } from 'react';
import { Container, Tabs, HStack, Button, Box } from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLogout, getToken } from '@/hooks/useAuth';
import type { TabChangeDetails } from '@/interfaces';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useLogout();
  const token = getToken();

  const currentTab = useMemo(() => {
    if (location.pathname === '/watchlist') {
      return 'watchlist';
    }
    if (location.pathname.startsWith('/properties/')) {
      const sourceTab = (location.state as { sourceTab?: string })?.sourceTab;
      return sourceTab === 'watchlist' ? 'watchlist' : 'properties';
    }
    return 'properties';
  }, [location.pathname, location.state]);

  const handleTabChange = (details: TabChangeDetails) => {
    if (details.value === 'watchlist') {
      navigate('/watchlist');
    } else {
      navigate('/');
    }
  };

  const handleLogout = async () => {
    await logout.mutateAsync();
    navigate('/login');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  return (
    <Container maxW="container.xl" py={4} data-testid="layout-container">
      <HStack justifyContent="space-between" mb={6}>
        <Tabs.Root value={currentTab} onValueChange={handleTabChange} data-testid="layout-tabs">
          <Tabs.List>
            <Tabs.Trigger value="properties" data-testid="layout-tab-properties">
              All Properties
            </Tabs.Trigger>
            <Tabs.Trigger value="watchlist" data-testid="layout-tab-watchlist">
              My Watchlist
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
        {token ? (
          <Button
            data-testid="layout-logout-button"
            variant="outline"
            size="sm"
            onClick={handleLogout}
            loading={logout.isPending}
          >
            Logout
          </Button>
        ) : (
          <HStack gap={2}>
            <Button
              data-testid="layout-login-button"
              variant="ghost"
              size="sm"
              onClick={handleLoginClick}
            >
              Log In
            </Button>
            <Button
              data-testid="layout-signup-button"
              variant="outline"
              size="sm"
              onClick={handleSignupClick}
            >
              Sign Up
            </Button>
          </HStack>
        )}
      </HStack>
      <Box>{children}</Box>
    </Container>
  );
};

export default Layout;

