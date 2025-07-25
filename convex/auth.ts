import {
  BetterAuth,
  type AuthFunctions,
  type PublicAuthFunctions
} from "@convex-dev/better-auth";
import { v } from "convex/values";
import { api, components, internal } from "./_generated/api";
import type { DataModel, Id } from "./_generated/dataModel";
import { action, query } from "./_generated/server";

// Typesafe way to pass Convex functions defined in this file
const authFunctions: AuthFunctions = internal.auth;
const publicAuthFunctions: PublicAuthFunctions = api.auth;

// Initialize the component
export const betterAuthComponent = new BetterAuth(components.betterAuth, {
  authFunctions,
  publicAuthFunctions
});

// These are required named exports
export const {
  createUser,
  updateUser,
  deleteUser,
  createSession,
  isAuthenticated
} = betterAuthComponent.createAuthFunctions<DataModel>({
  // Must create a user and return the user id
  onCreateUser: async (ctx, _user) => {
    return ctx.db.insert("users", {});
  },

  // Delete the user when they are deleted from Better Auth
  onDeleteUser: async (ctx, userId) => {
    await ctx.db.delete(userId as Id<"users">);
  },

  onCreateSession: async (ctx, session) => {
    const member = await ctx.runQuery(components.betterAuth.lib.findOne, {
      model: "member",
      where: [{ field: "userId", value: session.userId }]
    });
    console.log("NEW SESSION", session, member);
    if (member) {
      session.activeOrganizationId = member.organizationId;
    }
  }
});

// Example function for getting the current user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // Get user data from Better Auth - email, name, image, etc.
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata) {
      return null;
    }
    // Get user data from your application's database
    // (skip this if you have no fields in your users table schema)
    const user = await ctx.db.get(userMetadata.userId as Id<"users">);
    return {
      ...user,
      ...userMetadata
    };
  }
});

// Send reset password email
export const sendResetPasswordEmail = action({
  args: {
    email: v.string(),
    url: v.string()
  },
  handler: async (ctx, { email, url }) => {
    console.log(email, url);
  }
});

export const getActiveOrganization = query({
  args: {
    userId: v.id("users")
  },
  handler: async (ctx, { userId }) => {
    const member = await ctx.db
      .query("member")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    return member?.organizationId;
  }
});
