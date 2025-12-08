import React from 'react';
import { Container, Box, VStack } from '@chakra-ui/react';
import SignupCard from '@/components/SignupCard/SignupCard';
import { useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/login');
  };

  return (
    <Container maxW="container.sm" py={8}>
      <VStack gap={8} align="stretch">
        <Box display="flex" justifyContent="center" alignItems="center" minH="60vh">
          <SignupCard onSuccess={handleSuccess} />
        </Box>
      </VStack>
    </Container>
  );
};

export default Signup;

