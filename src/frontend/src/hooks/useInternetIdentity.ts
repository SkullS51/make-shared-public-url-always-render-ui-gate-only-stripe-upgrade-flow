import {
  AuthClient,
  type AuthClientCreateOptions,
  type AuthClientLoginOptions,
} from "@icp-sdk/auth";
import type { Identity } from "@icp-sdk/core/agent";
import {
  DelegationIdentity,
  isDelegationValid,
} from "@icp-sdk/core/identity";
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

type ProviderValue = InternetIdentityContext;

const InternetIdentityReactContext = createContext<ProviderValue | undefined>(
  undefined,
);

async function createAuthClient(
  createOptions?: AuthClientCreateOptions,
): Promise<AuthClient> {
  const options: AuthClientCreateOptions = {
    idleOptions: {
      disableDefaultIdleCallback: true,
      disableIdle: true,
      ...createOptions?.idleOptions,
    },
    ...createOptions,
  };
  return await AuthClient.create(options);
}

function assertProviderPresent(
  context: ProviderValue | undefined,
): asserts context is ProviderValue {
  if (!context) {
    throw new Error(
      "InternetIdentityProvider is not present. Wrap your component tree with it.",
    );
  }
}

export const useInternetIdentity = (): InternetIdentityContext => {
  const context = useContext(InternetIdentityReactContext);
  assertProviderPresent(context);
  return context;
};

export function InternetIdentityProvider({
  children,
  createOptions,
  derivationOrigin,
}: PropsWithChildren<{
  children: ReactNode;
  createOptions?: AuthClientCreateOptions;
  derivationOrigin?: string;
}>) {
  const [authClient, setAuthClient] = useState<AuthClient | undefined>(
    undefined,
  );
  const [identity, setIdentity] = useState<Identity | undefined>(undefined);
  const [loginStatus, setLoginStatus] = useState<Status>("idle");
  const [loginError, setLoginError] = useState<Error | undefined>(undefined);

  const setErrorMessage = useCallback((message: string) => {
    setLoginStatus("loginError");
    setLoginError(new Error(message));
  }, []);

  const handleLoginSuccess = useCallback(() => {
    if (!authClient) return;
    const latestIdentity = authClient.getIdentity();
    setIdentity(latestIdentity);
    setLoginStatus("success");
  }, [authClient]);

  const handleLoginError = useCallback(
    (maybeError?: string) => {
      setErrorMessage(maybeError ?? "Login failed");
    },
    [setErrorMessage],
  );

  const login = useCallback(() => {
    if (!authClient) {
      setErrorMessage("AuthClient is not initialized yet.");
      return;
    }

    // Clear previous error state before new attempt
    setLoginError(undefined);

    const options: AuthClientLoginOptions = {
      identityProvider: DEFAULT_IDENTITY_PROVIDER,
      derivationOrigin:
        derivationOrigin ?? "https://gut-punch.vercel.app",
      onSuccess: handleLoginSuccess,
      onError: handleLoginError,
      maxTimeToLive: ONE_HOUR_IN_NANOSECONDS * BigInt("720"), // 30 days
    };

    setLoginStatus("logging-in");
    void authClient.login(options);
  }, [
    authClient,
    handleLoginError,
    handleLoginSuccess,
    setErrorMessage,
    derivationOrigin,
  ]);

  const clear = useCallback(() => {
    if (!authClient) return;
    void authClient.logout().then(() => {
      setIdentity(undefined);
      setLoginStatus("idle");
      setLoginError(undefined);
    });
  }, [authClient]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        setLoginStatus("initializing");
        const client = await createAuthClient(createOptions);
        if (cancelled) return;

        setAuthClient(client);
        const authenticated = await client.isAuthenticated();
        const currentIdentity = client.getIdentity();

        // Validate delegation chain if present
        if (
          authenticated &&
          currentIdentity instanceof DelegationIdentity
        ) {
          if (!isDelegationValid(currentIdentity.getDelegation())) {
            await client.logout();
            if (!cancelled) {
              setLoginStatus("idle");
            }
            return;
          }
        }

        if (authenticated && !cancelled) {
          setIdentity(currentIdentity);
          setLoginStatus("success");
        } else if (!cancelled) {
          setLoginStatus("idle");
        }
      } catch (e) {
        if (!cancelled) {
          setLoginStatus("loginError");
          setLoginError(
            e instanceof Error ? e : new Error("Init failed"),
          );
        }
      }
    };

    void init();

    return () => {
      cancelled = true;
    };
  }, [createOptions]);

  const value = useMemo<ProviderValue>(
    () => ({
      identity,
      login,
      clear,
      loginStatus,
      isInitializing: loginStatus === "initializing",
      isLoginIdle: loginStatus === "idle",
      isLoggingIn: loginStatus === "logging-in",
      isLoginSuccess: loginStatus === "success",
      isLoginError: loginStatus === "loginError",
      loginError,
    }),
    [identity, login, clear, loginStatus, loginError],
  );

  return createElement(InternetIdentityReactContext.Provider, {
    value,
    children,
  });
}
