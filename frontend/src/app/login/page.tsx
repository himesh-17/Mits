const handleLoginSuccess = async (credentialResponse: CredentialResponse) => {
  if (!credentialResponse.credential) {
    console.error("No credential received");
    return;
  }

  try {
    // Send token to backend
    const response = await axios.post(
      `${apiBaseUrl}/api/auth/google`,
      {
        idToken: credentialResponse.credential,
      },
      {
        withCredentials: true,
      }
    );

    // Store auth token
    if (response.data?.data?.token) {
      localStorage.setItem("authToken", response.data.data.token);
    }

    // Decode JWT for user info (frontend use)
    const payload = decodeJwtPayload(credentialResponse.credential);

    if (payload) {
      const userInfo = {
        name: (payload.name as string) || "",
        email: (payload.email as string) || "",
        picture: (payload.picture as string) || "",
      };

      localStorage.setItem("googleUserInfo", JSON.stringify(userInfo));
    }

    console.log("Login Success");

    router.push("/student-dashboard");
  } catch (error) {
    console.error("Login failed:", error);
  }
};