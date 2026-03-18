const handleLoginSuccess = async (credentialResponse: CredentialResponse) => {
  if (!credentialResponse.credential) {
    console.error("No credential received");
    return;
  }

<<<<<<< HEAD
import toast from "react-hot-toast";

export default function LoginPage() {

  const googleButtonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8080";

  const handleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      console.error("No credential received");
      return;
    }

    try {
      const response = await axios.post(
        `${apiBaseUrl}/api/auth/google`,
        {
          idToken: credentialResponse.credential
        },
        {
          withCredentials: true
        }
      );

      // Store token for Authorization header
      if (response.data?.data?.token) {
        localStorage.setItem("authToken", response.data.data.token);
=======
  try {
    // Send token to backend
    const response = await axios.post(
      `${apiBaseUrl}/api/auth/google`,
      {
        idToken: credentialResponse.credential,
      },
      {
        withCredentials: true,
>>>>>>> 34f5774c13b1a94b7fe723523661861673fc4b17
      }
    );

<<<<<<< HEAD
      // Decode JWT to extract user info
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
      toast.success("Login successful!");
      router.push("/student-dashboard");

    } catch (error) {
      console.error("Login failed:", error);
      if (axios.isAxiosError(error)) {
        toast.error(`Login failed: ${error.message}. Please check if the server is running at ${apiBaseUrl}`);
      } else {
        toast.error("An unexpected error occurred during login.");
      }
=======
    // Store auth token
    if (response.data?.data?.token) {
      localStorage.setItem("authToken", response.data.data.token);
>>>>>>> 34f5774c13b1a94b7fe723523661861673fc4b17
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