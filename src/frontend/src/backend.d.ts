import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BanRecord {
    permanent: boolean;
    timestamp: Time;
    reason: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface UserUsageStats {
    dailyScans: bigint;
    lastResetTime: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface SubscriptionUpdate {
    status: SubscriptionStatus;
    expiresAt?: bigint;
    stripeSubscriptionId?: string;
}
export interface UserProfile {
    name: string;
    email?: string;
    stripeCustomerId?: string;
    encryptedExtraSomething?: Uint8Array;
}
export enum SubscriptionStatus {
    free = "free",
    proMonthly = "proMonthly",
    proAnnual = "proAnnual"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    authenticateUser(authToken: string): Promise<boolean>;
    banUser(principal: Principal, reason: string): Promise<void>;
    banUserForMediaTheft(reason: string): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    getBanStatus(principal: Principal): Promise<BanRecord | null>;
    getCallerSubscription(): Promise<SubscriptionUpdate | null>;
    getCallerUsageStats(): Promise<UserUsageStats | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getProducts(): Promise<Array<{
        id: string;
        name: string;
        description: string;
        priceId: string;
    }>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    incrementDailyScans(): Promise<void>;
    isBanned(principal: Principal): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    resetFreeTierUsage(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    trackAppOpen(): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    unbanUser(principal: Principal): Promise<void>;
    updateCallerSubscription(subscription: SubscriptionUpdate): Promise<void>;
}
