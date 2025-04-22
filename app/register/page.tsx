import { Suspense } from "react"
import RegisterForm from "./register-form"
import DollarTransferAnimation from "../components/DollarTransferAnimation"

export default function RegisterPage() {
  return (
    <Suspense fallback={<DollarTransferAnimation message="Loading registration form..." />}>
      <RegisterForm />
    </Suspense>
  )
}
