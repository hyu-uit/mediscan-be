import { RegisterInput, LoginInput, AuthResponse } from "../types";
export declare function register(data: RegisterInput): Promise<AuthResponse>;
export declare function login(data: LoginInput): Promise<AuthResponse>;
export declare function getMe(userId: string): Promise<{
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    settings: {
        pushNotifications: boolean;
        automatedCalls: boolean;
        darkMode: boolean;
        morningTime: string;
        noonTime: string;
        afternoonTime: string;
        nightTime: string;
        beforeSleepTime: string;
    } | null;
}>;
//# sourceMappingURL=auth.service.d.ts.map