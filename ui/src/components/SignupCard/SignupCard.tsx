import React, { useMemo, useState } from 'react';
import { Button, Card, Field, Input, Stack, Box } from "@chakra-ui/react";
import { PasswordInput, PasswordStrengthMeter } from "@/components/ui/password-input";
import { type Options, passwordStrength } from "check-password-strength";
import { useSignup } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export interface SignupCardProps {
  onSuccess?: () => void;
}

const strengthOptions: Options<string> = [
  { id: 1, value: "weak", minDiversity: 0, minLength: 0 },
  { id: 2, value: "medium", minDiversity: 2, minLength: 6 },
  { id: 3, value: "strong", minDiversity: 3, minLength: 8 },
  { id: 4, value: "very-strong", minDiversity: 4, minLength: 10 },
];

const SignupCard: React.FC<SignupCardProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const signupMutation = useSignup();

  const strength = useMemo(() => {
    if (!password) return 0;
    const result = passwordStrength(password, strengthOptions);
    return result.id;
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (strength < 2) {
      setError('Password is too weak. Please choose a stronger password.');
      return;
    }

    try {
      await signupMutation.mutateAsync({ email, password });
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    }
  };

  return (
    <Card.Root maxW="sm" data-testid="signup-form">
      <Card.Header>
        <Card.Title>Sign up</Card.Title>
        <Card.Description>
          Create a new account
        </Card.Description>
      </Card.Header>
      <Card.Body>
        <form onSubmit={handleSubmit}>
          <Stack gap="4" w="full">
            {error && (
              <Box 
                data-testid="signup-form-error"
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
              <Field.Label htmlFor="signup-email">Email</Field.Label>
              <Input
                id="signup-email"
                data-testid="signup-form-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </Field.Root>
            <Field.Root>
              <Field.Label htmlFor="signup-password">Password</Field.Label>
              <PasswordInput
                id="signup-password"
                data-testid="signup-form-password-input"
                onChange={(e) => setPassword(e.currentTarget.value)}
                value={password}
              />
              <PasswordStrengthMeter value={strength} data-testid="signup-form-password-strength" />
            </Field.Root>
            <Field.Root>
              <Field.Label htmlFor="signup-confirm-password">Confirm Password</Field.Label>
              <PasswordInput
                id="signup-confirm-password"
                data-testid="signup-form-confirm-password-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.currentTarget.value)}
              />
            </Field.Root>
          </Stack>
        </form>
      </Card.Body>
      <Card.Footer justifyContent="flex-end">
        <Button
          data-testid="signup-form-cancel-button"
          variant="outline"
          onClick={() => navigate('/login')}
        >
          Cancel
        </Button>
        <Button
          data-testid="signup-form-submit-button"
          type="submit"
          variant="solid"
          onClick={handleSubmit}
          loading={signupMutation.isPending}
        >
          {signupMutation.isPending ? 'Signing up...' : 'Sign up'}
        </Button>
      </Card.Footer>
    </Card.Root>
  );
};

export default SignupCard;
