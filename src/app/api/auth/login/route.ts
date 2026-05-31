import { prisma } from "@/lib/prisma"
import { NextResponse, NextRequest } from "next/server"
import { PublicKey } from "@solana/web3.js"
import { ed25519 } from "@noble/curves/ed25519"
import { sha256 } from "@noble/hashes/sha256"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required")
}

export async function POST(request: NextRequest) {
  try {
    const { publicKey, signature, message } = await request.json()

    // Input validation
    if (!publicKey || typeof publicKey !== "string") {
      return NextResponse.json(
        { error: "publicKey is required" },
        { status: 400 }
      )
    }
    if (!signature || !Array.isArray(signature)) {
      return NextResponse.json(
        { error: "signature is required" },
        { status: 400 }
      )
    }
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      )
    }

    // Verify wallet address format
    const walletPubkey = new PublicKey(publicKey)

    // Verify signature
    const messageBytes = new TextEncoder().encode(message)
    const signatureBytes = new Uint8Array(signature)
    const publicKeyBytes = walletPubkey.toBytes()

    const isValid = ed25519.verify(signatureBytes, messageBytes, publicKeyBytes)

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      )
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        wallets: {
          some: {
            address: publicKey,
          },
        },
      },
      include: { wallets: true },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          wallets: {
            create: {
              address: publicKey,
            },
          },
        },
        include: { wallets: true },
      })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    })

    return NextResponse.json({ user: { id: user.id }, token })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    )
  }
}
