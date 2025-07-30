import {
  BetterAuth,
  type AuthFunctions,
  type PublicAuthFunctions
} from "@convex-dev/better-auth";
import { v } from "convex/values";
import { api, components, internal } from "./_generated/api";
import type { DataModel, Id } from "./_generated/dataModel";
import { action, mutation, query } from "./_generated/server";

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

    // Get user data from your application's database for custom fields
    const customUserData = await ctx.db.get(userMetadata.userId as Id<"users">);

    // Better Auth user data takes precedence since we update it directly
    return {
      id: userMetadata.id,
      email: userMetadata.email,
      name: userMetadata.name, // Use Better Auth name (updated by our mutation)
      image: userMetadata.image, // Use Better Auth image (updated by our mutation)
      phone: userMetadata.phoneNumber, // Use Better Auth phoneNumber
      isOnboardingComplete: customUserData?.isOnboardingComplete || false,
      // Include any other Better Auth fields
      ...userMetadata,
      // Include any other custom fields that aren't in Better Auth
      ...(customUserData && {
        customField1: customUserData.name, // Keep custom fields if needed
        customField2: customUserData.phone,
        customField3: customUserData.imageUrl
      })
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

export const updateUserOnboarding = mutation({
  args: {
    name: v.string(),
    phone: v.optional(v.string()),
    imageUrl: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { name, phone, imageUrl } = args;
    const session = await ctx.runQuery(
      components.betterAuth.lib.getCurrentSession
    );
    if (!session.userId) {
      throw new Error("Invalid user identity");
    }
    await ctx.runMutation(components.betterAuth.lib.updateOne, {
      input: {
        model: "user",
        where: [{ field: "id", value: session.userId as string }],
        update: {
          name: name,
          phoneNumber: phone || undefined,
          image: imageUrl || undefined
        }
      }
    });
    return {
      success: true,
      userId: session.userId,
      updatedFields: { name, phone, imageUrl }
    };
  }
});
