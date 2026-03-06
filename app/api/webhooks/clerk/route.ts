import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import {prisma} from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // const secret = process.env.SIGNING_SECRET
    // if(!secret) return new Response("Missing secret", {status: 500})

    const evt = await verifyWebhook(req);
    const { id } = evt.data;
    const eventType = evt.type;
    console.log(
      `Received webhook with ID ${id} and event type of ${eventType}`
    );
    switch (eventType) {
      case "user.created":
        await prisma.user.create({
          data: {
            clerkId: evt.data.id,
            email: evt.data.email_addresses[0].email_address,
            name: `${evt.data.first_name} ${evt.data.last_name}`,
          },
        })
        console.log("User created successfully")
        break;
      case "user.updated":
        await prisma.user.update({
          where: { clerkId: evt.data.id },
          data: {
            email: evt.data.email_addresses[0].email_address,
            name: `${evt.data.first_name} ${evt.data.last_name}`,
          },
        })
        break;
      case "user.deleted":
        await prisma.user.delete({
          where: {clerkId: evt.data.id}
        })
        break;

      default:
        console.log("Unhandled event type: ", eventType);
        break;
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}