import { db } from "../firebase/config";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

const users = [
  {
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
  },
  {
    email: "venu@gmail.com",
    name: "Venu",
    role: "mentor",
  },
  {
    email: "mayur@gmail.com",
    name: "Mayur",
    role: "mentor",
  },
];

export async function setupUsers() {
  try {
    const usersRef = collection(db, "users");

    for (const user of users) {
      // Check if user already exists
      const q = query(usersRef, where("email", "==", user.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Add user if they don't exist
        await addDoc(usersRef, {
          ...user,
          createdAt: new Date(),
        });
        console.log(`Created user: ${user.email}`);
      } else {
        console.log(`User already exists: ${user.email}`);
      }
    }

    console.log("Users setup completed");
  } catch (error) {
    console.error("Error setting up users:", error);
  }
}
