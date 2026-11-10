import { getFirestore } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

const N8N_MUAGRA_SECRET = defineSecret("N8N_MUAGRA_SECRET");

export const findUserByPhoneNumber = onRequest(
    { secrets: [N8N_MUAGRA_SECRET] },
    async (req, res) => {
        if (req.method !== "POST") {
            res.status(405).json({ error: "Method not allowed" });
            return;
        }

        try {
            const authHeader = req.headers.authorization;
            const expectedSecret = N8N_MUAGRA_SECRET.value();

            if (
                !expectedSecret ||
                authHeader !== `Bearer ${expectedSecret}`
            ) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }

            const rawPhoneNumber = req.body?.phoneNumber;

            if (
                typeof rawPhoneNumber !== "string" ||
                !rawPhoneNumber.trim()
            ) {
                res.status(400).json({
                    error: "phoneNumber is required",
                });
                return;
            }

            const digits = rawPhoneNumber.replace(/\D/g, "");
            const phoneNumber = `+${digits}`;

            const snapshot = await getFirestore()
                .collection("users")
                .where("phoneNumber", "==", phoneNumber)
                .limit(2)
                .get();

            if (snapshot.empty) {
                res.status(404).json({ error: "User not found" });
                return;
            }

            if (snapshot.size > 1) {
                res.status(409).json({
                    error: "Multiple users found for phoneNumber",
                });
                return;
            }

            res.status(200).json({
                userId: snapshot.docs[0].id,
            });
        } catch (error) {
            console.error(
                "Error finding user by phone number:",
                error
            );

            res.status(500).json({
                error: "Internal server error",
            });
        }
    }
);
