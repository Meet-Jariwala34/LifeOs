import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen w-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-100 selection:bg-indigo-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent_50%)] pointer-events-none" />

      <div className="text-center max-w-md relative z-10">
        {/* Animated Warning Icon */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-flex p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl mb-6 shadow-[0_0_30px_rgba(244,63,94,0.1)]"
        >
          <AlertTriangle className="w-12 h-12" />
        </motion.div>

        {/* Error Text */}
        <motion.h1 
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-7xl font-black font-mono tracking-tighter text-zinc-300 mb-2"
        >
          404
        </motion.h1>
        
        <motion.h3 
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl font-bold text-white mb-3"
        >
          System Path Missing
        </motion.h3>

        <motion.p 
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-sm text-zinc-500 font-medium mb-8 leading-relaxed"
        >
          The resource sequence or layout you are trying to access does not exist or has been shifted permanently.
        </motion.p>

        {/* Action Button */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <a 
            href="/" 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-sm font-semibold text-zinc-200 rounded-xl transition-all shadow-lg active:scale-95 group"
          >
            <ArrowLeft className="w-4 h-4 text-zinc-500 group-hover:-translate-x-0.5 transition-transform" />
            Return to Terminal
          </a>
        </motion.div>
      </div>
    </div>
  );
}