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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    // Get active team details if activeTeamId exists
    let activeTeam = null;
    if (customUserData?.activeTeamId) {
      const team = await ctx.runQuery(components.betterAuth.lib.findOne, {
        model: "team",
        where: [{ field: "id", value: customUserData.activeTeamId }]
      });
      if (team) {
        activeTeam = {
          id: team.id,
          name: team.name
        };
      }
    }

    // Better Auth user data takes precedence since we update it directly
    return {
      id: userMetadata.id,
      email: userMetadata.email,
      name: userMetadata.name, // Use Better Auth name (updated by our mutation)
      image: userMetadata.image, // Use Better Auth image (updated by our mutation)
      phone: userMetadata.phoneNumber, // Use Better Auth phoneNumber
      isOnboardingComplete: customUserData?.isOnboardingComplete || false,
      activeTeamId: customUserData?.activeTeamId || null, // Include active team ID
      activeTeam: activeTeam, // Include active team details
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

// Mutation to update the active team for the user
export const updateActiveTeam = mutation({
  args: {
    teamId: v.string()
  },
  handler: async (ctx, { teamId }) => {
    // Get the current user
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata) {
      throw new Error("No active session found");
    }

    const userId = userMetadata.userId as Id<"users">;
    const user = await ctx.db.get(userId);

    if (!user) {
      console.log("USER NOT FOUND", userId);
      throw new Error("User not found");
    }

    await ctx.db.patch(userId, {
      activeTeamId: teamId
    });

    return { success: true, activeTeamId: teamId };
  }
});

// Mutation to clear the active team (set to null)
export const clearActiveTeam = mutation({
  args: {},
  handler: async (ctx) => {
    // Get the current user
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata) {
      throw new Error("No active session found");
    }

    const userId = userMetadata.userId as Id<"users">;
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(userId, {
      activeTeamId: undefined
    });

    return { success: true };
  }
});

// Mutation to set the active organization and clear active team
export const setActiveOrganization = mutation({
  args: {
    organizationId: v.string()
  },
  handler: async (ctx, { organizationId }) => {
    // Get the current session
    const session = await ctx.runQuery(
      components.betterAuth.lib.getCurrentSession
    );

    if (!session.token) {
      throw new Error("No active session found");
    }

    // Get the current user
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata) {
      throw new Error("No active session found");
    }

    // First clear the active team since we're switching organizations
    const userId = userMetadata.userId as Id<"users">;
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(userId, {
      activeTeamId: undefined
    });

    // Update the session with the new active organization
    await ctx.runMutation(components.betterAuth.lib.updateOne, {
      input: {
        model: "session",
        where: [{ field: "token", value: session.token }],
        update: {
          activeOrganizationId: organizationId
        }
      }
    });

    return { success: true, organizationId, teamCleared: true };
  }
});

// Query to get teams with member counts for the current organization
export const getTeamsWithMembers = query({
  args: {},
  handler: async (ctx) => {
    try {
      const session = await ctx.runQuery(
        components.betterAuth.lib.getCurrentSession
      );

      if (!session || !session.token) {
        return []; // Return empty array if no session instead of throwing error
      }

      // Use provided organizationId or get from session
      const targetOrgId = session.activeOrganizationId;
      console.log("TARGET ORG ID", targetOrgId);

      if (!targetOrgId) {
        return [];
      }

      const teamsResult = await ctx.runQuery(
        components.betterAuth.lib.findMany,
        {
          model: "team",
          where: [{ field: "organizationId", value: targetOrgId }],
          paginationOpts: {
            cursor: null,
            numItems: 20
          }
        }
      );

      const teams = teamsResult?.page || [];
      console.log("Raw teams data:", teams);

      // Get member count for each team and return full team data
      const teamsWithMembers = await Promise.all(
        teams.map(
          async (team: {
            _id: string;
            name: string;
            organizationId: string;
            createdAt: number;
          }) => {
            try {
              console.log("Processing team:", {
                id: team._id,
                name: team.name
              });

              const membersResult = await ctx.runQuery(
                components.betterAuth.lib.findMany,
                {
                  model: "member",
                  where: [{ field: "teamId", value: team._id }],
                  paginationOpts: {
                    cursor: null,
                    numItems: 1000 // Large number to get all members effectively
                  }
                }
              );

              // Extract members from the paginated result
              const members = membersResult?.page || [];
              const memberCount = Array.isArray(members) ? members.length : 0;

              // Ensure all fields are properly typed and not undefined
              const teamWithMembers = {
                id: team._id, // Remove || "" to ensure we get the actual ID
                name: team.name || "",
                organizationId: team.organizationId || "",
                createdAt: team.createdAt || 0,
                members: memberCount
              };

              console.log("Team with members:", teamWithMembers);
              return teamWithMembers;
            } catch (memberError) {
              console.error(
                `Error getting members for team ${team._id}:`,
                memberError
              );
              // Return team data with 0 members if member query fails
              const fallbackTeam = {
                id: team._id, // Remove || "" to ensure we get the actual ID
                name: team.name || "",
                organizationId: team.organizationId || "",
                createdAt: team.createdAt || 0,
                members: 0
              };
              console.log("Fallback team:", fallbackTeam);
              return fallbackTeam;
            }
          }
        )
      );

      return teamsWithMembers;
    } catch (error) {
      console.error("Error in getTeamsWithMembers:", error);
      return []; // Return empty array on any error to prevent UI crashes
    }
  }
});

