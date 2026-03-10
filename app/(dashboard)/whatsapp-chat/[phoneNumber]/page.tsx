"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Loader2, Phone, User, Bot } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { format } from "date-fns"

interface ChatMessage {
  type: "user" | "bot"
  message: string
  timestamp: string
}

interface ChatData {
  row_number?: number
  PhoneNumber: string
  Name: string
  [key: string]: any // For dynamic UserMessage1, BotMessage1, etc.
}

export default function ChatDetailPage() {
  const params = useParams()
  const router = useRouter()
  const phoneNumber = params.phoneNumber as string

  const [chatData, setChatData] = useState<ChatData | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (phoneNumber) {
      fetchChatHistory()
    }
  }, [phoneNumber])

  const fetchChatHistory = async () => {
    try {
      setIsLoading(true)
      setNotFound(false)
      console.log("[v0] Fetching chat history for:", phoneNumber)

      const response = await fetch("https://n8n.srv1010832.hstgr.cloud/webhook/get-chat-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Chat history received:", data)

      // Check if it's a "not found" response
      if (data.status === "not_found") {
        console.log("[v0] Chat not found")
        setNotFound(true)
        toast.error(data.message || "No chat history found for this user.")
        return
      }

      // Parse the chat data
      setChatData(data)
      const parsedMessages = parseChatData(data)
      setMessages(parsedMessages)
    } catch (error) {
      console.error("[v0] Error fetching chat history:", error)
      toast.error("Failed to load chat history. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const parseChatData = (data: ChatData): ChatMessage[] => {
    const chatLog: ChatMessage[] = []

    // Iterate through potential message pairs (UserMessage1, BotMessage1, etc.)
    for (let i = 1; i <= 25; i++) {
      const userMessageKey = `UserMessage${i}`
      const userTimeKey = `UserMessage${i}Time`
      const botMessageKey = `BotMessage${i}`
      const botTimeKey = `BotMessage${i}Time`

      const userMessage = data[userMessageKey]
      const userTime = data[userTimeKey]
      const botMessage = data[botMessageKey]
      const botTime = data[botTimeKey]

      // Stop if both messages are empty
      if ((!userMessage || userMessage === "") && (!botMessage || botMessage === "")) {
        break
      }

      // Add user message if it exists
      if (userMessage && userMessage !== "") {
        chatLog.push({
          type: "user",
          message: userMessage,
          timestamp: userTime || "",
        })
      }

      // Add bot message if it exists
      if (botMessage && botMessage !== "") {
        chatLog.push({
          type: "bot",
          message: botMessage,
          timestamp: botTime || "",
        })
      }
    }

    console.log("[v0] Parsed messages:", chatLog)
    return chatLog
  }

  const cleanMarkdown = (text: string): string => {
    // Remove ** characters used for bold formatting in markdown
    return text.replace(/\*\*/g, "")
  }

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return ""
    try {
      const date = new Date(timestamp)
      return format(date, "MMM d, h:mm a")
    } catch {
      return timestamp
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link href="/whatsapp-chat">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Chats
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (notFound || !chatData) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link href="/whatsapp-chat">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Chats
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Phone className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No messages yet</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Link href="/whatsapp-chat">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Chats
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(chatData.Name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg">{chatData.Name}</CardTitle>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {chatData.PhoneNumber}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p>No messages in this conversation yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex gap-3 ${msg.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback
                      className={
                        msg.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }
                    >
                      {msg.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={`flex flex-col gap-1 max-w-[70%] ${msg.type === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        msg.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{cleanMarkdown(msg.message)}</p>
                    </div>
                    {msg.timestamp && (
                      <span className="text-xs text-muted-foreground px-2">{formatTimestamp(msg.timestamp)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
