import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import {
    getFirestore,
    Timestamp,
    FieldValue,
} from "firebase-admin/firestore";
import {
    formatISODate,
    getNowInBrasilia,
} from "../shared/period";

const N8N_MUAGRA_SECRET = defineSecret("N8N_MUAGRA_SECRET");

export const incrementMuagraFromN8n = onRequest(
    { secrets: [N8N_MUAGRA_SECRET] },
    async (request, response) => {
        if (request.method !== "POST") {
            response.status(405).json({
                success: false,
                error: "Method not allowed",
            });
            return;
        }

        const authorization = request.get("authorization") ?? "";
        const expectedAuthorization =
            `Bearer ${N8N_MUAGRA_SECRET.value()}`;

        if (authorization !== expectedAuthorization) {
            response.status(401).json({
                success: false,
                error: "Unauthorized",
            });
            return;
        }

        const { userId, message } = request.body ?? {};

        if (typeof userId !== "string" || userId.trim() === "") {
            response.status(400).json({
                success: false,
                error: "userId is required",
            });
            return;
        }

        if (typeof message !== "string" || message.trim() === "") {
            response.status(400).json({
                success: false,
                error: "message is required",
            });
            return;
        }

        const cleanUserId = userId.trim();
        const todayKey = formatISODate(getNowInBrasilia());

        const db = getFirestore();

        const userCounterRef = db
            .collection("users")
            .doc(cleanUserId)
            .collection("dailyCounters")
            .doc(todayKey);

        const globalCounterRef = db
            .collection("GlobalCounter")
            .doc("global_counter");

        const userCount = await db.runTransaction(async (transaction) => {
            const userCounterSnap =
                await transaction.get(userCounterRef);

            const globalCounterSnap =
                await transaction.get(globalCounterRef);

            // Incrementa o contador do usuário
            if (!userCounterSnap.exists) {
                transaction.set(userCounterRef, {
                    value: 1,
                    dateKey: todayKey,
                    updatedAt: Timestamp.now(),
                    comment: "",
                });
            } else {
                transaction.update(userCounterRef, {
                    value: FieldValue.increment(1),
                    updatedAt: Timestamp.now(),
                });
            }

            // Incrementa o contador global
            if (!globalCounterSnap.exists) {
                transaction.set(globalCounterRef, {
                    value: 1,
                });
            } else {
                transaction.update(globalCounterRef, {
                    value: FieldValue.increment(1),
                });
            }

            if (!userCounterSnap.exists) {
                return 1;
            }

            const data = userCounterSnap.data() as {
                value: number;
            };

            return data.value + 1;
        });

        response.status(200).json({
            success: true,
            userId: cleanUserId,
            dateKey: todayKey,
            userCount,
            messageProcessed: true,
        });
    },
);