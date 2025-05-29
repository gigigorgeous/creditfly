"use client"

import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import { RapidApiValidator, type ApiKeyValidationResult } from "@/lib/rapidapi-validation"

interface ApiKeyBannerProps {
  title?: string
  description?: string
}

export function ApiKeyBanner({
  title = "RapidAPI Key",
  description = "Enter your RapidAPI key to start using the API.",
}: ApiKeyBannerProps) {
  const { toast } = useToast()
  const [validationResult, setValidationResult] = useState<ApiKeyValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const validateApiKey = async (keyToValidate?: string) => {
    setIsValidating(true)
    try {
      let result: ApiKeyValidationResult

      if (keyToValidate) {
        result = await RapidApiValidator.validateApiKey(keyToValidate)
      } else {
        result = await RapidApiValidator.validateServerApiKey()
      }

      setValidationResult(result)

      if (result.valid) {
        toast({
          title: "API Key Valid",
          description: result.message || "Your RapidAPI key is working correctly!",
        })
      } else {
        toast({
          title: "API Key Invalid",
          description: result.error || "Please check your API key configuration.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Failed to validate API key. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {validationResult && (
          <div
            className={`mt-2 p-2 rounded text-sm ${
              validationResult.valid
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {validationResult.valid ? (
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                {validationResult.message}
                {validationResult.accountsCount !== undefined && (
                  <span className="ml-2">({validationResult.accountsCount} accounts available)</span>
                )}
              </div>
            ) : (
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {validationResult.error}
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>{/* Add your API key input or other relevant content here */}</CardContent>
      <CardFooter>
        <Button variant="outline" onClick={() => validateApiKey()} disabled={isValidating} className="mr-2">
          {isValidating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Test API Key
            </>
          )}
        </Button>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  )
}
