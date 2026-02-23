/**
 * Vestora Frontend — Profile service.
 * Handles user profile CRUD operations.
 */

import { api } from "./api";
import type { User, ProfileUpdateRequest } from "@/types/user";

export const profileService = {
  getProfile: () => api.get<User>("/users/profile"),

  updateProfile: (data: ProfileUpdateRequest) =>
    api.patch<User>("/users/profile", data),
};
