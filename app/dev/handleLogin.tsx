import { router } from "expo-router"; // or "next/router" for web

const handleLogin = (inputEmail: string, inputPassword: string) => {
  console.log("Login button pressed");

  // Hardcoded user data with all 6 combinations
  const users = [
    // Players
    {
      email: "cricketplayer@example.com",
      password: "cricket123",
      role: "player",
      type: "cricket"
    },
    {
      email: "marathonplayer@example.com",
      password: "marathon123",
      role: "player",
      type: "marathon"
    },

    // Ground Owners
    {
      email: "cricketowner@example.com",
      password: "owner123",
      role: "groundowner",
      type: "cricket"
    },
    {
      email: "marathonowner@example.com",
      password: "owner456",
      role: "groundowner",
      type: "marathon"
    },

    // Organizers
    {
      email: "cricketorganizer@example.com",
      password: "organizer123",
      role: "organizer",
      type: "cricket"
    },
    {
      email: "marathonorganizer@example.com",
      password: "organizer456",
      role: "organizer",
      type: "marathon"
    }
  ];

  // Authenticate user
  const user = users.find(
    (u) => u.email === inputEmail && u.password === inputPassword
  );

  if (!user) {
    console.log("Invalid credentials");
    alert("Invalid email or password");
    return;
  }

  // Navigate to the dashboard route
  const { role, type } = user;
  const route = `/dashboard/${role}/${type}`;
  console.log(`Redirecting to ${route}`);
  router.push(route as any);
};

export default handleLogin;