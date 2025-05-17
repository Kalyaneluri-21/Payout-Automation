import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import dayjs from "./dayjs-config";

export const updateSessionStatuses = async () => {
  try {
    const now = dayjs().tz("Asia/Kolkata");
    const sessionsRef = collection(db, "sessions");

    // Query only for scheduled sessions first
    const q = query(sessionsRef, where("status", "==", "Scheduled"));

    const querySnapshot = await getDocs(q);
    const updatePromises = [];

    querySnapshot.forEach((docSnapshot) => {
      const sessionData = docSnapshot.data();
      const sessionDateTime = dayjs(sessionData.dateTime.toDate()).tz(
        "Asia/Kolkata"
      );

      // Check if session time has passed
      if (sessionDateTime.isBefore(now)) {
        console.log(
          `Session time ${sessionDateTime.format(
            "YYYY-MM-DD HH:mm:ss"
          )} has passed current time ${now.format("YYYY-MM-DD HH:mm:ss")}`
        );
        console.log(`Updating session status to Completed: ${docSnapshot.id}`);
        updatePromises.push(
          updateDoc(doc(db, "sessions", docSnapshot.id), {
            status: "Completed",
            lastUpdated: Timestamp.now(),
          })
        );
      } else {
        console.log(
          `Session time ${sessionDateTime.format(
            "YYYY-MM-DD HH:mm:ss"
          )} has not passed current time ${now.format("YYYY-MM-DD HH:mm:ss")}`
        );
      }
    });

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
      console.log(
        `Updated ${updatePromises.length} sessions to Completed status`
      );
    } else {
      console.log("No sessions need to be updated");
    }

    return updatePromises.length;
  } catch (error) {
    console.error("Error updating session statuses:", error);
    throw error;
  }
};
