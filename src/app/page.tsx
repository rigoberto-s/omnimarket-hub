import { loginWithGoogle } from "./login/actions";

export default function LoginPage() {
  return (
    <main
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100vh",
      }}
    >
      <form action={loginWithGoogle}>
        <button type="submit">
          Continuar con Google
        </button>
      </form>
    </main>
  );
}