import {
  AuthClient,
  type AuthClientCreateOptions,
  type AuthClientLoginOptions,
} from "@dfinity/auth-client";
import type { Identity } from "@icp-sdk/core/agent";
import { DelegationIdentity, isDelegationValid } from "@icp-sdk/core/identity";
import {
  type PropsWithChildren,
  type ReactNode,
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Status =
  | "initializing"
  | "idle"
  | "logging-in"
  | "success"
  | "loginError";

export type InternetIdentityContext = {
  identity?: Identity;
  login: () => void;
  clear: () => void;
  loginStatus: Status;
  isInitializing: boolean;
  isLoginIdle: boolean;
  isLoggingIn: boolean;
  isLoginSuccess: boolean;
  isLoginError: boolean;
  loginError?: Error;
};

const ONE_HOUR_IN_NANOSECONDS = BigInt("3600000000000");
const DEFAULT_IDENTITY_PROVIDER = "https://identity.ic0.app";

const InternetIdentityReactContext = createContext<InternetIdentityContext | undefined>(undefined);

async function createAuthClient(options?: AuthClientCreateOptions): Promise<AuthClient> {
  return await AuthClient.create({
    idleOptions: {
      disableDefaultIdleCallback: true,
      disableIdle: true,
      ...options?.idleOptions,
    },
    ...options,
  });
}

export const useInternetIdentity = () => {
  const context = useContext(InternetIdentityReactContext);
  if (!context) throw new Error("InternetIdentityProvider not found.");
  return context;
};

export function InternetIdentityProvider({ children, createOptions }: PropsWithChildren<{ createOptions?: AuthClientCreateOptions }>) {
  const [authClient, setAuthClient] = useState<AuthClient | undefined>(undefined);
  const [identity, setIdentity] = useState<Identity | undefined>(undefined);
  const [loginStatus, setStatus] = useState<Status>("idle");
  const [loginError, setError] = useState<Error | undefined>(undefined);

  const handleLoginSuccess = useCallback(() => {
    if (authClient) {
      setIdentity(authClient.getIdentity());
      setStatus("success");
    }
  }, [authClient]);

  const login = useCallback(() => {
    if (!authClient) return;
    setStatus("logging-in");
    authClient.login({
      identityProvider: DEFAULT_IDENTITY_PROVIDER,
      derivationOrigin: "https://gut-punch.vercel.app",
      onSuccess: handleLoginSuccess,
      onError: (err) => {
        setStatus("loginError");
        setError(new Error(err ?? "Login failed"));
      },
      maxTimeToLive: ONE_HOUR_IN_NANOSECONDS * BigInt("720"),
    });
  }, [authClient, handleLoginSuccess]);

  const clear = useCallback(() => {
    if (authClient) {
      authClient.logout().then(() => {
        setIdentity(undefined);
        setStatus("idle");
      });
    }
  }, [authClient]);

  useEffect(() => {
    let active = true;
    createAuthClient(createOptions).then(async (client) => {
      if (!active) return;
      setAuthClient(client);
      const authed = await client.isAuthenticated();
      if (authed && active) {
        setIdentity(client.getIdentity());
        setStatus("success");
      }
    }).catch(err => {
      if (active) {
        setStatus("loginError");
        setError(err instanceof Error ? err : new Error("Init failed"));
      }
    });
    return () => { active = false; };
  }, [createOptions]);

  const value = useMemo(() => ({
    identity, login, clear, loginStatus,
    isInitializing: loginStatus === "initializing",
    isLoginIdle: loginStatus === "idle",
    isLoggingIn: loginStatus === "logging-in",
    isLoginSuccess: loginStatus === "success",
    isLoginError: loginStatus === "loginError",
    loginError,
  }), [identity, login, clear, loginStatus, loginError]);

  return createElement(InternetIdentityReactContext.Provider, { value, children });
}
