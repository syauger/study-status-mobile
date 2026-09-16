import { useMutation } from "@tanstack/react-query";
import { Button, Card, Input, Label, TextField } from "heroui-native";
import { useRef, useState } from "react";
import { Text } from "react-native";

import { authClient } from "@/lib/auth-client";

export const AuthForm = ({
  onAuthenticated,
}: {
  onAuthenticated: () => void;
}) => {
  const [register, setRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const submitting = useRef(false);
  const mutation = useMutation({
    mutationFn: async () => {
      const credentials = { email: email.trim(), password };
      const result = register
        ? await authClient.signUp.email({ ...credentials, name: name.trim() })
        : await authClient.signIn.email(credentials);
      if (result.error) {
        throw new Error(
          result.error.message ?? "Unable to sign in. Please try again."
        );
      }
      const session = await authClient.getSession();
      if (session.error || !session.data) {
        throw new Error(
          "We couldn’t confirm your session. Please sign in again."
        );
      }
    },
    retry: false,
    onSuccess: onAuthenticated,
  });
  const submit = async () => {
    if (submitting.current) {
      return;
    }
    submitting.current = true;
    try {
      await mutation.mutateAsync();
    } catch {
      // Keep the form and display the authentication error below.
    }
    submitting.current = false;
  };
  const actionLabel = register ? "Register" : "Sign in";
  const valid =
    email.trim().includes("@") &&
    password.length >= 8 &&
    (!register || !!name.trim());
  return (
    <Card className="gap-5 p-5">
      <Card.Title>{register ? "Create your account" : "Sign in"}</Card.Title>
      {register ? (
        <TextField isRequired isDisabled={mutation.isPending}>
          <Label>Name</Label>
          <Input
            accessibilityLabel="Name"
            value={name}
            onChangeText={setName}
            autoComplete="name"
            maxLength={100}
            placeholder="Your name"
          />
          <Text className="text-muted text-xs">
            This name appears on your reports.
          </Text>
        </TextField>
      ) : null}
      <TextField isRequired isDisabled={mutation.isPending}>
        <Label>Email</Label>
        <Input
          accessibilityLabel="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          keyboardType="email-address"
          placeholder="you@example.com"
        />
      </TextField>
      <TextField isRequired isDisabled={mutation.isPending}>
        <Label>Password</Label>
        <Input
          accessibilityLabel="Password"
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={register ? "new-password" : "current-password"}
          secureTextEntry={!showPassword}
          maxLength={128}
          placeholder="At least 8 characters"
        />
        <Button
          variant="ghost"
          size="sm"
          className="self-end"
          isDisabled={mutation.isPending}
          onPress={() => setShowPassword((value) => !value)}
        >
          {showPassword ? "Hide password" : "Show password"}
        </Button>
      </TextField>
      {mutation.isError ? (
        <Text accessibilityRole="alert" className="text-danger">
          {mutation.error.message}
        </Text>
      ) : null}
      <Button
        isDisabled={!valid || mutation.isPending}
        onPress={() => {
          void submit();
        }}
      >
        {mutation.isPending ? "Please wait…" : actionLabel}
      </Button>
      <Button
        variant="ghost"
        isDisabled={mutation.isPending}
        onPress={() => {
          setRegister((value) => !value);
          mutation.reset();
        }}
      >
        {register ? "Already have an account? Sign in" : "New here? Register"}
      </Button>
    </Card>
  );
};
