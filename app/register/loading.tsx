import DollarTransferAnimation from "../components/DollarTransferAnimation"

export default function RegisterLoading() {
  return (
    <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[50vh]">
      <DollarTransferAnimation message="Loading registration page..." size="large" dollarsCount={3} />
    </div>
  )
}
