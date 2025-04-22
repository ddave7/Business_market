import { Label as ShadcnLabel } from "@/components/ui/label"

export function Label({ htmlFor, children, className = "" }) {
  return (
    <ShadcnLabel htmlFor={htmlFor} className={className}>
      {children}
    </ShadcnLabel>
  )
}