// Simpler debug query to test if the issue is with the main query
export const getTeamsSimple = query({
  args: {},
  handler: async (ctx) => {
    try {
      const session = await ctx.runQuery(
        components.betterAuth.lib.getCurrentSession
      );

      if (!session || !session.token) {
        return [];
      }

      const targetOrgId = session.activeOrganizationId;

      if (!targetOrgId) {
        return [];
      }

      return [
        {
          id: "test-1",
          name: "Test Team 1",
          organizationId: targetOrgId,
          createdAt: Date.now(),
          members: 2
        },
        {
          id: "test-2",
          name: "Test Team 2",
          organizationId: targetOrgId,
          createdAt: Date.now(),
          members: 5
        }
      ];
    } catch (error) {
      console.error("Error in getTeamsSimple:", error);
      return [];
    }
  }
});

// Mutation to add a member to a team
export const addMemberToTeam = mutation({
  args: {
    memberId: v.string(),
    teamId: v.string()
  },
  handler: async (ctx, { memberId, teamId }) => {
    try {
      console.log("=== ADD MEMBER TO TEAM DEBUG ===");
      console.log("Input params:", { memberId, teamId });

      const session = await ctx.runQuery(
        components.betterAuth.lib.getCurrentSession
      );
      console.log("Session data:", {
        hasSession: !!session,
        hasToken: !!session?.token,
        activeOrganizationId: session?.activeOrganizationId
      });

      if (!session || !session.token) {
        throw new Error("Not authenticated");
      }

      // Verify the team exists and belongs to the current organization
      console.log("Looking up team with ID:", teamId);
      const team = await ctx.runQuery(components.betterAuth.lib.findOne, {
        model: "team",
        where: [{ field: "id", value: teamId }]
      });
      console.log("Team found:", team);

      if (!team) {
        throw new Error("Team not found");
      }

      // Verify the member exists and belongs to the same organization
      console.log("Looking up member with ID:", memberId);
      const member = await ctx.runQuery(components.betterAuth.lib.findOne, {
        model: "member",
        where: [{ field: "id", value: memberId }]
      });
      console.log("Member found:", member);

      if (!member) {
        throw new Error("Member not found");
      }

      console.log("Organization comparison:");
      console.log("- Member organization ID:", member.organizationId);
      console.log("- Team organization ID:", team.organizationId);
      console.log(
        "- Session active organization ID:",
        session.activeOrganizationId
      );
      console.log(
        "- Organizations match:",
        member.organizationId === team.organizationId
      );

      if (member.organizationId !== team.organizationId) {
        console.error("ORGANIZATION MISMATCH!");
        console.error("Member belongs to:", member.organizationId);
        console.error("Team belongs to:", team.organizationId);
        throw new Error("Member and team must belong to the same organization");
      }

      // Update the member to add them to the team
      console.log("Updating member to add to team...");
      await ctx.runMutation(components.betterAuth.lib.updateOne, {
        input: {
          model: "member",
          where: [{ field: "id", value: memberId }],
          update: {
            teamId: teamId
          }
        }
      });

      console.log("Successfully added member to team!");
      return { success: true, memberId, teamId };
    } catch (error) {
      console.error("Error adding member to team:", error);
      throw error;
    }
  }
});
