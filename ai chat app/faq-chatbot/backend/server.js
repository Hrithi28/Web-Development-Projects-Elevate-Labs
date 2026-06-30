require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ─── FAQ Knowledge Base ───────────────────────────────────────────────────────
const faqData = [
  {
    id: 1,
    category: "General",
    question: "What is this chatbot?",
    keywords: ["chatbot", "what is", "about", "purpose", "this bot", "who are you"],
    answer:
      "I'm an AI-powered FAQ chatbot built to answer your questions instantly. I use a keyword-matching engine combined with AI to understand and respond to your queries accurately.",
  },
  {
    id: 2,
    category: "Account",
    question: "How do I create an account?",
    keywords: ["create account", "sign up", "register", "new account", "join", "get started"],
    answer:
      "To create an account, click the 'Sign Up' button on the top right, fill in your name, email, and password, then verify your email. You'll be ready to go in under a minute!",
  },
  {
    id: 3,
    category: "Account",
    question: "I forgot my password. How do I reset it?",
    keywords: ["forgot password", "reset password", "change password", "lost password", "recover"],
    answer:
      "Click 'Forgot Password' on the login page, enter your registered email, and we'll send you a reset link. The link is valid for 30 minutes. Check your spam folder if you don't see it.",
  },
  {
    id: 4,
    category: "Billing",
    question: "What payment methods do you accept?",
    keywords: ["payment", "pay", "credit card", "debit", "billing", "invoice", "upi", "stripe"],
    answer:
      "We accept all major credit/debit cards (Visa, Mastercard, Amex), UPI, Net Banking, and PayPal. All transactions are secured with 256-bit SSL encryption.",
  },
  {
    id: 5,
    category: "Billing",
    question: "How do I cancel my subscription?",
    keywords: ["cancel", "unsubscribe", "stop subscription", "end plan", "refund"],
    answer:
      "You can cancel anytime from Settings → Subscription → Cancel Plan. Your access continues until the end of the billing period. For refunds within 7 days of purchase, contact our support team.",
  },
  {
    id: 6,
    category: "Technical",
    question: "Why is the app not loading?",
    keywords: ["not loading", "app down", "error", "broken", "crash", "not working", "slow", "bug"],
    answer:
      "Try these steps: 1) Clear browser cache & cookies, 2) Disable browser extensions, 3) Try a different browser, 4) Check your internet connection. If the issue persists, contact support with your browser version.",
  },
  {
    id: 7,
    category: "Technical",
    question: "Is my data secure?",
    keywords: ["security", "data safe", "privacy", "secure", "encryption", "gdpr", "protected"],
    answer:
      "Absolutely. We use AES-256 encryption for stored data and TLS 1.3 for data in transit. We are GDPR compliant and never sell your data to third parties. Read our full Privacy Policy for details.",
  },
  {
    id: 8,
    category: "Features",
    question: "What features are available in the free plan?",
    keywords: ["free plan", "free tier", "free features", "without paying", "free version", "trial"],
    answer:
      "The free plan includes: up to 5 projects, 1GB storage, basic analytics, community support, and access to all core features. Upgrade to Pro for unlimited projects, advanced analytics, and priority support.",
  },
  {
    id: 9,
    category: "Features",
    question: "Can I use this on mobile?",
    keywords: ["mobile", "phone", "android", "ios", "app", "tablet", "responsive"],
    answer:
      "Yes! Our platform is fully responsive and works great on all devices. We also have native apps for iOS (App Store) and Android (Google Play) for the best mobile experience.",
  },
  {
    id: 10,
    category: "Support",
    question: "How do I contact customer support?",
    keywords: ["contact", "support", "help", "email", "live chat", "ticket", "reach out"],
    answer:
      "You can reach us via: Live Chat (available 9am–9pm IST), Email at support@example.com (response within 24 hours), or raise a support ticket from your dashboard under Help → New Ticket.",
  },
  {
    id: 11,
    category: "General",
    question: "Do you offer a free trial?",
    keywords: ["trial", "try", "demo", "test", "free trial", "sample"],
    answer:
      "Yes! We offer a 14-day free trial of our Pro plan with no credit card required. You'll get full access to all premium features so you can decide if it's right for you.",
  },
  {
    id: 12,
    category: "Features",
    question: "How do I export my data?",
    keywords: ["export", "download data", "backup", "csv", "pdf export", "extract"],
    answer:
      "Go to Settings → Data Management → Export. You can export your data as CSV, JSON, or PDF. Large exports may take a few minutes and you'll receive a download link via email.",
  },
];

// ─── Unanswered Queries Log ───────────────────────────────────────────────────
const unansweredQueries = [];

// ─── Keyword Matching Engine ──────────────────────────────────────────────────
function findFAQMatch(userMessage) {
  const msg = userMessage.toLowerCase().trim();
  let bestMatch = null;
  let bestScore = 0;

  for (const faq of faqData) {
    let score = 0;
    for (const keyword of faq.keywords) {
      if (msg.includes(keyword.toLowerCase())) {
        score += keyword.split(" ").length; // multi-word keywords score higher
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  return bestScore > 0 ? { faq: bestMatch, score: bestScore } : null;
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET all FAQs
app.get("/api/faqs", (req, res) => {
  const categories = [...new Set(faqData.map((f) => f.category))];
  res.json({ faqs: faqData, categories });
});

// POST chat message
app.post("/api/chat", async (req, res) => {
  const { message, conversationHistory = [] } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  // 1. Try keyword matching first
  const matchResult = findFAQMatch(message);

  if (matchResult && matchResult.score >= 2) {
    return res.json({
      answer: matchResult.faq.answer,
      source: "faq",
      matchedQuestion: matchResult.faq.question,
      category: matchResult.faq.category,
      confidence: Math.min(Math.round((matchResult.score / 5) * 100), 98),
    });
  }

  // 2. Fall back to Claude AI
  try {
    const systemPrompt = `You are a helpful FAQ chatbot assistant. Answer user questions concisely and helpfully. 
    
    You have access to the following FAQ knowledge base:
    ${faqData.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}
    
    If the question is covered in the FAQ, use that answer. If not, provide a helpful general response and suggest contacting support for specific issues. Keep answers under 3 sentences.`;

    const messages = [
      ...conversationHistory.slice(-6), // keep last 6 messages for context
      { role: "user", content: message },
    ];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) throw new Error("AI API error");

    const data = await response.json();
    const answer = data.content[0]?.text || "I'm not sure about that. Please contact our support team.";

    return res.json({ answer, source: "ai", confidence: 85 });
  } catch (err) {
    // Log unanswered query
    unansweredQueries.push({ message, timestamp: new Date().toISOString() });

    return res.json({
      answer:
        "I couldn't find a specific answer to your question. Please contact our support team at support@example.com or use the live chat during business hours (9am–9pm IST).",
      source: "fallback",
      confidence: 0,
    });
  }
});

// POST feedback
app.post("/api/feedback", (req, res) => {
  const { messageId, helpful, message } = req.body;
  // In production, store to DB. Here we log it.
  console.log(`Feedback: messageId=${messageId}, helpful=${helpful}, query="${message}"`);
  if (!helpful) {
    unansweredQueries.push({ message, timestamp: new Date().toISOString(), reason: "negative_feedback" });
  }
  res.json({ success: true });
});

// GET unanswered queries (admin endpoint)
app.get("/api/admin/unanswered", (req, res) => {
  res.json({ queries: unansweredQueries });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ FAQ Chatbot server running on http://localhost:${PORT}`));
