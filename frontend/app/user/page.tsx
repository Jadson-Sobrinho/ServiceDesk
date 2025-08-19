"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { User, LogOut, ArrowLeft } from "lucide-react"


export default function ServiceDeskPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [showTicketsList, setShowTicketsList] = useState(false)
  const [formData, setFormData] = useState({
    address: "",
    description: "",
    urgency: "",
  })


  useEffect(() => {
    async function search() {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch("http://localhost:3001/ticket/user", {
            headers: {
              'Authorization': 'Bearer ' + token 
            }
          }
        );

        if(!response.ok) {
          console.log("Erro ao buscar tickets do usuario");
        }
        const data = await response.json();
        console.log(data);
        setTickets(data);   
      } catch (error) {
        console.error(error);
      }
    }
  search();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Ticket submitted:", formData)

    try {
      const token = localStorage.getItem('authToken');
      setIsSubmitting(true);
      const response = await fetch("http://localhost:3001/ticket", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
        
      }

      const result = await response.json();
      console.log("Ticket created successfully", result)
      
    } catch (error) {
      console.error("Faild to create the ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  

    // Reset form and hide it
    setFormData({ address: "", description: "", urgency: "" })
    setShowTicketForm(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Aberto":
        return "destructive"
      case "Em andamento":
        return "default"
      case "Concluído":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getUrgencyVariant = (urgency_level: string) => {
    switch (urgency_level) {
      case "Crítico":
        return "destructive"
      case "Alto":
        return "destructive"
      case "Médio":
        return "default"
      case "Baixo":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="flex items-center justify-between px-8 py-6">
          <h1 className="text-3xl font-semibold text-foreground">ServiceDeskBA</h1>

          <div className="flex items-center gap-6">
            <Button variant="outline" onClick={() => setShowTicketsList(true)} size="lg" className="text-base">
              Meus Tickets
            </Button>

            {/* User Avatar with Modal */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" className="p-0">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg?height=48&width=48" />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl">User Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="/placeholder.svg?height=64&width=64" />
                      <AvatarFallback>
                        <User className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-lg">John Doe</p>
                      <p className="text-base text-muted-foreground">john.doe@company.com</p>
                    </div>
                  </div>
                  <Button variant="destructive" className="w-full text-base" size="lg">
                    <LogOut className="mr-2 h-5 w-5" />
                    Logout
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-8 py-12">
        {showTicketsList ? (
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-6 mb-8">
              <Button variant="ghost" onClick={() => setShowTicketsList(false)} size="lg" className="text-base">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Voltar
              </Button>
              <h2 className="text-4xl font-semibold">Meus Tickets</h2>
            </div>

            <div className="space-y-6">
              {tickets.map((ticket) => (
                <Card key={ticket._id} className="p-2">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl">{ticket._id}</CardTitle>
                      <div className="flex gap-3">
                        <Badge variant={getUrgencyVariant(ticket.urgency_level)} className="text-sm px-3 py-1">
                          {ticket.urgency_level}
                        </Badge>
                        <Badge variant={getStatusVariant(ticket.status)} className="text-sm px-3 py-1">
                          {ticket.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-base text-muted-foreground">
                        <strong>Endereço:</strong> {ticket.address}
                      </p>
                      <p className="text-base">
                        <strong>Descrição:</strong> {ticket.description}
                      </p>
                      <p className="text-sm text-muted-foreground">Criado em: {ticket.created_At}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : !showTicketForm ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            <h2 className="text-5xl font-semibold text-center">Seja bem-vindo ao ServiceDesk</h2>
            <p className="text-muted-foreground text-center max-w-2xl text-xl leading-relaxed">
              Precisa de ajuda? Abra um ticket de suporte e o nosso time irá resolver seus problemas.
            </p>
            <Button onClick={() => setShowTicketForm(true)} size="lg" className="mt-8 text-lg px-8 py-4 h-auto">
              Abrir um Ticket
            </Button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <Card className="p-4">
              <CardHeader className="pb-6">
                <CardTitle className="text-3xl">Criar um Ticket</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-3">
                    <Label htmlFor="address" className="text-lg">
                      Endereço
                    </Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="Coloque seu endereço e setor/sala"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      required
                      className="text-base h-12"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-lg">
                      Descrição
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva seu problema em detalhes..."
                      rows={6}
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      required
                      className="text-base"
                    />
                  </div>
              
                  <div className="space-y-3">
                    <Label htmlFor="urgency_level" className="text-lg">
                      Nível de urgência
                    </Label>
                    <Select onValueChange={(value) => handleInputChange("urgency_level", value)} required>
                      <SelectTrigger className="text-base h-12">
                        <SelectValue placeholder="Selecione o nível de urgência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Baixo" className="text-base">
                          Baixo
                        </SelectItem>
                        <SelectItem value="Médio" className="text-base">
                          Médio
                        </SelectItem>
                        <SelectItem value="Alto" className="text-base">
                          Alto
                        </SelectItem>
                        <SelectItem value="Crítico" className="text-base">
                          Crítico
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Button type="submit" className="flex-1 text-lg h-12">
                      Criar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowTicketForm(false)}
                      className="flex-1 text-lg h-12"
                    >
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
