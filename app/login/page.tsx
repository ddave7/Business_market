import { Suspense } from "react"
import LoginForm from "./login-form"
import DollarTransferAnimation from "../components/DollarTransferAnimation"

export default function LoginPage() {
  return (
    <Suspense fallback={<DollarTransferAnimation message="Loading login form..." />}>
      <LoginForm />
    </Suspense>
  )
}
