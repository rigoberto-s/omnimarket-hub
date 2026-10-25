import { loginWithGoogle, loginWithGitHub, loginTest } from "./actions";

export default function LoginPage() {
  const showTest = process.env.ENABLE_TEST_LOGIN === "true";

  return (
    <main
      style={{
        display: "grid",
        placeItems: "center",
        alignContent: "center",
        gap: 12,
        minHeight: "100vh",
      }}
    >
      <form action={loginWithGoogle}>
        <button type="submit">Continuar con Google</button>
      </form>
      <form action={loginWithGitHub}>
        <button type="submit">Continuar con GitHub</button>
      </form>
      {showTest && (
        <form action={loginTest}>
          <button type="submit">Acceso de prueba</button>
        </form>
      )}
    </main>
  );
}