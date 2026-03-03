import { Button } from "@/components/ui/button"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import Link from "next/link"

const Login = () => {
  return (
    <div>
      <SignedOut>
        <SignInButton
        signUpFallbackRedirectUrl={"/dashboard"}
        signUpForceRedirectUrl={"/dashboard"}
        oauthFlow="popup"
        mode="modal">
          <Button className="shadow-xl animate-bounce cursor-pointer bg-green-500">Sign In</Button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <Link href="/dashboard">
          <Button variant="default" size="lg" className="shadow-xl animate-bounce cursor-pointer bg-green-500">Go to Dashboard</Button>
        </Link>
      </SignedIn>

    </div>
  )
}

export default Login
