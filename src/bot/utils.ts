import { Context, Filter } from 'grammy';

export class Utils {
    static async isAdmin(
        ctx: Filter<Context, "message"> | Filter<Context, "callback_query"> | Filter<Context, "channel_post">
    ): Promise<boolean> {
        if (ctx.chat === undefined) {
            return false;
        }

        if (ctx.from === undefined && ctx.chat.type === "channel") {
            // Messages in channels are always from admins and we don't have from to identify them.
            // Always treat channel messages as if they're from admins.
            return true;
        } else if (ctx.from === undefined) {
            return false;
        }

        if (ctx.chat.type === "private") {
            return true;
        }

        const chatMember = await ctx.getChatMember(ctx.from.id);

        if (
            chatMember.status !== "administrator" &&
            chatMember.status !== "creator"
        ) {
            return false;
        }

        return true;
    }
}