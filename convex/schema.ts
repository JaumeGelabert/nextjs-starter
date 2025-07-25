import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    // Fields are optional
  }),

  // Organization table
  organization: defineTable({
    name: v.string(),
    slug: v.string(),
    logo: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(), // timestamp
    updatedAt: v.optional(v.number()) // timestamp
  }).index("by_slug", ["slug"]),

  // Member table - links users to organizations with roles
  member: defineTable({
    userId: v.id("users"),
    organizationId: v.id("organization"),
    role: v.string(), // e.g., "owner", "admin", "member"
    createdAt: v.number() // timestamp
  })
    .index("by_user", ["userId"])
    .index("by_organization", ["organizationId"])
    .index("by_user_organization", ["userId", "organizationId"]),

  // Invitation table - manages pending invites
  invitation: defineTable({
    email: v.string(),
    inviterId: v.id("users"),
    organizationId: v.id("organization"),
    role: v.string(),
    status: v.string(), // e.g., "pending", "accepted", "rejected", "cancelled"
    expiresAt: v.number(), // timestamp
    createdAt: v.number(), // timestamp
    teamId: v.optional(v.id("team")) // optional team assignment
  })
    .index("by_email", ["email"])
    .index("by_organization", ["organizationId"])
    .index("by_inviter", ["inviterId"])
    .index("by_status", ["status"]),

  // Session table - stores user sessions with active organization/team
  session: defineTable({
    userId: v.id("users"),
    sessionToken: v.string(),
    activeOrganizationId: v.optional(v.id("organization")),
    activeTeamId: v.optional(v.id("team")),
    expiresAt: v.number(), // timestamp
    createdAt: v.number(), // timestamp
    updatedAt: v.optional(v.number()) // timestamp
  })
    .index("by_user", ["userId"])
    .index("by_token", ["sessionToken"])
    .index("by_active_organization", ["activeOrganizationId"]),

  // Team table (optional) - sub-teams within organizations
  team: defineTable({
    name: v.string(),
    organizationId: v.id("organization"),
    createdAt: v.number(), // timestamp
    updatedAt: v.optional(v.number()) // timestamp
  }).index("by_organization", ["organizationId"]),

  // Team Member table (optional) - links users to teams
  teamMember: defineTable({
    teamId: v.id("team"),
    userId: v.id("users"),
    createdAt: v.number() // timestamp
  })
    .index("by_team", ["teamId"])
    .index("by_user", ["userId"])
    .index("by_team_user", ["teamId", "userId"])
});
