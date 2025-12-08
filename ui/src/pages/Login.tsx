import React from 'react';
import { Container, Box, VStack } from '@chakra-ui/react';
import LoginCard from '@/components/LoginCard/LoginCard';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/');
  };

  return (
    <Container maxW="container.sm" py={8}>
      <VStack gap={8} align="stretch">
        <Box display="flex" justifyContent="center" alignItems="center" minH="60vh">
          <LoginCard onSuccess={handleSuccess} />
        </Box>
      </VStack>
    </Container>
  );
};

export default Login;

