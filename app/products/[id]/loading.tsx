import DollarTransferAnimation from "../../components/DollarTransferAnimation"

export default function ProductLoading() {
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[50vh]">
      <DollarTransferAnimation message="Loading product details..." size="large" dollarsCount={3} />
    </div>
  )
}
