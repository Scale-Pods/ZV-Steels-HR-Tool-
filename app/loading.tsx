"use client"

import { Loader } from "@/components/ui/loader"
import { motion } from "framer-motion"

export default function Loading() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950"
    >
      <Loader />
    </motion.div>
  )
}
