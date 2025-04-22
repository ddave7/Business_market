import DollarTransferAnimation from "../components/DollarTransferAnimation"

export default function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
      <DollarTransferAnimation message="Loading products..." size="large" dollarsCount={5} speed="normal" />
    </div>
  )
}
