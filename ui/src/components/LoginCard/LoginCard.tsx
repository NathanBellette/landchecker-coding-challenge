import React, { useState } from 'react';
import { Button, Card, Field, Input, Stack, Box } from "@chakra-ui/react";
import { useLogin } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export interface LoginCardProps {
  onSuccess?: () => void;
}

const LoginCard: React.FC<LoginCardProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await loginMutation.mutateAsync({ email, password });
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <Card.Root maxW="sm" minW="sm" data-testid="login-form">
      <Card.Header>
        <Card.Title>Login</Card.Title>
        <Card.Description>
          Please login below
        </Card.Description>
      </Card.Header>
      <Card.Body>
        <form onSubmit={handleSubmit}>
          <Stack gap="4" w="full">
            {error && (
              <Box 
                data-testid="login-form-error"
                p={3} 
                bg="red.50" 
                borderRadius="md" 
                color="red.600" 
                fontSize="sm"
              >
                {error}
              </Box>
            )}
            <Field.Root>
              <Field.Label htmlFor="email">Email</Field.Label>
              <Input
                id="email"
                data-testid="login-form-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </Field.Root>
            <Field.Root>
              <Field.Label htmlFor="password">Password</Field.Label>
              <Input
                id="password"
                data-testid="login-form-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </Field.Root>
          </Stack>
        </form>
      </Card.Body>
      <Card.Footer justifyContent="flex-end">
        <Button
          data-testid="login-form-signup-button"
          variant="outline"
          onClick={() => navigate('/signup')}
        >
          Sign Up
        </Button>
        <Button
          data-testid="login-form-submit-button"
          type="submit"
          variant="solid"
          onClick={handleSubmit}
          loading={loginMutation.isPending}
          loadingText="Logging in..."
          minW="120px"
        >
          Log in
        </Button>
      </Card.Footer>
    </Card.Root>
  );
};

export default LoginCard;
