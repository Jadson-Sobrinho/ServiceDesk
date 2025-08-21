"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, LogOut, ArrowLeft, Search } from "lucide-react"


export default function ServiceDeskPage() {
  const [userInfo, setUserInfo] = useState<any>(null)
  const [tickets, setTickets] = useState<any[]>([])
  const [selectedTicket, setSelectedTicket] = useState<(typeof tickets)[0] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [urgencyFilter, setUrgencyFilter] = useState("all")
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [formData, setFormData] = useState({
    address: "",
    description: "",
    urgency: "",
  })

useEffect(() => {
  async function search() {
    try {
      const response = await fetch("http://localhost:3001/ticket");
      const data = await response.json();
      setTickets(data);   
    } catch (error) {
      console.error(error);
    }
  }
  search();

  async function getProfile() {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch("http://localhost:3001/auth/me", {
        headers: {'Authorization': 'Bearer ' + token}

      });

      console.log(response);

      if(!response.ok) {
        throw new Error('Faild to search user info.');
      }
      const userInfo = await response.json();
      setUserInfo(userInfo);
      console.log(userInfo);

      return userInfo;
    } catch (error) {
       console.error('Faild to load user info:', error);
    }
  }

  getProfile();
}, []);


const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.user_id.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesUrgency = urgencyFilter === "all" || ticket.urgency_level === urgencyFilter

    return matchesSearch && matchesUrgency
  })


  const handleStatusUpdate = async (status: string) => {
    const token = localStorage.getItem('authToken');
    if (selectedTicket) {
      try {
        const response = await fetch("http://localhost:3001/ticket/status", {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({
            _id: selectedTicket._id,
            status: status
          })
        });

        if (!response.ok) {
          throw new Error('Faild to update ticket status.');
        }
      } catch (error) {
        console.error('Faild to update ticket status:', error);
      }
      setSelectedTicket(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Ticket submitted:", formData)
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

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="flex items-center justify-between px-8 py-6">
          <h1 className="text-3xl font-semibold text-foreground">ServiceDeskBA</h1>

          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Procurar por tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-base h-12"
              />
            </div>
          </div>

          {/* User Avatar with Modal */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="p-0">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/profile-icon.png?height=48&width=48" />
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
                    <p className="font-medium text-lg">{userInfo?.name}</p>
                    <p className="text-base text-muted-foreground">{userInfo?.email}</p>
                  </div>
                </div>
                <Button variant="destructive" className="w-full text-base" size="lg" 
                  onClick={() => {
                    localStorage.removeItem("atuhToken");
                    window.location.href = '/'
                  }}>
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-8 py-12">
        {selectedTicket ? (
          // Ticket Details View
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-6 mb-8">
              <Button variant="ghost" onClick={() => setSelectedTicket(null)} size="lg" className="text-base">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Voltar
              </Button>
              <h2 className="text-4xl font-semibold">Detalhes do Ticket</h2>
            </div>

            <Card className="p-6">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-3xl">{selectedTicket._id}</CardTitle>
                  <div className="flex gap-3">
                    <Badge className={`text-base px-4 py-2 ${getUrgencyClass(selectedTicket.urgency_level)}`}>
                      {selectedTicket.urgency_level}
                    </Badge>
                    <Badge className={`text-base px-4 py-2 ${getStatusClass(selectedTicket.status)}`}>
                      {selectedTicket.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-lg font-medium">Nome:</Label>
                      <p className="text-xl mt-2">{selectedTicket.user_id.name}</p>
                    </div>
                    <div>
                      <Label className="text-lg font-medium">Endereço:</Label>
                      <p className="text-xl mt-2">{selectedTicket.address}</p>
                    </div>
                    <div>
                      <Label className="text-lg font-medium">Criado em:</Label>
                      <p className="text-xl mt-2">{selectedTicket.createdAt}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-lg font-medium">Descrição:</Label>
                    <p className="text-xl mt-2 leading-relaxed">{selectedTicket.description}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-8 border-t">
                  <Button
                    onClick={() => handleStatusUpdate("Em andamento")}
                    className="flex-1 text-lg h-14 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Em andamento
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate("Concluído")}
                    className="flex-1 text-lg h-14 bg-green-500 hover:bg-green-600 text-white"
                  >
                    Concluído
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate("Cancelado")}
                    className="flex-1 text-lg h-14 bg-red-500 hover:bg-red-600 text-white"
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Tickets List View
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-semibold">Todos os Tickets</h2>

              {/* Urgency Filter Dropdown */}
              <div className="flex items-center gap-4">
                <Label htmlFor="urgency-filter" className="text-lg font-medium">
                  Filtrar por urgência:
                </Label>
                <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                  <SelectTrigger className="w-48 h-12 text-base">
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Urgências</SelectItem>
                    <SelectItem value="Crítico">Crítico</SelectItem>
                    <SelectItem value="Alto">Alto</SelectItem>
                    <SelectItem value="Médio">Médio</SelectItem>
                    <SelectItem value="Baixo">Baixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <Card
                  key={ticket._id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-2xl font-semibold">{ticket._id}</h3>
                          <Badge className={`text-base px-4 py-2 ${getUrgencyClass(ticket.urgency_level)}`}>
                            {ticket.urgency_level}
                          </Badge>
                          <Badge className={`text-base px-4 py-2 ${getStatusClass(ticket.status)}`}>
                            {ticket.status}
                          </Badge>
                        </div>
                        <p className="text-xl font-medium text-primary mb-2">{ticket.user_id.name}</p>
                        <p className="text-base text-muted-foreground mb-2">{ticket.address}</p>
                        <p className="text-base line-clamp-2">{ticket.description}</p>
                        <p className="text-sm text-muted-foreground mt-3">Criado em: {ticket.createdAt}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTickets.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">Nenhum ticket foi encontrato para sua pesquisa.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
