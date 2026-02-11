import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import {prisma} from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);
    const { id } = evt.data;
    const eventType = evt.type;
    console.log(
      `Received webhook with ID ${id} and event type of ${eventType}`
    );

    // if (eventType === "user.created") {
    //   const { id, email_addresses, first_name, last_name } = evt.data;
    //   await prisma.user.upsert({
    //     where: { clerkId: id },
    //     update: {},
    //     create: {
    //       clerkId: id,
    //       email: email_addresses[0].email_address,
    //       name: `${first_name} ${last_name}`,
    //     },
    //   });
    // }
    switch (eventType) {
      case "user.created":
        await prisma.user.create({
          data: {
            clerkId: evt.data.id,
            email: evt.data.email_addresses[0].email_address,
            name: `${evt.data.first_name} ${evt.data.last_name}`,
          },
        })
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