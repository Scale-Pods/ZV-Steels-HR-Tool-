"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Phone, Loader2 } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

interface User {
  PhoneNumber: string
  Name: string
}

export default function WhatsAppChatPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      console.log("[v0] Fetching user list...")

      const response = await fetch(`${process.env.NEXT_PUBLIC_WEBHOOK_URL || "https://n8n.srv1010832.hstgr.cloud/webhook"}/${process.env.NEXT_PUBLIC_WEBHOOK_CHAT_DATA || "get-chat-data"}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // Empty body to get user list
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] User list received:", data)

      let userList: User[] = []

      if (data && typeof data === "object" && Array.isArray(data.users)) {
        console.log("[v0] Processing users array from data.users, count:", data.users.length)
        userList = data.users
          .filter((item: any) => item.PhoneNumber && item.Name)
          .map((item: any) => ({
            PhoneNumber: String(item.PhoneNumber),
            Name: item.Name,
          }))
        console.log("[v0] Filtered user list from data.users:", userList)
      } else if (Array.isArray(data)) {
        console.log("[v0] Processing direct array of users, count:", data.length)
        userList = data
          .filter((item) => item.PhoneNumber && item.Name)
          .map((item) => ({
            PhoneNumber: String(item.PhoneNumber),
            Name: item.Name,
          }))
        console.log("[v0] Filtered user list from direct array:", userList)
      } else if (data && typeof data === "object" && data.PhoneNumber && data.Name) {
        // If it's a single object with PhoneNumber and Name, convert to array
        console.log("[v0] Processing single user object")
        userList = [
          {
            PhoneNumber: String(data.PhoneNumber),
            Name: data.Name,
          },
        ]
        console.log("[v0] Converted single object to array:", userList)
      } else {
        console.error("[v0] Unexpected response format:", data)
        toast.error("Unexpected response format from server")
        return
      }

      // Remove duplicates based on PhoneNumber
      const uniqueUsers = Array.from(new Map(userList.map((user) => [user.PhoneNumber, user])).values())
      console.log("[v0] Unique users after deduplication:", uniqueUsers.length)

      setUsers(uniqueUsers)
      console.log("[v0] Final user list set to state:", uniqueUsers)
    } catch (error) {
      console.error("[v0] Error fetching users:", error)
      toast.error("Failed to load user list. Please try again.")
    } finally {
      setIsLoading(false)
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
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">WhatsApp Chat</h1>
          <p className="mt-1 text-sm text-muted-foreground">View and manage your WhatsApp conversations</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">WhatsApp Chat</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and manage your WhatsApp conversations ({users.length}{" "}
          {users.length === 1 ? "conversation" : "conversations"})
        </p>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Phone className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No conversations yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Link key={user.PhoneNumber} href={`/whatsapp-chat/${user.PhoneNumber}`}>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(user.Name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <CardTitle className="text-base">{user.Name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-xs">
                      <Phone className="h-3 w-3" />
                      {user.PhoneNumber}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
