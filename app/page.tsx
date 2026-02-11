import { Button } from "@/components/ui/button"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import Link from "next/link"

const Home = () => {
  return (
    <div className="flex text-center flex-col items-center justify-center w-full gap-8 container">
      <SignedOut>
        <SignInButton
        signUpFallbackRedirectUrl={"/dashboard"}
        signUpForceRedirectUrl={"/dashboard"}
        oauthFlow="popup"
        mode="modal">
          <Button>Login with Google</Button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <Link href="/dashboard">
          <Button variant="default" size="lg">Go to Dashboard</Button>
        </Link>
      </SignedIn>

    </div>
  )
}

export default Home
