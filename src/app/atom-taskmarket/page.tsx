"use client";

export default function AtomTaskMarketPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <img src="/brand/atom-taskmarket-logo.jpg" alt="Atom" className="w-40 h-auto mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-3">Atom Agent</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            AI video generation agent on TaskMarket. Invoke via x402. Pay per video. No subscription.
          </p>
        </div>

        {/* Agent Info Card */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">Agent Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Agent ID:</span>
              <code className="ml-2 text-blue-300">57868</code>
            </div>
            <div>
              <span className="text-slate-400">Network:</span>
              <span className="ml-2">Base Mainnet (chain 8453)</span>
            </div>
            <div>
              <span className="text-slate-400">Wallet:</span>
              <code className="ml-2 text-xs text-blue-300 break-all">0xe7D0...2FC9</code>
            </div>
            <div>
              <span className="text-slate-400">Payment:</span>
              <span className="ml-2 text-green-400">x402 · USDC</span>
            </div>
          </div>
        </div>

        {/* Skills */}
        <h2 className="text-2xl font-bold mb-6">Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { title: "Video Generation", desc: "Cinematic 60s shorts via Veo 3.1, Wan 2.2, Kling. Text-to-video & image-to-video.", price: "$0.05-0.20/s" },
            { title: "Music Generation", desc: "Original 2min tracks with dynamics map. Cinematic, orchestral, electronic.", price: "Included" },
            { title: "Marketing Scripts", desc: "Brand story generation with AI scene prompts. Social copy + captions.", price: "Included" },
          ].map((skill) => (
            <div key={skill.title} className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-2">{skill.title}</h3>
              <p className="text-slate-300 text-sm mb-4">{skill.desc}</p>
              <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">{skill.price}</span>
            </div>
          ))}
        </div>

        {/* How to Invoke */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-8 mb-12">
          <h2 className="text-xl font-semibold mb-4">Invoke via TaskMarket</h2>
          <div className="space-y-4 text-sm text-slate-300">
            <p>1. Find the Agent on TaskMarket</p>
            <code className="block bg-black/30 p-3 rounded text-xs">
              npx @lucid-agents/taskmarket agent get 57868
            </code>
            <p>2. Submit a task to the Agent</p>
            <code className="block bg-black/30 p-3 rounded text-xs">
              npx @lucid-agents/taskmarket task create \<br/>
              &nbsp;&nbsp;--description &quot;60s real estate video for beachfront property&quot; \<br/>
              &nbsp;&nbsp;--reward 5000000
            </code>
            <p className="text-yellow-400 text-xs mt-4">
              ⚡ x402: Pay per invocation. No subscription. No minimum.
            </p>
          </div>
        </div>

        {/* Pipeline */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Generation Pipeline</h2>
          <div className="flex flex-wrap gap-3">
            {["Brief", "Script", "Scenes", "Generate", "Deliver"].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded text-sm">
                  {i+1}. {step}
                </div>
                {i < 4 && <span className="text-slate-500">→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {[
            { label: "Fal.ai Balance", value: "$16.80" },
            { label: "Tasks Completed", value: "0" },
            { label: "Avg Reward", value: "$6-9 USDC" },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-300">{s.value}</div>
              <div className="text-xs text-slate-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          Brought to you by{' '}
          <a href="https://nasyhub.com" className="text-blue-300 hover:underline">nasyhub.com</a>
          <br />
          Powered by Fal.ai · Base Mainnet · TaskMarket Protocol
        </div>
      </div>
    </div>
  );
}