import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DailyTotalView {
    date: string;
    productQuantities: Array<[string, bigint]>;
    totalRevenue: bigint;
}
export interface UserProfile {
    name: string;
    billPrintLocation: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getBalanceSheet(): Promise<Array<[string, DailyTotalView]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDailyTotal(date: string): Promise<DailyTotalView | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveDailyTotal(date: string, totalRevenue: bigint, productQuantities: Array<[string, bigint]>): Promise<void>;
}
