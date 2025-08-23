"use client"

import React, { useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Send, User } from "lucide-react"

interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
  isSupport: boolean
}

export default function TicketChatPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = (params as any)?.ticketId as string

  const [ticket, setTicket] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const socketRef = useRef<Socket | null>(null)

  // Fetch ticket once when ticketId changes
  useEffect(() => {
    let mounted = true

    async function fetchTicket() {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:3001/ticket/${ticketId}`)
        const data = await response.json()

        if (mounted && data) {
          setTicket(data)
        }
      } catch (error) {
        console.error("Failed to fetch ticket:", error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    if (ticketId) fetchTicket()

    // Example messages only for development / empty state
    const exampleMessages: Message[] = [
      {
        id: "1",
        sender: "Cliente",
        content: "Olá, estou com problemas na minha conexão de internet. A velocidade está muito baixa.",
        timestamp: "10:30",
        isSupport: false,
      },
      {
        id: "2",
        sender: "Suporte",
        content:
          "Olá! Obrigado por entrar em contato. Vou verificar sua conexão. Pode me informar qual velocidade está medindo?",
        timestamp: "10:35",
        isSupport: true,
      },
    ]

    // Set examples only if there are no messages yet
    setMessages((prev) => (prev.length === 0 ? exampleMessages : prev))

    return () => {
      mounted = false
    }
  }, [ticketId])

  // Helpers to normalize sender label and detect support
  const senderLabelFromPayload = (sender: any) => {
    if (!sender) return "Usuário"
    if (typeof sender === "string") return sender
    if (typeof sender === "object") {
      if (typeof sender.name === "string") return sender.name
      const role = (sender.role || sender.rule || "").toLowerCase()
      if (role === "support" || role === "suporte") return "Suporte"
      if (role === "client" || role === "cliente") return "Cliente"
      if (sender.id) return `User:${String(sender.id).slice(-4)}`
    }
    return "Usuário"
  }

  const isSenderSupport = (sender: any) => {
    if (!sender) return false
    if (typeof sender === "string") {
      const lower = sender.toLowerCase()
      return lower.includes("suport") || lower.includes("support")
    }
    if (typeof sender === "object") {
      const role = (sender.role || sender.rule || "").toString().toLowerCase()
      return role === "support" || role === "suporte"
    }
    return false
  }

  // Socket setup: create on mount and cleanup on unmount or ticketId change
  useEffect(() => {
    if (!ticketId) return

    // create a new socket for this page
    const s = io("http://localhost:3001", {
      autoConnect: true,
      // you can add auth/token here: transports: ["websocket"], auth: { token }
    })
    socketRef.current = s

    const onConnect = () => {
      console.log("Socket connected:", s.id)
      s.emit("joinRoom", ticketId)

      s.emit("initConversation", {
        conversationId: ticketId,
        ticket: ticket
          ? {
              _id: ticket._id,
              description: ticket.description,
              address: ticket.address,
              urgency_level: ticket.urgency_level,
              status: ticket.status,
              createdAt: ticket.createdAt,
            }
          : { _id: ticketId },
        user: ticket?.user_id,
      })
    }

    s.on("chatHistory", (messages: any[]) => {
      setMessages(
        messages.map((msg) => ({
          id: msg._id || String(Date.now()),
          sender: senderLabelFromPayload(msg.sender),
          content: msg.content,
          timestamp: new Date(msg.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isSupport: isSenderSupport(msg.sender),
        }))
      )
    })

    const onChatHistory = (messages: any[]) => {
      setMessages(
        messages.map((msg) => ({
          id: msg._id || String(Date.now()),
          sender: senderLabelFromPayload(msg.sender),
          content: msg.content,
          timestamp: new Date(msg.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isSupport: isSenderSupport(msg.sender),
        }))
      )
    }

    s.on("chatHistory", onChatHistory)


    const onMessage = (msg: any) => {
      // msg.sender can be a string or an object { id, role, name }
      const senderLabel = senderLabelFromPayload(msg.sender)
      const supportFlag = isSenderSupport(msg.sender)

      const newMsg: Message = {
        id: String(Date.now()),
        sender: senderLabel,
        content: msg.content,
        timestamp: new Date(msg.created_at || Date.now()).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isSupport: supportFlag,
      }

      setMessages((prev) => [...prev, newMsg])
    }

    const onDisconnect = () => {
      console.log("Socket disconnected")
    }

    s.on("connect", onConnect)
    s.on("message", onMessage)
    s.on("disconnect", onDisconnect)

    // cleanup
    return () => {
      s.off("connect", onConnect)
      s.off("chatHistory", onChatHistory)
      s.off("message", onMessage)
      s.off("disconnect", onDisconnect)
      // disconnect socket created for this page
      try {
        s.disconnect()
      } catch (e) {
        /* ignore */
      }
      if (socketRef.current === s) socketRef.current = null
    }
  }, [ticketId, ticket])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    // build sender payload: prefer id + role object
    const senderPayload = ticket?.user_id
      ? { id: ticket.user_id, role: "client", name: ticket?.user_id?.name }
      : { role: "client" }

    socketRef.current?.emit("chatMessage", {
      conversationId: ticketId,
      sender: senderPayload,
      content: newMessage.trim(),
    })

    // optimistic UI: local message (client -> isSupport = false)
    const message: Message = {
      id: Date.now().toString(),
      sender: senderLabelFromPayload(senderPayload),
      content: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isSupport: false,
    }

    setNewMessage("")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-xl">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b bg-card">
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.replace("/admin")} size="lg" className="text-base">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Voltar
            </Button>
            <h1 className="text-3xl font-semibold text-foreground">Chat - Ticket {ticketId}</h1>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-8 py-8 max-w-4xl">
        {/* Ticket Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Informações do Ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-base font-medium">ID do Ticket:</Label>
                <p className="text-lg mt-1">{ticketId}</p>
              </div>
              <div>
                <Label className="text-base font-medium">Proprietário:</Label>
                <p className="text-lg mt-1">{ticket?.user_id?.name || "Não encontrado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold">Mensagens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 max-h-96 overflow-y-auto px-2">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isSupport ? "justify-start" : "justify-end"}`}>
                  <div className={`flex items-start gap-4 max-w-[70%] ${message.isSupport ? "flex-row" : "flex-row-reverse"}`}>
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{message.isSupport ? "S" : <User className="h-6 w-6" />}</AvatarFallback>
                    </Avatar>

                    <div className={`rounded-xl p-5 ${message.isSupport ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"} shadow-md`}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl font-semibold">{message.sender}</span>
                        <span className="text-base opacity-70">{message.timestamp}</span>
                      </div>
                      <p className="text-lg leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Message Input */}
        <Card>
          <CardContent className="p-5">
            <form onSubmit={handleSendMessage} className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="text-lg h-16 px-4"
                />
              </div>
              <Button type="submit" size="lg" className="h-16 px-8" disabled={!newMessage.trim()}>
                <Send className="mr-3 h-6 w-6" />
                Enviar
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
