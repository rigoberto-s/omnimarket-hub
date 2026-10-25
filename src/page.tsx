import { auth, signOut } from "@/auth";

export default async function Dashboard() {
  const session = await auth();

  return (
    <main style={{ padding: 24 }}>
      <h1>Hola, {session?.user?.name}</h1>
      <p>{session?.user?.email}</p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button type="submit">Cerrar sesión</button>
      </form>
    </main>
  );
}