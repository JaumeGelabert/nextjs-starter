import { convexAdapter } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { type GenericCtx } from "../convex/_generated/server";
import { betterAuthComponent } from "../convex/auth";
import { nextCookies } from "better-auth/next-js";
import resend from "./resend";
import { organization } from "better-auth/plugins";
import { components } from "../convex/_generated/api";
import { ac, member, admin, owner } from "./permissions";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const createAuth = (ctx: GenericCtx) =>
  betterAuth({
    baseURL: siteUrl,
    database: convexAdapter(ctx, betterAuthComponent),
    trustedOrigins: ["http://localhost:3000"],
    databaseHooks: {
      session: {
        create: {
          before: async (session) => {
            const member = await ctx.runQuery(
              components.betterAuth.lib.findOne,
              {
                model: "member",
                where: [{ field: "userId", value: session.userId }]
              }
            );
            return {
              data: {
                ...session,
                activeOrganizationId: member?.organizationId
              }
            };
          }
        }
      }
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      autoSignIn: true,
      sendResetPassword: async ({ user, url }) => {
        console.log("sendResetPassword", user.email, url);
        await resend.emails.send({
          from: "Uprio <uprio@auth.tryuprio.com>",
          to: [user.email],
          subject: "Reset your password",
          html: `
            <h3>Reset your password</h3>
            <p>Click <a href="${url}">here</a> to reset your password.</p>
            <p>This link will expire in 15 minutes.</p>
          `
        });
      }
    },
    plugins: [
      nextCookies(),
      convex(),
      organization({
        ac,
        roles: {
          owner,
          admin,
          member
        }
      })
    ]
  });
