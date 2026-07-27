export default function Faq() {
  const faqs = [
    { question: "Do you offer wholesale price?" },
    { question: "Do you ship across india?" },
    { question: "Can i mix 2 colors to create custom color?" },
    { question: "How can i become AtoZ distributer?" },
    { question: "What is your order processing time ?" },
    { question: "Where is AtoZ Colours located?" },
    { question: "Is technical support available?" },
  ]

  return (
    <div className="py-24 bg-white w-full">
      <div className="content-container max-w-4xl mx-auto flex flex-col items-center">
        <h2 className="text-4xl font-bold text-slate-900 mb-8 px-8 py-3 bg-slate-900 text-white rounded-full">
          FAQ
        </h2>

        <div className="w-full flex flex-col border-t border-slate-200 mt-8">
          {faqs.map((faq, idx) => (
            <div key={idx} className="flex items-center justify-between py-6 border-b border-slate-200 cursor-pointer hover:bg-slate-50 px-4 transition-colors">
              <div className="flex items-center gap-4">
                <span className="text-slate-400 text-xl">📦</span>
                <span className="text-slate-800 font-semibold">{faq.question}</span>
              </div>
              <span className="text-slate-400 font-bold">⌄</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
