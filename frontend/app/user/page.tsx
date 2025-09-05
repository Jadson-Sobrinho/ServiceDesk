"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { User, LogOut, ArrowLeft, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react"

export default function ServiceDeskPage() {
  const BASE = process.env.NEXT_PUBLIC_API_URL
  const [token, setToken] = useState(() => {
    if (typeof window !== "undefined") {
      return window.sessionStorage.getItem("authToken")
    }
    return null
  })
  const [loading, setLoading] = useState(true)
  const effectRan = useRef(false)
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<any>(null)
  const [tickets, setTickets] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [showTicketsList, setShowTicketsList] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [ticketsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    address: "",
    description: "",
    urgency: "",
  })

  async function search() {
    try {
      const response = await fetch(`${BASE}/ticket/user`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      })

      if (!response.ok) {
        throw new Error("Faild to get user ticket.")
      }
      const data = await response.json()
      setTickets(data)
      setCurrentPage(1) // Reset to first page when tickets are refreshed
    } catch (error) {
      console.error(error)
    }
  }

  async function getProfile() {
    try {
      const response = await fetch(`${BASE}/auth/me`, {
        headers: { Authorization: "Bearer " + token },
      })

      if (!response.ok) {
        throw new Error("Faild to search user info.")
      }
      const userInfo = await response.json()
      setUserInfo(userInfo)

      return userInfo
    } catch (error) {
      console.error("Faild to load user info:", error)
    }
  }

  useEffect(() => {
    try {
      getProfile()
      search()
    } catch (error) {
      // qualquer erro na leitura: enviar para login
      console.error("Erro lendo sessionStorage:", error)
      router.replace("/")
      return
    } finally {
      setLoading(false)
    }
  }, [token, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Ticket submitted:", formData)

    try {
      setIsSubmitting(true)
      const response = await fetch(`${BASE}/ticket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      console.log("Ticket created successfully", result)

      //Atualiza a lista de "Meus tickets assim que um ticket é criado"
      await search()
    } catch (error) {
      console.error("Faild to create the ticket:", error)
    } finally {
      setIsSubmitting(false)
    }

    // Reset form and hide it
    setFormData({ address: "", description: "", urgency: "" })
    setShowTicketForm(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Aberto":
        return "bg-gray-300 text-black"
      case "Em andamento":
        return "bg-blue-500 text-white"
      case "Concluído":
        return "bg-green-500 text-white"
      case "Cancelado":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-200 text-black"
    }
  }

  const getUrgencyClass = (urgency_level: string) => {
    switch (urgency_level) {
      case "Crítico":
        return "bg-red-600 text-white"
      case "Alto":
        return "bg-orange-500 text-white"
      case "Médio":
        return "bg-yellow-400 text-black"
      case "Baixo":
        return "bg-gray-200 text-black"
      default:
        return "bg-gray-200 text-black"
    }
  }

  const handleOpenChat = (ticket: any) => {
    router.push(`/chatClient/${ticket._id}`)
  }

  const indexOfLastTicket = currentPage * ticketsPerPage
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage
  const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket)
  const totalPages = Math.ceil(tickets.length / ticketsPerPage)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card-foreground">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold text-muted">CallDesk</h1>

          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setShowTicketsList(true)} className="px-4 py-2">
              Meus Tickets
            </Button>

            {/* User Avatar with Modal */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" className="p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/profile-icon.png?height=32&width=32" />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-lg">User Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder.svg?height=48&width=48" />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{userInfo?.name}</p>
                      <p className="text-sm text-muted-foreground">{userInfo?.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      sessionStorage.removeItem("authToken")
                      window.location.href = "/"
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {showTicketsList ? (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={() => setShowTicketsList(false)} className="text-sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <h2 className="text-2xl font-semibold">Meus Tickets</h2>
              <span className="text-sm text-muted-foreground">
                ({tickets.length} {tickets.length === 1 ? "ticket" : "tickets"})
              </span>
            </div>

            <div className="space-y-4">
              {currentTickets.map((ticket) => (
                <Card key={ticket._id} className="p-4">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{ticket._id}</CardTitle>
                      <div className="flex gap-2">
                        <Badge className={`text-sm px-2 py-1 ${getUrgencyClass(ticket.urgency_level)}`}>
                          {ticket.urgency_level}
                        </Badge>
                        <Badge className={`text-sm px-2 py-1 ${getStatusClass(ticket.status)}`}>{ticket.status}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        <strong>Endereço:</strong> {ticket.address}
                      </p>

                      <p className="text-sm">
                        <strong>Descrição:</strong>
                        <span
                          className="ml-1 inline-block max-w-[20rem] truncate align-middle"
                          title={ticket.description}
                        >
                          {ticket.description}
                        </span>
                      </p>

                      <p className="text-xs text-muted-foreground">Criado em: {ticket.created_at}</p>

                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenChat(ticket)
                          }}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {currentTickets.length === 0 && tickets.length > 0 && (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">Nenhum ticket encontrado nesta página.</p>
                </div>
              )}

              {tickets.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">Você ainda não possui tickets.</p>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0 bg-transparent"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                      className="h-8 w-8 p-0 text-sm"
                    >
                      {pageNumber}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0 bg-transparent"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            )}

            {totalPages > 1 && (
              <div className="text-center mt-3">
                <p className="text-xs text-muted-foreground">
                  Página {currentPage} de {totalPages} • Mostrando {indexOfFirstTicket + 1}-
                  {Math.min(indexOfLastTicket, tickets.length)} de {tickets.length} tickets
                </p>
              </div>
            )}
          </div>
        ) : !showTicketForm ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
            <h2 className="text-3xl font-semibold text-center">Seja bem-vindo ao ServiceDesk</h2>
            <p className="text-muted-foreground text-center max-w-xl text-base leading-relaxed">
              Precisa de ajuda? Abra um ticket de suporte e o nosso time irá resolver seus problemas.
            </p>
            <Button onClick={() => setShowTicketForm(true)} className="mt-6">
              Abrir um Ticket
            </Button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <Card className="p-6">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl">Criar um Ticket</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium">
                      Endereço
                    </Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="Coloque seu endereço e setor/sala"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Descrição
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva seu problema em detalhes..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="urgency_level" className="text-sm font-medium">
                      Nível de urgência
                    </Label>
                    <Select onValueChange={(value) => handleInputChange("urgency_level", value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível de urgência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Baixo">Baixo</SelectItem>
                        <SelectItem value="Médio">Médio</SelectItem>
                        <SelectItem value="Alto">Alto</SelectItem>
                        <SelectItem value="Crítico">Crítico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" className="flex-1">
                      Criar
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowTicketForm(false)} className="flex-1">
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
