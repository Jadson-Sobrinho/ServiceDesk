"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldX, ArrowLeft, Home } from "lucide-react"
import Link from "next/link"


export default function UnauthorizedPage() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-4xl font-semibold text-balance">Acesso negado</CardTitle>
          <CardDescription className="text-muted-foreground text-pretty text-lg">
            Você não tem acesso a esta página. Se você acha que isto é um erro, entre em contato com um administrador.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Button
              onClick={() => router.replace("/")}
              className="gap-2 text-lg"
            >
              <Home className="h-4 w-4" />
              Fazer Login
            </Button>
          <p className="text-base text-muted-foreground">Error Code: 401 - Unauthorized</p>
        </CardContent>
      </Card>
    </div>
  )
}
