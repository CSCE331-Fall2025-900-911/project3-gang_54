import Image from "next/image";

export default function Home() {
  return (
    <main className="login-container">
      <div className="login-box">
        <p>Choose a method of logging in:</p>
        <br></br>
        <div
          id="g_id_onload"
          data-client_id="YOUR_GOOGLE_CLIENT_ID"
          data-context="signin"
          data-ux_mode="popup"
          data-login_uri="http://localhost:3000/api/auth/google"
          data-auto_prompt="false"
        ></div>

        <div
          className="g_id_signin"
          data-type="standard"
          data-shape="rectangular"
          data-theme="outline"
          data-text="signin_with"
          data-size="large"
          data-logo_alignment="left"
        ></div>
      </div>
    </main>
  );
}
