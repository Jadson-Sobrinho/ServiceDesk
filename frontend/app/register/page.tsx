"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, User, Mail, Lock, LockKeyhole, PhoneCall, PhoneIcon } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const BASE = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rule: "user",
    phone_number: "",
    hashed_password: "",
    repeatPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nome completo é obrigatório"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Por favor, insira um email valido"
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Telefone é obrigatório"
    } else if (!/^(\+\d{1,3})?\s?(\(\d{2}\)|\d{2})?\s?\d{4,5}[-\s]?\d{4}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Por favor, insira um número valido"
    }

    if (!formData.hashed_password) {
      newErrors.hashed_password = "A senha é obrigatória"
    } else if (formData.hashed_password.length < 6) {
      newErrors.hashed_password = "A senha deve possuir no mínimo 6 characteres"
    }

    if (!formData.repeatPassword) {
      newErrors.repeatPassword = "Repita sua senha"
    } else if (formData.hashed_password !== formData.repeatPassword) {
      newErrors.repeatPassword = "As senhas não combinam"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      console.log("Registration data:", formData)
      const {repeatPassword, ...dataToSend} = formData;
        try {
          const response = await fetch(`${BASE}/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend)
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ${response.status}: ${errorText}`);
          }

          const user = await response.json();
          
          if (response.ok) {
            router.replace("/")
          }
        } catch (error) {
          console.error("Faild to sing in:", error);
        }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-lg shadow-2xl border-0">
        <CardHeader className="space-y-2 text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">Criar Conta</CardTitle>
          <CardDescription className="text-lg text-gray-600">Crie uma conta para acessar aos recusos</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Field */}
            <div className="space-y-3">
              <Label htmlFor="name" className="text-base font-medium text-gray-700">
                Nome Completo
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`pl-12 h-14 text-lg ${errors.name ? "border-red-500" : ""}`}
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div className="space-y-3">
              <Label htmlFor="email" className="text-base font-medium text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`pl-12 h-14 text-lg ${errors.email ? "border-red-500" : ""}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Phone number Field */}
            <div className="space-y-3">
              <Label htmlFor="phone_number" className="text-base font-medium text-gray-700">
                Telefone
              </Label>
              <div className="relative">
                <PhoneIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="phone_number"
                  type="number"
                  placeholder="Digite seu número de telefone"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange("phone_number", e.target.value)}
                  className={`pl-12 h-14 text-lg ${errors.phone_number ? "border-red-500" : ""}`}
                />
              </div>
              {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <Label htmlFor="hashed_password" className="text-base font-medium text-gray-700">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="hashed_password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Crie uma senha"
                  value={formData.hashed_password}
                  onChange={(e) => handleInputChange("hashed_password", e.target.value)}
                  className={`pl-12 pr-12 h-14 text-lg ${errors.hashed_password ? "border-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.hashed_password && <p className="text-red-500 text-sm mt-1">{errors.hashed_password}</p>}
            </div>

            {/* Repeat Password Field */}
            <div className="space-y-3">
              <Label htmlFor="repeatPassword" className="text-base font-medium text-gray-700">
                Digite a senha novamente
              </Label>
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="repeatPassword"
                  type={showRepeatPassword ? "text" : "password"}
                  placeholder="Digite novamente sua senha"
                  value={formData.repeatPassword}
                  onChange={(e) => handleInputChange("repeatPassword", e.target.value)}
                  className={`pl-12 pr-12 h-14 text-lg ${errors.repeatPassword ? "border-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showRepeatPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.repeatPassword && <p className="text-red-500 text-sm mt-1">{errors.repeatPassword}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Criar conta
            </Button>
          </form>

          <div className="text-center pt-4">
            <p className="text-gray-600 text-base">
              Já possui uma conta?{" "}
              <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold">
                Faça login aqui
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}