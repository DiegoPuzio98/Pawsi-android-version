import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ConsentAlertProps {
  fieldValue: string;
  fieldType: 'phone' | 'address';
}

export function ConsentAlert({ fieldValue, fieldType }: ConsentAlertProps) {
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    setShowAlert(fieldValue.length > 0);
  }, [fieldValue]);

  if (!showAlert) return null;

  const message = fieldType === 'phone' 
    ? "Al completar este campo, consientes que la información sea visible públicamente."
    : "Al completar este campo, consientes que la información sea visible públicamente.";

  return (
    <Alert className="mt-2 border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800 text-sm">
        {message}
      </AlertDescription>
    </Alert>
  );
}