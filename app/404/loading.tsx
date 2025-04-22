import DollarTransferAnimation from "../components/DollarTransferAnimation"

export default function NotFoundLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <DollarTransferAnimation message="Loading page information..." size="medium" dollarsCount={3} speed="normal" />
    </div>
  )
}
